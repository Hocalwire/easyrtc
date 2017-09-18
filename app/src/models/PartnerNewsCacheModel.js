'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var Utils = require('src/libs/Utils');
var PartnerNewsCacheModel = {};
var data = {};
var listingData = {};
var bucketeSize = 100;
var cacheExpireDuration = 20*60*1000;
var Promise = require('promise');
var lastCachedTime=0;
var lastCachedTimeListing=0;
var staticMixinController = require("src/controller/helpers/staticMixinController");
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticDataController = require("src/controller/helpers/staticDataController");

module.exports.setup = function(app) {
    console.log("module setup is called********");
    setTimeout(clearCache,cacheExpireDuration);
}

function getPartnerItems(partner){
    if(!data[partner]){
        data[partner] = {};
    } 
    return data[partner];
}
function getPartnerListingItems(partner){
    if(!listingData[partner]){
        listingData[partner] = {};
    } 
    return listingData[partner];
}
function getItemId(response){
    var newsId = "";
    for(var k in response.rdRows){
        newsId = response.rdRows[k].id;
        break;
    }
    return newsId;
}
function getItemUrl(response){
    var finalUrl ="";
    for(var k in response.rdRows){
        finalUrl = response.rdRows[k].url;
        break;
    }
    return finalUrl;
}
function getListingItemsUrl(templateData){

    return templateData.page+"-"+templateData.mixinName+"-"+templateData.categoryId+"-"+templateData.newsCount;
}
function updateNewsInCache(req,res,newsItem,isRemove){
                    
    lastCachedTime=new Date().getTime();
    var items = getPartnerItems(req.partner);
    // var newsId  = getItemId(newsItem);
    var newsUrl  = getItemUrl(newsItem);
    var alreadyPresent=items[newsUrl];
    
    if(isRemove && alreadyPresent){
        delete items[newsUrl];
    } else {
        if(!alreadyPresent){
            items[newsUrl]={};    
        
        }    
        items[newsUrl]['data'] = newsItem;
        items[newsUrl]['time'] = new Date().getTime();
    }
    
}
function updateNewsListingInCache(req,res,listingItems,templateData,isRemove){
                    
    lastCachedTimeListing=new Date().getTime();
    var items = getPartnerListingItems(req.partner);
    // var newsId  = getItemId(newsItem);
    var newsUrl  = getListingItemsUrl(templateData);
    var alreadyPresent=items[newsUrl];
    
    if(isRemove && alreadyPresent){
        delete items[newsUrl];
    } else {
        if(!alreadyPresent){
            items[newsUrl]={};    
        
        }    
        items[newsUrl]['data'] = listingItems;
        items[newsUrl]['time'] = new Date().getTime();
    }
    
}
function updateNewsInCachedViews (req,res,newsItem){

}
function updateCachedView(req,res,templateData){

}
function clearAllNewsCache(req,res,next){
    clearCache(req);
    res.send(200,"<div> Success </div>");
}
function clearCache(req,newsUrl){
    console.log("\n\n\n\n clear cache is called \n\n\n\n\n");
    if(!req){
        // logger.error("clear cache is called********");
        data = {};
        listingData={};
        return;
    }
    if(newsUrl){
      var d  = data[req.partner];
      var item = d[newsUrl];
      if(item){
        delete d[newsUrl];;
      }
    }  else {
          data[req.partner] = {};  
    }
    
}
function getNewsFromCache(req,res){
    var items = getPartnerItems(req.partner);
    return items[req.pathname];
}
function getListingNewsFromCache(req,res,templateData){

    var items = getPartnerListingItems(req.partner);
    console.log("url"+getListingItemsUrl(templateData));
    return items[getListingItemsUrl(templateData)];
}
function getNews(options,req,res){
    // console.log("======================\n\n\n\n\n\n\n");
    // console.log("-----------------"+req.environment.partnerData.news_cache_millis);
    if(req.environment.partnerData.news_cache_millis){
        // console.log("checking for cache return");
        var now = new Date().getTime();
        var item = getNewsFromCache(req,res);
        var delta=0;
        if(item){
          delta = now - parseInt(item['time']);  
          // console.log("last: "+item['time']+" now"+now+"delta"+delta);
        } 
        
        if(delta && delta<parseInt(req.environment.partnerData.news_cache_millis.trim())){ //return from cache
            // console.log("inside matched rule, fetching item from cache****");
            var promise  = new Promise(function(resolve,reject){
                // logger.error("sending news from cache");
                resolve(item['data']);
            });
            promise.data = item['data'];
            return promise;
        } else {
            return apiHelper.get(options, req, res);        
        }
        
    } else {
        return apiHelper.get(options, req, res);        
    }
    
}

// function getNews(options,req,res){
//     console.log("======================\n\n\n\n\n\n\n");
//     console.log("-----------------"+req.environment.partnerData.news_cache_millis);
//     if(req.environment.partnerData.news_cache_millis){
//         console.log("checking for cache return");
//         var now = new Date().getTime();
//         var delta = now - lastCachedTime;

//         console.log("last: "+lastCachedTime+" now"+now+"delta"+delta);
//         if(delta<parseInt(req.environment.partnerData.news_cache_millis.trim())){ //return from cache
//             console.log("inside matched rule, fetching item from cache****");
//             var item = getNewsFromCache(req,res);
//             console.log(item);
//             if(item){
//                 logger.error("returning cached news");
//                 var promise  = new Promise(function(resolve,reject){
//                     resolve(item);

//                 });
//                 promise.data = item;
//                 return promise;
//             } else {
//                 return apiHelper.get(options, req, res);        
//             }
//         } else {
//             return apiHelper.get(options, req, res);    
//         }
        
//     } else {
//         return apiHelper.get(options, req, res);    
//     }
    
// }
function mergeAsynvWithSyncIfInCache(req,res,asyncT,data){
    // console.log("\n\n\n aysnc temp length to merge"+asyncT.length);
    // console.log(listingData);
    if(req.environment.partnerData.news_cache_millis && req.environment.partnerData.merge_async_from_cache_templates){
        // var asyncT = asyncT.filter(function(item){
        //     return item.content_type=="CATEGORY_NEWS";
        // });
        // console.log("\n\n\n\n");
        // console.log(asyncT);
        var indexs = [];
        for(var i=0;i<asyncT.length;i++){
            
            if(asyncT[i].content_type!="CATEGORY_NEWS"){
                continue;
            }
            // console.log("CATEGORY new items length"+asyncT[i].mixinName);
            // console.log(asyncT[i]);
            var now = new Date().getTime();
            var item = getListingNewsFromCache(req,res,asyncT[i]);

            var delta=0;
            if(item){
              delta = now - parseInt(item['time']);  
            } 
            // console.log("----delta in merge"+delta+" other conditaion"+(delta<parseInt(req.environment.partnerData.news_cache_millis)));
            if(delta && delta<parseInt(req.environment.partnerData.news_cache_millis)){ //return from cache
                var o = {};
                o['data'] = commonController.getListingData(req,item['data'],asyncT[i]['categoryId']);
                o['templateData'] = Utils.extend({},asyncT[i]);
                data[asyncT[i].element_id] = o;
                indexs.push("index-"+i);
                // i--;

                // console.log(asyncT);
            }   

        }
        // console.log(indexs);
        var finalAsync = [];
        for(var i=0;i<asyncT.length;i++){
            if(indexs.indexOf("index-"+i)>-1){

            } else {
                finalAsync.push(asyncT[i]);
            }
        }
        return finalAsync;
    } else {
        return asyncT;
    }
}
function getNewsListing(req,res,catId,count,templateData){
    if(req.environment.partnerData.news_cache_millis){
        var now = new Date().getTime();
        var item = getListingNewsFromCache(req,res,templateData);
        var delta=0;
        if(item){
          delta = now - parseInt(item['time']);  
        } 
        // console.log("delta----"+delta);
        if(delta && delta<parseInt(req.environment.partnerData.news_cache_millis.trim())){ //return from cache
            // logger.error("inside matched rule, fetching item from cache****");
            var promise  = new Promise(function(resolve,reject){
                // logger.error("sending news from cache");
                resolve(item['data']);
            });
            promise.data = item['data'];
            return promise;
        } else {
            return getCategoryNews(req,res,catId,count); 
        }
        
    } else {
        return getCategoryNews(req,res,catId,count);    
    }
    
}

function getCategoryNews(req,res,catId,count){
    var options = staticMixinController.getCategoryNews(req,res);
        options.rdm.setRDMProperty("1","category",catId); 

        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");
        if(count) {
            options.rdm.setRDMProperty("1","counts",count);   
        } else {
            options.rdm.setRDMProperty("1","counts",newsCountInPage);
        }
        
        return apiHelper.get(options, req, res);
        
}
module.exports.clearCache = clearCache;
module.exports.clearAllNewsCache = clearAllNewsCache;
module.exports.updateNewsInCache = updateNewsInCache;
module.exports.getNewsFromCache = getNewsFromCache;
module.exports.getNews = getNews;
module.exports.getNewsListing = getNewsListing;
module.exports.updateNewsListingInCache = updateNewsListingInCache;
module.exports.mergeAsynvWithSyncIfInCache=mergeAsynvWithSyncIfInCache;

