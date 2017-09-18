"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var Q = require("q");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var newsCountInPage = 20;
var newsCountInCatPage = 12;
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var partnerConfig = require("src/config/PartnerConfig");
var logger = require('src/libs/logger');
var extend = require("extend");

function renderXHRSearch(req,res,next){
    console.log("search auto complete request");
    var query=req.query;
    var content_type = query.content_type;
    var content_type_name = query.content_type_name;
    var category = query.category_id && query.category_id!="null" ? query.category_id : "";
    var region = query.content_region;
    var industry = query.content_industry;
    var search_keyword = query.search;

    var options = {
                    rdm : apiHelper.getURL(Constants.getContentAutoComplete,req.partner)
                };
        if(!category){
            delete req.query.category_id;
            
        }
            
        options.rdm.setRDMProperty("1","sendSync","true");
        if(query.show_all && query.show_all=="true"){
            options.rdm.setRDMProperty("1","show_all","true");    
        }
        options.rdm.setRDMProperty("1","content_type",content_type);
        options.rdm.setRDMProperty("1","content_type_name",content_type_name);
        
        options.rdm.setRDMProperty("1","count",5);   
        options.rdm.setRDMProperty("1","searchString",search_keyword); 
        if(region && region!="-1" && region!="null")
            options.rdm.setRDMProperty("1","content_region",region); 
        if(industry && industry!="-1" && industry!="null")
            options.rdm.setRDMProperty("1","content_industry",industry); 
        if(query.filterid){
            options.rdm.setRDMProperty("1","filterId",query.filterid); 
        }
        options.rdm.setRDMProperty("1","sendSync","true");
        // if(query.region && query.region!="-1" && query.region!="null"){
        //     options.rdm.setRDMProperty("1","region",query.region);
        // }
        apiHelper.get(options, req, res).then(function(rdm){
            console.log(rdm.toXML())
            var mainListingData = getAutoCompleteData(req,rdm);
            var returnData = [];
            for(var i=0;i<mainListingData.length;i++){
                returnData.push({"display" : mainListingData[i].name,"url" :mainListingData[i].url,"id":mainListingData[i].id});
                
            }
            console.log("================================================================================");
            console.log(returnData);
            console.log("sending data");
            res.send(returnData);
            res.end();
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 

        
};
function renderSearchPage(req, res, next,props) {
        var env = req.environment ;
        env.savePageScroll=true;
        // env.refreshPageOnBack=true;
        req.environment.isLoggedInUser  = false;
        if(req.cookies && req.cookies._xhr_verified_ && req.cookies._xhr_verified_==1){
            req.environment.isLoggedInUser = true;
        }
        var propsData = props.props;
        var catsData = props.categoryProps;
        var filtersMetaData = props.filtersMetaData;
        req.environment.filtersMetaData = filtersMetaData;
        var filters = props.filters;
        var isXHR = false;
        var type = propsData.name ? propsData.name.toLowerCase() + "_listing" : "generic_listing";
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,type,props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,type,props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);
        

        var env = req.environment;
        var startIndexFromQuery = req.query.start_index || 0;
        

        var query = req.query;
        var c = partnerConfig[req.partner];
        if(c['defaultCategoryPageCount']) {
            req.environment.default_page_size = c['defaultCategoryPageCount'];
        }
        if(!query || !query.content_count){
            if(c['defaultCategoryPageCount']) {
                if(!req.query) {
                    req.query = {};
                }
                req.query.content_count = c['defaultCategoryPageCount'];
            }
        }
        env.paginationSize = req.query.content_count || newsCountInCatPage;
        
        var mainNewsCatId = "";
        if(catsData) {
             mainNewsCatId = catsData.id;
        }

        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CONTENT_DATA";
        });
        
        var catIds = [];        
        var newsCount = [];

        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        
        if(env.contentXHRRequest){ //hanfdle XHR request
            var content_requested_count=req.query.content_count || newsCountInCatPage;
            console.log("-----------------content xhr request-----------------------");
            
            var p = getMainCategoryNews(req,res,mainNewsCatId,propsData.id,filters);
            
            p.then(function(rdm){
                var dataV = {};
               
                var mainListingData = getListingData(req,rdm);
                console.log(mainListingData);
                dataV['totalCount'] = mainListingData.length;
                dataV['data'] = mainListingData;
                dataV['mainCatNews'] = {};
                dataV['mainCatNews']["catData"] = props;
                dataV['mainCatNewsCount'] =mainListingData.length;
            var start = req.environment.pageNo ? (parseInt(req.environment.pageNo-1) * req.environment.paginationSize)+1 :1;
            var end;
            if(startIndexFromQuery){
                start = startIndexFromQuery;
            }
            if(startIndexFromQuery){
                end = parseInt(startIndexFromQuery) + parseInt(content_requested_count)-1;
            } else {
                end=req.environment.pageNo ? parseInt(req.environment.pageNo) * content_requested_count :parseInt(content_requested_count);
            }
           
            if((parseInt(end)-parseInt(start)) >= mainListingData.length){
                end=parseInt(start)+mainListingData.length-1;
            }
            dataV['items_count_range'] = ((start>0 && start==end) || (start!=end && end>start)) ? start+"-"+end : "0";
            dataV['items_total_count'] = rdm.getRDMAttribute("total_count");;;
            dataV['items_content_type'] = propsData.id;
            dataV['selected_content_count_max'] = content_requested_count;
            dataV['currentItemIndex'] = start;
            dataV['nextPageStartIndex'] = end+1;
            dataV['prevPageStartIndex'] = parseInt(start)-parseInt(content_requested_count) >0 ? parseInt(start)-parseInt(content_requested_count): 1;
                var templatePath = "/xhr"+(propsData.template ? propsData.template : "genericListing");
                templatePath =  PartnerPropsModel.data[req.partner]["theme"]+templatePath;
                console.log("template path to render ****************************************"+templatePath);
                res.render(templatePath, {
                    data : dataV
                    }, function(err, html) {
                        if (err) {
                            logger.error('in index file', err.message);
                            return next(err);
                        }
                        console.log("template path to render **************************************** sending data"+templatePath);
                        console.log(html);
                        res.send(200, html);
                    });
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
            
            
            return;
        } 


        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        promises.push(getMainCategoryNews(req,res,mainNewsCatId,propsData.id,filters)); 
        if(catIds){
            promises.push(getCategoryNews(req,res,catIds,newsCount));
        }
        var hasFilter=false;
        if(!req.environment.partnerData.asyncFilter){
            // promises.push(getFilterMetadata(req,res,propsData.id));
            hasFilter=true;
        }

        Q.all(promises).then(function(result){
           var content_requested_count=req.query.content_count || newsCountInCatPage;
            var dataV = {};
            if(result.length==2){
                var allnews = getListingData(req,result[1]);
                dataV = parseNewsByCateogires(req,allnews,syncNews);  

            }  
            if(hasFilter){
                dataV["filterData"] = filtersMetaData;
            }
            
            
            staticMixinController.getMixinData(req,res,syncTemplates,dataV); 
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV); 
            
            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
            dataV['selected_content_count_max'] = content_requested_count;
            req.environment.breadcrumb.push({"name":propsData.display_name,"url":propsData.url});
            console.log("222222222");
            var mainListingData = getListingData(req,result[0]);

            var start = req.environment.pageNo ? (parseInt(req.environment.pageNo-1) * req.environment.paginationSize)+1 :1;
            if(startIndexFromQuery){
                start = startIndexFromQuery;
            }
            var end;
            if(startIndexFromQuery){
                end = parseInt(startIndexFromQuery) + parseInt(content_requested_count)-1;
            } else {
                end=req.environment.pageNo ? parseInt(req.environment.pageNo) * content_requested_count :content_requested_count;
            }


            if((parseInt(end)-parseInt(start)) >= mainListingData.length){
                    end=parseInt(start)+mainListingData.length-1;
            }
            
            dataV['items_count_range'] = ((start>0 && start==end) || (start!=end && end>start)) ? start+"-"+end : "0";
            dataV['items_total_count'] = result[0].getRDMAttribute("total_count");
            dataV['items_content_type'] = propsData.id;
            
            dataV['currentItemIndex'] = start;
            dataV['nextPageStartIndex'] = end+1;
            dataV['prevPageStartIndex'] = parseInt(start)-parseInt(content_requested_count) >0 ? parseInt(start)-parseInt(content_requested_count): 1;

            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = {};
            dataV['mainCatNews']["data"]['all'] = mainListingData;
            dataV['mainCatNews']["data"]["first"] = [];
            dataV['mainCatNews']["data"]["second"] = [];
            dataV['mainCatNews']["data"]["third"] = [];
            dataV.newsCountInCatPage = content_requested_count;

            for(var i=0;i<mainListingData.length;i++){
                if(i<4){
                   dataV['mainCatNews']["data"]["first"].push(mainListingData[i]); 
                } else if(i < 8){
                    dataV['mainCatNews']["data"]["second"].push(mainListingData[i]); 
                } else if(i<12){
                    dataV['mainCatNews']["data"]["third"].push(mainListingData[i]); 
                }
            }
            console.log("333333333");

            var templatePath = "/"+(propsData.template ? propsData.template : "genericListing");
            templatePath =  PartnerPropsModel.data[req.partner]["theme"]+templatePath;
            res.render(templatePath, {
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
function getFilterMetadata(req,res,type){
    var options = {
                rdm : apiHelper.getURL(Constants.getContentFilterMetadata,req.partner)
            };
    
    options.rdm.setRDMProperty("1","content_type",type);
    options.rdm.setRDMProperty("1","sendSync",true);
    return apiHelper.get(options, req, res);      
};

function parseNewsByCateogires(req,news,syncNews){
    var data = {};
    for(var i=0;i<syncNews.length;i++){
        data[syncNews[i].element_id] = {};
        data[syncNews[i].element_id]['templateData'] = syncNews[i];
        data[syncNews[i].element_id]['data'] =  news.filter(function(item){
            return item.category == syncNews[i].categoryId;
        });
        
       
    }
  
    return data;

}
function getAutoCompleteData(req,rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d = commonContentController.getAutoCompleteData(req,rdm,newsId);
        console.log(d);
        data.push(d);
    }
    // var sortFunction = function(a,b){
    //     var d1 = new Date(a.date_news);
    //     var d2 = new Date(b.date_news);
    //     return d2-d1;
    // }    
    // data.sort(sortFunction);
    return data;
};
function getListingData(req,rdm){
    console.log("======================================================================================================");
    console.log(rdm.toXML());
    console.log("======================================================================================================");
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d ;
        if(rdm.rdRows[k].content_type){
            d = commonContentController.getData(req,rdm,newsId);
            console.log(d);
        } else {
            d = commonController.getData(req,rdm,newsId);
        }
        
        
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_content).getTime();
        var d2 = new Date(b.date_content).getTime();
        console.log(d1+"   -    "+d2);

        if(d1==d2){
            var s1 = a.title;
            var s2 = b.title;
            console.log(s1+"  "+ s2+ "   " + (s1>s2) + " " + (s1<s2));
            if(s1>s2){
                return 1;
            } else if(s1<s2){
                return -1;
            } 
        }
        return d2-d1;
    }    
    data.sort(sortFunction);
    return data;
};

function getMainCategoryNews(req,res,catId,content_type,filters){
    var options = staticMixinController.getContentData(req,res);
        if(catId)
            options.rdm.setRDMProperty("1","category",catId); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","content_type",content_type);
        options.rdm.setRDMProperty("1","newsType","USER");
        options.rdm.setRDMProperty("1","needTotalCount","true");
        if(req.query || filters){
            commonContentController.addFilters(req,res,options.rdm);
        }


        // if(filters){
        //     for(var k in filters){
        //         options.rdm.setRDMProperty("1",k,filters[k]);
        //     }
        // }
        var pageNo =  req.query.page?parseInt(req.query.page) : 1;
        
        req.environment.pageNo=pageNo;
        req.environment.startIndex=req.query.start_index ?  (parseInt(req.query.start_index)-1) : 0;
        
        req.environment.listingPageType="search";
        if(req.query.content_count){
            options.rdm.setRDMProperty("1","counts",req.query.content_count); 
        } else {
           
            options.rdm.setRDMProperty("1","counts",newsCountInCatPage); 
        }
        var startIndex = (pageNo -1)*newsCountInCatPage;
        if(req.query.content_count){
            startIndex = (pageNo -1)*req.query.content_count;
        }
        var startIndexFromQuery = req.query.start_index ?  (parseInt(req.query.start_index)-1) : 0;
        if(startIndexFromQuery || (req.query.start_index && startIndexFromQuery===0)){
            startIndex=startIndexFromQuery;
        }

        if(!startIndex) {
            startIndex = 0;
        }

        options.rdm.setRDMProperty("1","startIndex",startIndex); 
        
        return apiHelper.get(options, req, res);
        
}
function getCategoryNews(req,res,catId,newsCountForEachCat){
    var options = staticMixinController.getContentData(req,res);
        
        options.rdm.setRDMProperty("1","category",catId); 
        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");
        if(newsCountForEachCat){
            options.rdm.setRDMProperty("1","counts",newsCountForEachCat);
        }
        return apiHelper.get(options, req, res);
        
}
// function getParentCatId(parentId,cats){
//     for(var i=0;i<cats.length;i++){
//         if(cats[i].id==parentId){
//             if(cats[i].parentId && cats[i].parentId!="null"){ //has another parent
//                 return getParentCatId(cats[i].parentId,cats);
//             } else {
//                 return cats[i].id;
//             }
//         }
//     }
// }
// function setBreadcrumb(req,catId){
//     for(var i=0;i<req.environment.partnerCatData.length;i++){
//         if(req.environment.partnerCatData[i].id==catId){
//             req.environment.breadcrumb.unshift(req.environment.partnerCatData[i]);
//             if(req.environment.partnerCatData[i].parentId && req.environment.partnerCatData[i].parentId!="null"){ //has another parent
//                 setBreadcrumb(req,req.environment.partnerCatData[i].parentId);
//             } 
//         }
//     }
// }
module.exports.renderSearchPage = renderSearchPage;
module.exports.renderXHRSearch = renderXHRSearch;

