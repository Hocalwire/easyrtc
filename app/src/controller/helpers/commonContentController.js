"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var Utils = require("src/libs/Utils");
var url = require("url");


var logger = require('src/libs/logger');
var dateFormat = require('dateformat');


function getAutoCompleteData(req,response,newsId,ignoreCatLinks){
  var partner = req.partner;

    var data = {};
    for(var k in response.rdRows){
        var id = response.rdRows[k].id;
        // data['name_display'] = data['heading'] || data.name || data.company_name;
        // data['url'] = data['url'];
        var id = response.rdRows[k].id;
        if(id==newsId){
          data = response.rdRows[k];
          break;
        }
    }
    return data;
}

function getData(req,response,newsId,ignoreCatLinks){
    var partner = req.partner;

    var data = {};
    for(var k in response.rdRows){
        
        var id = response.rdRows[k].id;
        if(id==newsId){
          data = response.rdRows[k];
          break;
        }
    }
    data['title'] = data['heading'] || data.name || data.company_name;
    data['title'] = Utils.firstCapitalizeSentence(data['title']);
    
    if(req.environment.partnerData.doNotShowDescriptionInSocialShare){
        data["socialDescription"] = "no_social";
    }
    if(data['otherCategories'] && data['otherCategories']!="null"){
      data['otherCategories'] = data['otherCategories'].split(",");
    } else {
      data['otherCategories'] = [];
    }
    var story = data['story'];
    if(story) {
      data['story'] = story
      if(req.environment.partnerData.postContentAdInsertRange){
        data['story'] = Utils.getDetailedStoryContent(data['story'],(req.environment.partnerData.postContentAdInsertRange || 200),(req.environment.partnerData.no_of_ads_inside_post || 4));  
      }
    } else {
      data['story'] = data['description'];
    }
    
    data['userStory']=true;

    var mediaIds = data["mediaIds"];
    if(!mediaIds){
      mediaIds = data['imageId'];
    }
    if(mediaIds && mediaIds!="null") {
      data["mediaIds"] = mediaIds.split(",");
    } else {
      data["mediaIds"] = [];
    }
    data['mediaCount'] = data["mediaIds"].length;
    data['mediaCaptions'] = [];
    data['mediaAltTexts'] = [];
    data['mediaOtherInfos'] = [];
    if(data.mediaCount>0){
        for(var i=0;i<data.mediaCount;i++){
            data['mediaAltTexts'].push(response.getRDMProperty(newsId,"alt_text_"+i));
            data['mediaCaptions'].push(response.getRDMProperty(newsId,"caption_"+i));
            data['mediaOtherInfos'].push(response.getRDMProperty(newsId,"extra_info_"+i));
        }
    } 
    if(!data['mainImageAlt'] && data['mediaAltTexts'].length>0){
        data['mainImageAlt'] =  data['mediaAltTexts'][0]; 
    }
    if(!data['mainImageCaption'] && data['mediaCaptions'].length>0){
        data['mainImageCaption'] =  data['mediaCaptions'][0]; 
    }
    var env = req.environment;
    data["mediaType"] = data.mediaIds && data.mediaIds.length ? Utils.getMediaType(data.mediaIds[0])  : "image";
    data['mediaUrl'] = data["mediaType"]=="youtube" || data["mediaType"]=="external" || data["mediaType"]=="externalNoProtocol" ? Utils.getMediaUrl(data) : Utils.getMediaUrl(data,"",req.environment.rootUrl); //env.rootUrl+
    data['partner'] = req.partner;
    data['oldPost'] = Utils.isOldPost(data);
    data['category'] = data['category'] ? data['category'].split(",")[0] : "";
    var getCatById = function(id,data){
      for(var i=0;i<data.length;i++){
        if(data[i].id==id){
          return data[i];
        }
      }
      return null;
    };
    var contentType = data['content_type'];
    var allContentData = req.environment.partnerContentData;
    var contentData;
    for(var k in allContentData){
      if(allContentData[k].props && allContentData[k].props.id==contentType){
        contentData = allContentData[k];
        break;
      }
    }
    var catData = contentData ? contentData.categories : null;
    if(catData && data['category']){
      var catObj = getCatById(catData,data['category']);
      if(catObj){
        data['categoryName'] = catObj.name;
        data['categoryUrl'] = catObj.url;   
      }
    } else {
        data['categoryName'] = contentData ? contentData.props.name : "";
        data['categoryUrl'] = contentData ? contentData.props.url : "";   
    }
    
  
    var date = data["date_content"] || data["date_buzz"];
    data['date'] = date;
    data['date_published'] = date ? Utils.getPublishedDate(date) : "";
    data['date_string'] = date;
    
    var tags = data["tags"];
    if(tags){
      var finalTags = tags.replace(/#/g , "");
    }
    if(finalTags){
      data["hashtags"] = finalTags;
      data['originalTags'] = tags;
    }
    
    data['newsUrl'] = data['url'];
    return data;
}
function addFilters(req,res,rdm){
    
    for(var k in req.query){
      if(req.query[k] instanceof Array){
        req.query[k] = req.query[k][0];
      }
    }
    for(var k in req.query){
      req.query[k] = decodeURIComponent(req.query[k]);
    }
    var q = req.query;

    var search = q.search;
    var content_type=q.content_type || req.environment.content_type;
    
    var filters = [];
    var filterForView = {};
    filterForView[content_type]={};
    
    //content_region
    //content_industry

    for(var k in q){
        if(k=="search" || k=="search_type" || k=="search_like"||k=="content_type" || k=="content_type_like" || k=="content_count" || k=="start_index" || k=="page_reload" || k=="page"){
          continue;
        }
        if(k.lastIndexOf("_")>0){
            var o = {};
            var i1 = k.lastIndexOf("_");
            o.name = k.substring(0,i1);
            o.type = k.substring(i1+1,k.length);
            if(req.environment.filtersMetaData){
              var m = req.environment.filtersMetaData;
              var id ="";
              for(var kk in m) {
                var item = m[kk];

                for(var i=0;i<item.length;i++){
                  if(m['params_map'] && m['params_map'][item[i].param_name] && m['params_map'][item[i].param_name]==o.name){
                    o.name=item[i].param_name;
                    id=item[i].id;
                    o.type=item[i].match_type;
                    break;
                  }
                  if((item[i].param_name==o.name || item[i].child_param_name==o.name) && item[i].match_type==o.type){
                    id=item[i].id;
                    break;
                  }
                }
              }
              if(id){
                o.id = id;
              }

            }
            var value = q[k];
            
            var ignoreInsert=false;
            switch(o.type){
                case "range" :
                case "RANGE" : 
                case "RANGEMONEY" : 
                    var dataA = value.split(",");
                    if(dataA.length>1){
                        o.bottom = dataA[0];
                        o.top = dataA[1];
                        o.value = o.bottom+","+o.top;
                    }
                    break;
                case "DISPLAY":
                  ignoreInsert=true;
                  var mm = filterForView[content_type][o.name];
                  
                  if(mm){
                    mm['value_display'] = Utils.replaceHtmlEntities(decodeURIComponent(value));
                  }
                  break;
                default: 
                    o.value = value;
                    break;
            }
            if(!ignoreInsert){
              filterForView[content_type][o.name] = o;
              filters.push(o);
            }

            
        }

    }
    if(search!=undefined){
      var a = {"name" : "search","type":"like","value":search};
      filterForView[content_type]["search"] = a;
      rdm.setRDMProperty("1","searchString",search); 
      rdm.setRDMProperty("1","searchType","all");
      req.environment.listingPageType="search";
      if(!req.query.search_type){
            req.query.search_type = "all";
      }

      
      req.environment.query = req.query;
  
    }
    var ooo = {};
    ooo[content_type] = req.query;

    var a = {"filters" : filters};
    rdm.setRDMProperty("1","filterString",JSON.stringify(a));
    req.environment.filterForView = filterForView;
};
function parseFilterData(req,res,rdm,contentType){
    var d = {};
    for(var k in rdm.rdRows){
        var item = rdm.rdRows[k];
        var id = item.id;
        var dataCount = item.options_count;
        
        item.content_type = contentType;
        item.param_display_name = item.display_name;
        if(item.auto_complete_type){
          item.auto_complete_content_type = item.auto_complete_type;
        } else {
          item.auto_complete_content_type = contentType;
        }
        
        var data = [];
        if(dataCount>0){
            
            for(var i=0;i<dataCount;i++){
                data.push(rdm.rdRows[k]["options_"+i]);
            }
        }
        item.data = data;

        if(!d[item.input_type]){
            d[item.input_type]=[];
        }
        d[item.input_type].push(item);
        
        
    }
    for(var k in rdm.rdRows){
        var item = rdm.rdRows[k];
        d[item.input_type] = d[item.input_type].sort(function(a,b){
              var a1 = a.sorting_order ? a.sorting_order :1;
              var b1 = b.sorting_order ? b.sorting_order : 1;
              if(a1!=b1){
                  return a1-b1;
              } else {
                  return a.name > b.name ? 1 : -1;
              }
        });
    }
    d['content_type'] = contentType;
    
    return d;
};
function getContentItem(req,content_name,contentId){
    var data = req.environment.partnerContentData;
    var items=[];
    if(data[content_name] && data[content_name]["preloadData"] && data[content_name]["preloadData"].length){
        items = data[content_name]["preloadData"];
    }
    var item;
    for(var i=0;i<items.length;i++){
        if(items[i].id==contentId){
            item=items[i];
            break;
        }
    }
    return item;
}
function updateContentItem(req,content_name,item,isremove){
    var data = req.environment.partnerContentData;
    var items=[];
    if(data[content_name] && data[content_name]["preloadData"] && data[content_name]["preloadData"].length){
        items = data[content_name]["preloadData"];
    }
    if(!items || !items.length) {
        return false;
    }
    if(isremove){
        var index = -1;
        for(var i=0;i<items.length;i++){
            if(items[i].id==item.id){
                index=i;
                break;
            }
        }
        if(index>-1){
            items.splice(index);    
        }
        
        return true;
    } 
    var updated = false;
    for(var i=0;i<items.length;i++){
        if(items[i].id==item.id){
            for(var  k in item){
                items[i][k] = item[k];
            }
            updated=true;
            break;
        }
    }
    if(!updated){
        var o={};
        for(var  k in item){
            o[k] = item[k];
        }
        items.push(o);
    }
}
function updateContentProperty(req,res,next){
  var partner = req.partner;
  var body = req.body;
  var contentId = body.contentId;
  var contentType = body.contentType;
  var contentTypeName = body.contentTypeName;
  var property = body.propertyName;
  var val = body.value;
  var methodHandler = body.methodHandler;
  
  var item = getContentItem(req,contentTypeName,contentId);
  var d = {"id":contentId};
  if(item){
      var curr=item[property];
      if(methodHandler && methodHandler=="pollData"){
        if(!curr || curr=="null"){
          curr = val;
        } else {
          curr = parseInt(curr)+val;
        }
        
        d[property]=curr;
        updateContentItem(req,contentTypeName,d,false);
        updateContentPropertyValue(req,res,next,contentType,contentTypeName,contentId,property,curr,item);
        return;
      }  else {
        if(methodHandler && methodHandler=="pollData"){
            d["yes_count"] =0;
            d["no_count"] = 0;
            d[property]=val;
        }
        updateContentItem(req,contentTypeName,d,false);
        updateContentPropertyValue(req,res,next,contentType,contentTypeName,contentId,property,val,item);
      }

  } else {
      if(methodHandler && methodHandler=="pollData"){
          d["yes_count"] =0;
          d["no_count"] = 0;
          d[property]=val;
      }
      updateContentItem(req,contentTypeName,d,false)
      updateContentPropertyValue(req,res,next,contentType,contentTypeName,contentId,property,val,d);
  }
}
function updateContentPropertyValue(req,res,next,contentType,contentTypeName,itemId,propName,propValue,item) {
    var options = { rdm : apiHelper.getURL(Constants.createContentUrl,req.partner)};
    var content_type=req.query.content_type_name || req.body.content_type_name;
    options.rdm.setRDMProperty("1","val_"+propName,propValue);
    options.rdm.setRDMAttribute("content_type_name",contentTypeName);
    options.rdm.setRDMAttribute("content_id",itemId);

    apiHelper.get(options, req, res).then(
        function(rdm){
            res.send({errorCode:rdm.getRDMAttribute('errorCode'),"data":JSON.stringify(item)});
        },function(){
            //Fail
            res.send({errorCode:-1,"data":JSON.stringify(item)});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}


module.exports.getAutoCompleteData = getAutoCompleteData;
module.exports.getData = getData;
module.exports.parseFilterData = parseFilterData;
module.exports.addFilters = addFilters;
module.exports.updateContentProperty = updateContentProperty;