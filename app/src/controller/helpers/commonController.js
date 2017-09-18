"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var Utils = require("src/libs/Utils");
var url = require("url");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');

var logger = require('src/libs/logger');
var dateFormat = require('dateformat');


function getYoutubeThumb(videoId){
    return "http://img.youtube.com/vi/"+videoId+"/sddefault.jpg";//"http://www.hocalwire.com/admin/downloadYoutubeThumb?videoId="+videoId;
};


function getData(req,response,newsId,ignoreCatLinks){
    var partner = req.partner;
    var catData = req.environment.partnerCatData;
    var env = req.environment;
    
    var data = {};
    data.isRestricted = response.getRDMProperty(newsId,"is_open") ? !(response.getRDMProperty(newsId,"is_open")=="true") :false;
    
    data["newsId"] = newsId;
    data["id"] = newsId;
    data['title'] = response.getRDMProperty(newsId,"heading");
    // data['title'] = Utils.firstCapitalizeSentence(data['title']);
    data['authorId'] = response.getRDMProperty(newsId,"authorId");
    data['description'] = response.getRDMProperty(newsId,"description");
    data['hasPaidContent'] = response.getRDMProperty(newsId,"hasPaidContent");
    data['mainImageAlt'] = response.getRDMProperty(newsId,"alt_text");
    data['mainImageCaption'] = response.getRDMProperty(newsId,"caption");
    data['category'] = response.getRDMProperty(newsId,"category");
    data['category'] = data['category'] ? data['category'].split(",")[0] : "";
    data['buzz_count'] = response.getRDMProperty(newsId,"buzz_count");
    
    if(data.authorId){
        var author = req.environment.partnerAuthorData.filter(function(item){
            return item.authorId ==data.authorId;
        });    
        // console.log("author length:"+author.length +" for author id"+data.authorId);
        if(author && author.length){
            data.author = author[0];
        }
    }

    if(env.partnerData.doNotShowDescriptionInSocialShare){
        data["socialDescription"] = "no_social";
    }
    data['otherCategories'] = response.getRDMProperty(newsId,"otherCategories");
    // console.log("other categories in RDM:"+data['otherCategories'] +" for title:"+data.title);
    if(data['otherCategories'] && data['otherCategories']!="null"){
      data['otherCategories'] = data['otherCategories'].split(",");
    } else {
      data['otherCategories'] = [];
    }

    data['categoryPriorities'] = response.getRDMProperty(newsId,"priorities");
    if(data['categoryPriorities'] && data['categoryPriorities']!="null"){
      data['categoryPriorities'] = data['categoryPriorities'].split(",");
    } else {
      data['categoryPriorities'] = [];
    }
    // console.log(data['categoryPriorities']);
    
    
    data['userStory']=true;

    var mediaIds = response.getRDMProperty( newsId,"mediaIds" );
    if(mediaIds) {
      data["mediaIds"] = mediaIds.split(",");
    } else {
      data["mediaIds"] = [];
    } 
    for(var i=0;i<mediaIds.length;i++){
        if(!mediaIds[i]){
            mediaIds.splice(i,1);
        }
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
    
    data['partner'] = req.partner;
    data['oldPost'] = Utils.isOldPost(data);
    // logger.info("data userStory"+data.userStory+"content:"+data.story);
    // data['images'] = getImages(response,newsId);
    data['source'] = response.getRDMProperty(newsId,"source");    
    data['location'] = response.getRDMProperty(newsId,"location"); 
    
    data['scope'] = response.getRDMProperty(newsId,"news_scope");
    var getCatById = function(id,data){
      for(var i=0;i<data.length;i++){
        if(data[i].id==id){
          return data[i];
        }
      }
      return null;
    };
    // if(!ignoreCatLinks){
      var catObj = getCatById(data['category'],catData);
      
      if(catObj){
        data['catObj'] = catObj;
        data['categoryName'] = catObj.name;

        data['categoryObject'] = catObj;
        data['categoryUrl'] = catObj.url;   
        if(data['otherCategories'].length){
          data["otherCatsObject"] = [];
          for(var i=0;i<data["otherCategories"].length;i++){
            var catObject = getCatById(data["otherCategories"][i],catData);
            if(catObject && catObject !="null"){
                data["otherCatsObject"].push();
            }
          }
        }
      }
      
    // }
    var ignoreImage=false;
    if(env.partnerData.category_no_image_on_post_page){
        if(data.catObj && env.partnerData.category_no_image_on_post_page==data.catObj.id){
            ignoreImage=true;
        } else if(data.otherCatsObject){
            var a = data.otherCatsObject.filter(function(item){
                return (item && item.id==env.partnerData.category_no_image_on_post_page);
            });
            if(a.length && a[0].id==env.partnerData.category_no_image_on_post_page){
                ignoreImage=true;
            }
        }
    } 
    if(ignoreImage){
      data['hideMasterImageOnPost']=true;
    } else {
        data['hideMasterImageOnPost']=false;
    }
    data["mediaType"] = data.mediaIds && data.mediaIds.length ? Utils.getMediaType(data.mediaIds[0])  : "image";
    data['mediaUrl'] = data["mediaType"]=="youtube" || data["mediaType"]=="external" || data["mediaType"]=="externalNoProtocol" ? Utils.getMediaUrl(data) : Utils.getMediaUrl(data,"",env.rootUrl); //env.rootUrl+
    data['smallThumbUrl'] = data["mediaType"]=="youtube" || data["mediaType"]=="external" || data["mediaType"]=="externalNoProtocol" ? data['mediaUrl']  : Utils.getMediaUrl(data);
    if(data.mediaType=="youtube"){
        var mediaId = data.mediaIds[0];
        mediaId = mediaId.trim().substring(3,mediaId.trim().length);
        data["videoId"] = mediaId;
        data["thumbUrl"] = env.rootUrl+"/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;//"https://img.youtube.com/vi/"+mediaId+"/0.jpg"; //"http://hocalwire.com/admin/downloadYoutubeThumb?videoId="+mediaId;
        data["thumbUrlShare"] = env.rootUrl+"/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;
    }
    if(data.mediaType=="video"){ //video, access thumb url
        var mediaId = data.mediaIds[0];
        var id = mediaId.trim().substring(6,mediaId.trim().length);
        data["videoId"] = id;
        var d = {"mediaIds" : []};
        d.partner=req.partner;
        d.mediaIds.push("thumb_"+id);
        data["thumbUrl"] = Utils.getMediaUrl(d);
        data["thumbId"] = "thumb_"+id;
    }

    data['date_news'] = response.getRDMProperty(newsId,"date_news");
    data['date_update'] = response.getRDMProperty(newsId,"date_updated");

    var date = response.getRDMProperty(newsId,"date_news") || "2016-02-02 12:00:00";
    data['date'] = date;
    data['date_published'] = Utils.getPublishedDate(date);
    data['date_string'] = date;

    var date = response.getRDMProperty(newsId,"date_update");
    data['date_string_update'] = date;
    
    var tags = response.getRDMProperty(newsId,"tags") && response.getRDMProperty(newsId,"tags")!="null" ? response.getRDMProperty(newsId,"tags") : "";
    if(tags){
      
      var finalTags = tags.replace(/#/g , "");
      // finalTags = finalTags.replace(/\s/g,"");

    }
    if(finalTags){
      data["hashtags"] = finalTags;
      data['originalTags'] = tags;
    }
    if(response.getRDMProperty(newsId,"keywords") && response.getRDMProperty(newsId,"keywords")!="null"){

      data['keywords'] = response.getRDMProperty(newsId,"keywords");
      
    }
    data['newsUrl'] = response.getRDMProperty(newsId,"url");
    data['url'] = response.getRDMProperty(newsId,"url");
    data['point_lat'] =  response.getRDMProperty(newsId,"point_lat");
    data['point_long'] =  response.getRDMProperty(newsId,"point_long");
    var story = response.getRDMProperty(newsId,"story");
    data['story'] = story;
   // data['monthYear'] = month+" "+year;
    return data;
}
function sortNewsDataByPriorities(data,categoryId,date_key){
    date_key = date_key || "date_news";
    var sortFunction = "";
    if(!categoryId){
       sortFunction =  function(a,b){
            var d1 = new Date(a[date_key]);
            var d2 = new Date(b[date_key]);
            return d2-d1;
        };
    } else {
        sortFunction = function(a,b){
            var p1 = 10,p2=10;
            var i1 = a['otherCategories'].indexOf(categoryId);
            var i2 = b['otherCategories'].indexOf(categoryId);
           
            if(i1>-1 && a['categoryPriorities'].length>i1){
                p1 = a['categoryPriorities'][i1];
                
                if(p1=="null") {
                    p1=10;
                }
            } else {
                p1=10;
            }
            if(i2>-1 && b['categoryPriorities'].length>i2){
                p2 = b['categoryPriorities'][i2];
                
                if(p2=="null") {
                    p2=10;
                }
            } else {
                p2=10;
            }
            
            if(p1!=p2){
                return p1-p2;
            } else {
                var d1 = new Date(a[date_key]);
                var d2 = new Date(b[date_key]);
                return d2-d1;
            }
        };
    }    
    return data.sort(sortFunction);
    
}
function getListingData(req,rdm,categoryId){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d = getData(req,rdm,newsId);
        
        data.push(d);
    }
    
    data=sortNewsDataByPriorities(data,categoryId);
    
    return data;
};
function parseNewsByCateogires(news,syncNews){
    var data = {};
    for(var i=0;i<syncNews.length;i++){
        data[syncNews[i].element_id] = {};
        data[syncNews[i].element_id]['templateData'] = syncNews[i];
        var catId = syncNews[i].categoryId;
        
        var dataTemp  =  news.filter(function(item){
            var result = (item.category == catId) ;
            if(!result){
                result = (item.otherCategories.indexOf(catId)>-1);
            }
            return result;
        });
        // console.log("element id is:**************"+syncNews[i].element_id);
        dataTemp = sortNewsDataByPriorities(dataTemp,data[syncNews[i].element_id]['templateData'].categoryId);
        var newsCount = parseInt(syncNews[i].newsCount);
        if(!isNaN(newsCount) && newsCount < dataTemp.length){
            dataTemp = dataTemp.splice(0,newsCount);
        }
        data[syncNews[i].element_id]['data'] = dataTemp;
        
        
    }
  
    return data;

}
function getMainCategoryNewsCats(req,res,catId,page,newsCountInCatPage){
        var options = staticMixinController.getCategoryNews(req,res);
        options.rdm.setRDMProperty("1","category",catId); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");
        var pageNo = page ? page : req.query.page?parseInt(req.query.page) : 1;
        
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="cats";
        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",newsCountInCatPage);   
        
        return apiHelper.get(options, req, res);
        
}
function getMainCategoryNewsAuthor(req,res,catId,page,newsCountInCatPage){
        var options = staticMixinController.getCategoryNews(req,res);
        options.rdm.setRDMProperty("1","searchString",catId); 
        options.rdm.setRDMProperty("1","newsType","USER");
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","searchType","authorId");
        var pageNo = page ? page : req.query.page?parseInt(req.query.page) : 1;
        
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="author";
        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",newsCountInCatPage);   
       
        
        return apiHelper.get(options, req, res);
        
}
function getCategoryNews(req,res,catId,newsCountForEachCat){
        var options = staticMixinController.getCategoryNews(req,res);

        
        options.rdm.setRDMProperty("1","category",catId); 

        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");
       
        if(newsCountForEachCat){
            options.rdm.setRDMProperty("1","counts",newsCountForEachCat);
        }
        
        return apiHelper.get(options, req, res);
        
}
function getParentCatId(parentId,cats){
    for(var i=0;i<cats.length;i++){
        if(cats[i].id==parentId){
            if(cats[i].parentId && cats[i].parentId!="null"){ //has another parent
                return getParentCatId(cats[i].parentId,cats);
            } else {
                return cats[i].id;
            }
        }
    }
}
function setBreadcrumb(req,catId){
    for(var i=0;i<req.environment.partnerCatData.length;i++){
        if(req.environment.partnerCatData[i].id==catId){
            req.environment.breadcrumb.unshift(req.environment.partnerCatData[i]);
            if(req.environment.partnerCatData[i].parentId && req.environment.partnerCatData[i].parentId!="null"){ //has another parent
                setBreadcrumb(req,req.environment.partnerCatData[i].parentId);
            } 
        }
    }
}


module.exports.getData = getData;
module.exports.sortContent = sortNewsDataByPriorities;
module.exports.getMainCategoryNewsAuthor = getMainCategoryNewsAuthor;
module.exports.getListingData = getListingData;
module.exports.getCategoryNews=getCategoryNews;
module.exports.getParentCatId=getParentCatId;
module.exports.setBreadcrumb=setBreadcrumb;
module.exports.sortContent = sortNewsDataByPriorities;
module.exports.parseNewsByCateogires=parseNewsByCateogires;
module.exports.getMainCategoryNewsCats=getMainCategoryNewsCats;