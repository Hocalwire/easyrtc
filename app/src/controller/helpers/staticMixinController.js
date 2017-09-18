"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Q = require("q");
var Utils = require("src/libs/Utils");
var url = require("url");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticDataController = require("src/controller/helpers/staticDataController");
var logger = require('src/libs/logger');
var dateFormat = require('dateformat');

var staticMixinController = require("src/controller/helpers/staticMixinController");

function getMixinData(req,res,templates,data){
    
    var newsListing = templates.filter(function(item){
            return item.content_type=="CATEGORY_LISTING";
    });
    var authorListing = templates.filter(function(item){
            return item.content_type=="AUTHOR_LISTING";
    });
    var commentListing = templates.filter(function(item){
            return item.content_type=="COMMENT_WIDGET";
    });
    var othersListing = templates.filter(function(item){
            return item.content_type=="OTHER";
    });
    var othersSyncs = templates.filter(function(item){
            return item.content_type=="AD" || item.content_type=="HTML" || item.content_type=="FILE";
    });
 
    for(var i=0;i<newsListing.length;i++){
        data[newsListing[i].element_id] = {};
        data[newsListing[i].element_id]['templateData'] = newsListing[i];
        data[newsListing[i].element_id]['data'] =  req.environment.partnerCatData.slice(0,(newsListing[i].newsCount || 5));
    }
    for(var i=0;i<authorListing.length;i++){
        data[authorListing[i].element_id] = {};
        data[authorListing[i].element_id]['templateData'] = authorListing[i];
        data[authorListing[i].element_id]['data'] =  req.environment.partnerAuthorData.slice(0,(authorListing[i].newsCount || 5));
    }
    for(var i=0;i<commentListing.length;i++){
        data[commentListing[i].element_id] = {};
        data[commentListing[i].element_id]['templateData'] = commentListing[i];
        data[commentListing[i].element_id]['data'] =  {};
    }
    console.log("=================44444444444444444===========\n\n\n\n");
    for(var i=0;i<othersSyncs.length;i++){
        
        data[othersSyncs[i].element_id] = {};
        
        data[othersSyncs[i].element_id]['templateData'] = othersSyncs[i];
        
        data[othersSyncs[i].element_id]['data'] = {};
        console.log("found other syn mixinf ***********************");
        if(data[othersSyncs[i].element_id]['templateData'].mixinName!="syncHtmlContent" && (othersSyncs[i].content_type=="HTML" || othersSyncs[i].content_type=="AD")){
            console.log("mixin is:"+othersSyncs[i].element_id);
            data[othersSyncs[i].element_id]['templateData'].mixinName="syncHtmlContent";
            console.log(data[othersSyncs[i].element_id]['templateData']);
        }
        if(othersSyncs[i].content_type=="FILE" && data[othersSyncs[i].element_id]['templateData'].mixinName!="syncFileContent"){
            data[othersSyncs[i].element_id]['templateData'].fileName=othersSyncs[i].mixinName;
            data[othersSyncs[i].element_id]['templateData'].mixinName="syncFileContent";
        }
        
    }
    
    if(othersListing.length){
        for(var i=0;i<othersListing.length;i++){  //oder of settings is : /page/element/mixintype
            var type = othersListing[i].default_content;
            switch(type) {
                case "tag_cloud" :
                    data[othersListing[i].element_id] = {};
                    data[othersListing[i].element_id]['templateData'] = othersListing[i];
                    data[othersListing[i].element_id]['data'] =  req.environment.partnerData.trendingTags ? req.environment.partnerData.trendingTags.slice(0,(othersListing[i].newsCount || 5)) : [];
                break;
            }        
        }
    }
    data.syncMixins = templates;
    // console.log(data);
    // // for(var i=0;i<templates.length;i++){
    //     data.syncMixins
    // }
    return data;
}
function addAsyncPlaceHolderMixin(req,res,templates,data){
    
    var newsListingNews = templates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
    });
    var newsListing = templates.filter(function(item){
            return item.content_type=="CATEGORY_LISTING";
    });
    var authorListing = templates.filter(function(item){
            return item.content_type=="AUTHOR_LISTING";
    });
    var othersListing = templates.filter(function(item){
            return item.content_type=="OTHER";
    });
    for(var i=0;i<newsListing.length;i++){
        data[newsListing[i].element_id] = {};
        data[newsListing[i].element_id]['templateData'] = newsListing[i];
        
        data[newsListing[i].element_id]['data'] =  [];
        
    }

    for(var i=0;i<authorListing.length;i++){
        data[authorListing[i].element_id] = {};
        data[authorListing[i].element_id]['templateData'] = authorListing[i];
        data[authorListing[i].element_id]['data'] =  [];
    }
    for(var i=0;i<newsListingNews.length;i++){
        data[newsListingNews[i].element_id] = {};
        data[newsListingNews[i].element_id]['templateData'] = newsListingNews[i];
        var items= [];
        if(req.environment.partnerCatData){
            items = req.environment.partnerCatData.filter(function(item){
                return item.id==newsListingNews[i].categoryId;
            });
            
        }
        if(items.length>0){
            data[newsListingNews[i].element_id]['templateData'].currentCat = items[0];
        }
        data[newsListingNews[i].element_id]['data'] =  [];
    }
    if(othersListing.length){
        for(var i=0;i<othersListing.length;i++){  //oder of settings is : /page/element/mixintype
            var type = othersListing[i].default_content;
            switch(type) {
                case "tag_cloud" :
                    data[othersListing[i].element_id] = {};
                    data[othersListing[i].element_id]['templateData'] = othersListing[i];
                    data[othersListing[i].element_id]['data'] =  [];
                break;
            }        
        }
    }
    return data;
}
function getSingleData(req,res,template,data){
    data['templateData']   = template;
    if(template.content_type=="CATEGORY_LISTING"){
        data['data'] =  req.environment.partnerCatData.slice(0,(template.newsCount || 5));
    } else if(template.content_type=="AUTHOR_LISTING"){
      data['data'] =  req.environment.partnerAuthorData.slice(0,(template.newsCount || 5));
    } else if(template.content_type=="COMMENT_WIDGET"){
      data['data'] =  {}
    } else if(template.content_type=="OTHER"){
        var type = template.default_content;
        switch(type) {
            case "tag_cloud" :
                data['data'] =  req.environment.partnerData.trendingTags ? req.environment.partnerData.trendingTags.slice(0,(template.newsCount || 5)) : [];
            break;
        }   
    } 
    return data;
}
function getCategoryNews(req,res,partner){
    var options = {
            rdm : apiHelper.getURL(Constants.getNewsUrl,partner || req.partner)
        };
    var templateData = req.query;
    if(templateData && templateData.request_params){
        var request_params = decodeURIComponent(templateData.request_params);
        var arr = request_params.split(",");
        for(var i=0;i<arr.length;i++){
            var tarr = arr[i].split("=");
            if(tarr.length>1){
                options.rdm.setRDMProperty("1",tarr[0],tarr[1]);
            }
        }
    }
    return options;


}


function getContentData(req,res,params,templateData){
    var options = {
                    rdm : apiHelper.getURL(Constants.getContentData,req.partner)
                };
    templateData = templateData || req.query;
    if(templateData && templateData.request_params){
        var request_params = decodeURIComponent(templateData.request_params);
        var arr = request_params.split(",");
        for(var i=0;i<arr.length;i++){
            var tarr = arr[i].split("=");
            if(tarr.length>1){
                options.rdm.setRDMProperty("1",tarr[0],tarr[1]);
            }
        }
    }
    if(params){
        for(var k in params){
            options.rdm.setRDMProperty("1",k,params[k]);
        }
    }
    return options;
}
function handleGenericContentParsing(req,res,rdm,request_params){
    var d = [];
    for(var k in rdm.rdRows){
        var item = rdm.rdRows[k];
        var id = rdm.rdRows[k].id;
        var data =  commonContentController.getData(req,rdm,id,true);
        var dd = [];
        var dataCount = item.option_count || item.options_count;
        console.log(item);
        if(dataCount>0){
                for(var i=0;i<dataCount;i++){
                    dd.push({"name":rdm.rdRows[k]["option_tag_"+i],"display_name":rdm.rdRows[k]["option_name_"+i]});
                }
                console.log(dd);
        }
        data.options = dd;
        d.push(data);
    }

    return d;
}
function fillDataVar(req,val){
           
        if(val.indexOf("##$$") >-1){
            var index1 = val.indexOf("##$$");
            var index2 = val.indexOf("$$##");
            var varvalue = val.substring(index1+4,index2);
            var result="";
            var a = varvalue.split("+");
            for(var k=0;k<a.length;k++){
                var res;
                var aa = a[k].split(".");
                for(var j=0;j<aa.length;j++){
                    if(!res) {
                        res = req[aa[j]];
                    } else {
                        res = res[aa[j]];
                    }
                    
                }
                result =result+res;
            }
            val = val.substring(0,index1) + result + val.substring(index2+4,val.length);
        } 
    return val;

}

function handleGenericTypes(req,res,next,templateData,options){

    var request_params = decodeURIComponent(templateData.request_params);
    var arr = request_params.split(",");
    var paramsData = {};
    for(var i=0;i<arr.length;i++){
        var target = arr[i].split("=");
        var key  = target[0];
        var val = target[1];

        paramsData[key] = val;
    }
    var parseDataFunction=handleGenericContentParsing;//arr.indexOf("data_parse_function")>-1:arr["data_parse_function"]
  
    for(var key in paramsData){
        
        if(key=="api_type" || key=="data_parse_function"){
            if(key=="data_parse_function"){
                parseDataFunction = staticDataController[paramsData[key]];
            }
        } else {
            options.rdm.setRDMProperty("1",key,fillDataVar(req,paramsData[key]));
        }
    }
    if(templateData.count){
        options.rdm.setRDMProperty("1","count",templateData.count);
        options.rdm.setRDMProperty("1","counts",templateData.count);
    } else {
        options.rdm.setRDMProperty("1","count",12);
        options.rdm.setRDMProperty("1","counts",12);
    }
    var startIndex = 0;
    
    var startIndexFromQuery = req.query.startIndex ?  (parseInt(req.query.startIndex)) : 0;
    if(startIndexFromQuery){
        startIndex=startIndexFromQuery;
    }
    if(!startIndex) {
        startIndex = 0;
    }
    options.rdm.setRDMProperty("1","startIndex",startIndex); 
    var  p = apiHelper.get(options, req, res);
    p.then(function(result){

            var data = parseDataFunction(req,res,result,arr);
            var start = parseInt(templateData.startIndex || 1);
            var end =start + (templateData.count || 12)
            if((end-start) > data.length){
                end=start+data.length-1;

            }
            if(parseDataFunction==handleGenericContentParsing){
                data = data.sort(function(a,b){
                    var a1 = a.sorting_order ? a.sorting_order :1;
                    var b1 = b.sorting_order ? b.sorting_order : 1;
                    if(a1!=b1){
                        return a1-b1;
                    } 
                    return 0;
                });
            }
            
            p.data = data;
            p.counts = {"start":start,"end":end,"pageSize":12,"total_buzz_count":result.getRDMAttribute("buzz_count")};
            
        },
        function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error fetching generic mixin api :', e.message+"   url:"+templateData.end_point);
            next(e);
        });
    return p; 
}
function getGenericApiRequest(req,res,next,params,props){
    var templateData = props || req.query || params;
    var endPoint = decodeURIComponent(templateData.end_point);
    var options = {
                    rdm : apiHelper.getURL(templateData.end_point,req.partner)
                };

    if(templateData.newsCount){
        options.rdm.setRDMProperty("1","count",templateData.newsCount);
    }
    if(templateData.group_id && templateData.group_content_type){
        options.rdm.setRDMProperty("1","group_id",templateData.group_id);
        options.rdm.setRDMProperty("1","content_type",templateData.group_content_type);
                    
    } 
    if(templateData.extra_param_key && templateData.extra_param_value){
        options.rdm.setRDMProperty("1",templateData.extra_param_key,templateData.extra_param_value);
    }
    return handleGenericTypes(req,res,next,templateData,options);
    
}
function getContentParamData(req,res,next,templateData){
    var options = {
                    rdm : apiHelper.getURL(Constants.getContentParamData,req.partner)
                };
    templateData = templateData || req.query;
    if(templateData && templateData.request_params){
        var request_params = decodeURIComponent(templateData.request_params);
        var arr = request_params.split(",");
        for(var i=0;i<arr.length;i++){
            var tarr = arr[i].split("=");
            if(tarr.length>1){
                options.rdm.setRDMProperty("1",tarr[0],tarr[1]);
            }
        }
    }
    return options;
}
module.exports.getMixinData = getMixinData;
module.exports.getSingleData = getSingleData;
module.exports.addAsyncPlaceHolderMixin = addAsyncPlaceHolderMixin;
module.exports.getCategoryNews = getCategoryNews;
module.exports.getContentData = getContentData;
module.exports.getContentParamData = getContentParamData;
module.exports.getGenericApiRequest = getGenericApiRequest;

