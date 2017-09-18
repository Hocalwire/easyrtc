"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var Q = require("q");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var newsCountInPage = 20;
var newsCountInCatPage = 12;
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var partnerConfig = require("src/config/PartnerConfig");
var logger = require('src/libs/logger');
var extend = require("extend");
var commonContentController = require("src/controller/helpers/commonContentController");

function renderSearchPage(req, res, next) {
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",PartnerPropsModel.data[req.partner]["theme"]);
        
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",PartnerPropsModel.data[req.partner]["theme"]);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        // for(var i=0;i<aTemplates.length;i++){ //encode content of templatest
        //     aTemplates[i].content = encodeURIComponent(aTemplates[i].content);
        // }
        req.query.search = req.query.search.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');

       
        Utils.setAsyncTenmplates(req,aTemplates);
        req.environment.breadcrumb.push({"name":'You searched for "'+req.query.search+'"',"url":"/"});

        var supportedSearchTypes = req.environment.partnerData.supported_search_types;
        var requestedType = req.query && req.query.search_type_request && req.query.search_type_request!="null" && req.query.search_type_request!="undefined" ? req.query.search_type_request : "";
        var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
        if(supportedSearchTypes && type=="all" && (requestedType!="news")){
            handleAllSearchDataAndRender(req,res,next);
            return;
        }
        getSearchCategoryNews(req,res).then(function(result){
            
            var dataV = {};
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = {"type" :" search"};
            var mainListingData = commonController.getListingData(req,result);
            
            
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]['all'] = mainListingData;
            dataV['mainCatNews']["data"]["first"] = [];
            dataV['mainCatNews']["data"]["second"] = [];
            dataV['mainCatNews']["data"]["third"] = [];
            dataV.newsCountInCatPage = newsCountInCatPage;
            for(var i=0;i<mainListingData.length;i++){
                if(i<4){
                   dataV['mainCatNews']["data"]["first"].push(mainListingData[i]); 
                } else  if(i < 8){
                    dataV['mainCatNews']["data"]["second"].push(mainListingData[i]); 
                } else if(i<12){
                    dataV['mainCatNews']["data"]["third"].push(mainListingData[i]); 
                }
            }

            
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/newsListing', {
                data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
        
        
}

function getSearchCategoryNews(req,res){
        
        
        var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
        var options = staticMixinController.getCategoryNews(req,res);
        var search = req.query && req.query.search ? req.query.search : "";
        options.rdm.setRDMProperty("1","searchString",search); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","searchType",type);
        var pageNo = req.query.page?parseInt(req.query.page) : 1;
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="search";
        if(!req.query.search_type){
            req.query.search_type = type;
        }
        req.environment.query = req.query;

        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",newsCountInCatPage);   
       
        
        return apiHelper.get(options, req, res);
        
}

function getNewsSearch(req,res,next){
        var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
        var options = staticMixinController.getCategoryNews(req,res);
        var search = req.query && req.query.search ? req.query.search : "";
        options.rdm.setRDMProperty("1","searchString",search); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","searchType",type);
        var pageNo = req.query.page?parseInt(req.query.page) : 1;
        req.environment.pageNo=pageNo;
        req.environment.listingPageType="search";
        if(!req.query.search_type){
            req.query.search_type = type;
        }
        req.environment.query = req.query;

        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(!startIndex) {
            startIndex = 0;
        }
        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        options.rdm.setRDMProperty("1","counts",newsCountInCatPage);   
       
        
        return apiHelper.get(options, req, res);
        
}
function getContentSearch(req,res,next,contentPropsOnIndex){
    var env = req.environment;
    var partnerConfigData = partnerConfig[req.partner];
    var types = partnerConfigData.contentTypes;
    var promises = [];
    var searchableTypes = env.partnerData.searchable_content_types || "";
    var a = env.partnerData.searchable_content_types || "";
    var search = req.query && req.query.search ? req.query.search : "";
    if(a){
        a = a.split(",");
    } else {
        a = [];
    }
    var d = req.environment.partnerContentData;
    var nameTypes = [];
    if(a.length && d){
        for(var k in d){
            var props = d[k]['props'];
            if(a.indexOf(props.id)>-1){
                nameTypes.push(props.name);
                contentPropsOnIndex.push(props);
            }
        }
     
    } else {
        if(d){
            for(var k in d){
                var props = d[k]['props'];
                contentPropsOnIndex.push(props);
            }
        }
        nameTypes = types;
    }
    console.log("==========search content names type");
    console.log(nameTypes);
    for(var i=0;i<nameTypes.length;i++){
        var options = staticMixinController.getContentData(req,res,{"content_type_name":nameTypes[i],"count":5});
        var  a = {"name" : "search","type":"like","value":search};
        
        options.rdm.setRDMProperty("1","searchString",search); 
        options.rdm.setRDMProperty("1","searchType","all");
        options.rdm.setRDMProperty("1","filterString",JSON.stringify(a));
        promises.push(apiHelper.get(options,req,res));

    }
   
    return promises;
}
function getBuzzSearch(req,res,next){
    var params = {};
    var search = req.query && req.query.search ? req.query.search : "";
    var request_params = "api_type=buzz,sendSync=true,data_parse_function=parseBuzzData,searchType=all,searchString="+search+"count=5";
    params.content_type="GENERIC";
    params['request_params'] = encodeURIComponent(request_params);
    params['end_point'] = encodeURIComponent(Constants.getBuzzData);
    var p = staticMixinController.getGenericApiRequest(req,res,next);
    return p;
}
function getContentData(rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d ;
        if(rdm.rdRows[k].content_type){
            d = commonContentController.getData(req,rdm,newsId);
        } else {
            d = commonController.getData(req,rdm,newsId);
        }
        
        
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_content);
        var d2 = new Date(b.date_content);
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
}
function handleAllSearchDataAndRender(req,res,next,rdm){
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",PartnerPropsModel.data[req.partner]["theme"]);
        
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",PartnerPropsModel.data[req.partner]["theme"]);
        
    var supportedSearchTypes = req.environment.partnerData.supported_search_types;
    var type = req.query && req.query.search_type && req.query.search_type!="null" && req.query.search_type!="undefined" ? req.query.search_type : "all";
    var buzzPromise = "";
    var newsPromise="";
    var search = req.query && req.query.search ? req.query.search : "";
    var promisses = [];
    var contentPropsOnIndex = [];
    var searchTypes = supportedSearchTypes.split(",");
    if(searchTypes.indexOf("news")>-1){
        newsPromise = getNewsSearch(req,res,next);
        promisses.push(newsPromise);
        contentPropsOnIndex.push({"type":"news","display":"News Items"})
    }
    if(searchTypes.indexOf("buzz")>-1){
        buzzPromise = getBuzzSearch(req,res,next);
        promisses.push(buzzPromise);
        console.log("buzz promise data:"+buzzPromise);
    }
    if(searchTypes.indexOf("content")>-1){
        var p = getContentSearch(req,res,next,contentPropsOnIndex);
        for(var i=0;i<p.length;i++){
            promisses.push(p[i]);
        }
    }
    var promise = Q.all(promisses);
    console.log("promisses length"+promisses.length);
    promise.then(function(result){
        console.log("result length is:"+result.length);
        var dataV = {};
        staticMixinController.getMixinData(req,res,syncTemplates,dataV);
        staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
        if(searchTypes.indexOf("news")>-1){
            dataV["news"] = {};
            dataV["news"]["data"] = commonController.getListingData(req,result[0]); 
            dataV["news"]["templateData"] = {"type":"search","search":search,"name":"news","heading":"News Items"};
        }
        console.log(searchTypes);
        if(searchTypes.indexOf("buzz")>-1){
            dataV["buzz"] = {};
            dataV["buzz"]["data"] = buzzPromise.data; 
            dataV["buzz"]["templateData"] = {"type":"search","search":search,"name":"buzz","heading":"Buzz Items"};
        }
        if(searchTypes.indexOf("content")>-1){
            var contentResultStartIndex;
            if(newsPromise){
                if(buzzPromise){
                    contentResultStartIndex=2
                } else {
                    contentResultStartIndex=1;
                }
            } else {
                if(buzzPromise){
                    contentResultStartIndex=1
                } else {
                    contentResultStartIndex=0;
                }
            }
            for(var i=contentResultStartIndex;i<result.length;i++){
                var props = contentPropsOnIndex[i];
                console.log("==============");
                console.log(props);
                console.log("==================");
                dataV["content"] = [];
                var o = {};
                o['templateData'] = {"type":"search","search":search,"name":"buzz","props":props,"heading":"Content Items"};
                var rdm = result[i];

                o['data'] = getContentData(rdm);
                console.log(o);
                dataV["content"].push(o);
            }

        }

        console.log("===================================\n\n\n rendering generic serach page:==============\n\n\n");
        console.log(dataV);
        res.render(PartnerPropsModel.data[req.partner]["theme"]+'/newsAllSearchType', {
            data : dataV
            }, function(err, html) {
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
            
                res.send(200, html);
            });
    

        },
        function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
    
    
}
module.exports.renderSearchPage = renderSearchPage;
