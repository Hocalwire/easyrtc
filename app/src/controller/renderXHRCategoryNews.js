"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var Q = require("q");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var newsCountInPage = 5;
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticDataController = require("src/controller/helpers/staticDataController");
var PartnerNewsCacheModel = require('src/models/PartnerNewsCacheModel');
var logger = require('src/libs/logger');

function renderXHRCatNews(req, res, next) {
        // if(req.body && req.body.handleChunk){
        //     handleGroupCall(req,res,next);
        //     return;
        // }
        req.loadTime.push(new Date().getTime());
        var catId = req.query.categoryId;
        var count  = req.query.newsCount;
        var type = req.query.content_type;
        req.environment.isLoggedInUser  = false;
        if(req.cookies && req.cookies._xhr_verified_ && req.cookies._xhr_verified_==1){
            req.environment.isLoggedInUser = true;
        }
        if(type=="CATEGORY_LISTING" || type=="AUTHOR_LISTING" || type=="COMMENT_WIDGET" || type=="OTHER"){
            var dataV={};
            staticMixinController.getSingleData(req,res,req.query,dataV);
            req.loadTime.push(new Date().getTime());
            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    var data = {};
                    data["templateData"] = dataV["templateData"];
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    res.send(200, data);
                });
         
            return;
        }
        if(type=="FILE") {
            return handleFileData(req,res,next);
        }
        if(type=="GENERIC") {
            return handleGenericRequest(req,res,next);
        }
        if(type=="CONTENT_DATA") {
            return handleContentData(req,res,next);
        }
        if(type=="CONTENT_PARAM_DATA") {
            return handleContentParamData(req,res,next);
        }
        if(type=="LOCATION_DATA") {
            return handleLocationData(req,res,next);
        }
        req.loadTime.push(new Date().getTime());
        
        var promiseNew = PartnerNewsCacheModel.getNewsListing(req, res,catId,count,req.query);
        promiseNew.then(function(result){
            req.loadTime.push(new Date().getTime());
            var dataV = {};
            dataV["templateData"]  = req.query;
            
            dataV["templateData"]["heading"] = decodeURIComponent(dataV["templateData"]["heading"]);

            
            dataV['data'] = commonController.getListingData(req,result,catId);
            if(req.environment.partnerData.news_cache_millis){
                // console.log("======================");
                // console.log(promiseNew.data);
                // console.log("============");
                if(promiseNew.data){
                } else {
                    // console.log("adding View To Cache****************");
                    PartnerNewsCacheModel.updateNewsListingInCache(req,res,result,dataV["templateData"]); 
                }    
            }
            
            var currentCat = req.environment.partnerCatData.filter(function(item){
                return item.id==catId;
            });
            
            
            if(currentCat.length>0){
                dataV["currentCat"] = currentCat[0];
                dataV["templateData"]["currentCat"] = currentCat[0];    
            }
          
            if(dataV['templateData'].excludeNews){
                var index = -1;
                for(var i=0;i<dataV['data'].length;i++){
                    if(dataV['data'][i].newsId==dataV['templateData'].excludeNews){
                        index=i;
                        break;
                    }
                }
                if(index>-1){
                    dataV['data'].splice(index,1);
                }
            }
            if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
                dataV['data'].splice(dataV['templateData'].maxCount);
            }
            var includeAsItemsInResponse =  dataV['templateData']["includeAsItemsInResponse"];
            if(includeAsItemsInResponse){
                includeAsItemsInResponse = includeAsItemsInResponse.split(",");
            } else {
                includeAsItemsInResponse = [];
            }
            var o = {};
            if(includeAsItemsInResponse.length){
                for(var i=0;i<dataV['data'].length;i++){
                    if(includeAsItemsInResponse[i]){
                        o[includeAsItemsInResponse[i]] = {"title":Utils.trimSentence(dataV["data"][i].title,150,"").finalString,"newsUrl":(dataV["data"][i].newsUrl||dataV["data"][i].url)}; 
                    }
                }
            }
            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    var data = {};
                    data["templateData"] = dataV["templateData"];

                    data['viewData'] = html;
                    if(includeAsItemsInResponse.length){
                        data['itemData'] = o;
                    }
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    res.send(200, data);
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
        
        
}
function handleGenericRequest(req,res,next,props,dataArray,queue){
    req.loadTime.push(new Date().getTime());
    var p = staticMixinController.getGenericApiRequest(req,res,next,false,props);
    if(queue){
        queue.push(p);
    }
    p.then(function(result){
        req.loadTime.push(new Date().getTime());
            var dataV = {};
            dataV["templateData"]  = props || req.query;
            
            dataV["templateData"]["heading"] = decodeURIComponent(dataV["templateData"]["heading"]);

            
            dataV['data'] = p.data;
            dataV["templateData"].counts = p.counts;
            if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
                dataV['data'].splice(dataV['templateData'].maxCount);
            }
            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    var data = {};
                    data["templateData"] = dataV["templateData"];

                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);
                    }
                    // res.send(200, data);
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
}
function handleFileData(req,res,next,props,dataArray,queue){
    var templateData  = props || req.query;
    if(!templateData.mixinName){
        res.end();
        return;
    }
    var dataV = {};
    var fileName = templateData.mixinName.split("/");
    var fName = fileName.join("_");
    if(staticDataController[fName]){
        req.loadTime.push(new Date().getTime());
        var dataPromise = staticDataController[fName](req,res,next);
        
        if(dataPromise && dataPromise.then){
            if(queue){
                queue.push(dataPromise);
            }
            dataPromise.then(function(response){
                dataV['data'] = dataPromise.data;
                res.render(templateData.mixinName, {
                  data : dataV
                    
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    var data = {};
                    data["templateData"] = templateData;
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);    
                    }
                    
                });
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
        } else {
            if(dataPromise!="redirect" || !dataPromise){
                res.render(templateData.mixinName, {
                  data : dataV
                    
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    var data = {};
                    data["templateData"] = templateData;
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);    
                    }
                    // res.send(200, data);
                });
            }
        }

    } else {
        res.render(templateData.mixinName, {
                  data : dataV
                    
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    var data = {};
                    data["templateData"] = templateData;
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);    
                    }
                    // res.send(200, data);
                });
    }
    
}
function handleContentData(req,res,next,props,dataArray,queue){
    var templateData  = props || req.query;
    req.loadTime.push(new Date().getTime());
    var promise = getContentData(req,res,next,props);
    if(queue){
        queue.push(promise);
    }
    promise.then(function(result){
        req.loadTime.push(new Date().getTime());
            var dataV = {};
            dataV["templateData"]  = templateData;
            dataV['data'] = parseContentData(req,result);
            var catsData;
            var contentData = req.environment.partnerContentData;
            var currentContentTypeData;
            for(var k in contentData){
                if(contentData[k].props.id==templateData.generic_content_type){
                    catsData = contentData[k].categories;
                    currentContentTypeData = contentData[k].props;
                    break;
                }
            }
            if(templateData.categoryId && catsData && catsData.length){
                var currentCat = catsData.filter(function(item){
                    return item.id==templateData.categoryId;
                });
                dataV["currentCat"] = currentCat[0];
                
            } else {
                 dataV["currentCat"] = currentContentTypeData || {};
            }
            if(dataV['templateData'].excludeNews){
                var index = -1;
                for(var i=0;i<dataV['data'].length;i++){
                    if(dataV['data'][i].id==dataV['templateData'].excludeNews){
                        index=i;
                        break;
                    }
                }
                if(index>-1){
                    dataV['data'].splice(index,1);
                }
            }
            if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
                dataV['data'].splice(dataV['templateData'].maxCount);
            }
            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    var data = {};
                    data["templateData"] = dataV["templateData"];
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    // res.send(200, data);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);    
                    }
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 

}
function handleContentParamData(req,res,next,props,dataArray,queue){
    var templateData  = req.query;
    req.loadTime.push(new Date().getTime());
    var  promise = getContentParamData(req,res,next,props);
    if(queue){
        queue.push(promise);
    }
    promise.then(function(result){
        req.loadTime.push(new Date().getTime());
            var dataV = {};
            dataV["templateData"]  = templateData;
            dataV['data'] = parseContentParamData(req,result);
            var catsData;
            var contentData = req.environment.partnerContentData;
            var currentContentTypeData;
            for(var k in contentData){
                if(contentData[k].props.id==templateData.generic_content_type){
                    catsData = contentData[k].categories;
                    currentContentTypeData = contentData[k].props;
                    break;
                }
            }
            if(templateData.categoryId && catsData && catsData.length){
                var currentCat = catsData.filter(function(item){
                    return item.id==templateData.categoryId;
                });
                dataV["currentCat"] = currentCat[0];
                
            } else {
                 dataV["currentCat"] = currentContentTypeData || {};
            }
            
            if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
                dataV['data'].splice(dataV['templateData'].maxCount);
            }
            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    var data = {};
                    data["templateData"] = dataV["templateData"];
                    data['viewData'] = html;
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    // res.send(200, data);
                    if(dataArray){
                        dataArray.push(data);
                    } else {
                        res.send(200, data);    
                    }
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 

}

function handleLocationData(req,res,next,props,dataArray,queue) {
     var catId = req.query.categoryId;
     var options = {
                    rdm : apiHelper.getURL(Constants.getLocationDataUrl,req.partner)
                };
  
        options.rdm.setRDMProperty("1","category",catId);     
        options.rdm.setRDMProperty("1","sendSync","true");
        req.loadTime.push(new Date().getTime());
        var promise = apiHelper.get(options, req, res);
        if(queue){
            queue.push(promise);
        }
        promise.then(
            function(response) {
                var dataV = {};
                dataV["templateData"]  = req.query;
             
                dataV['data'] = parseLocationData(req,response,catId);
                res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                    data : dataV
                    }, function(err, html) {
                        req.loadTime.push(new Date().getTime());
                        if (err) {
                            logger.error('in index file', err.message);
                            return next(err);
                        }
                        var data = {};
                        data["templateData"] = dataV["templateData"];
                        data['viewData'] = html;
                        Utils.writeToLogFile(logger,req.loadTime,req);
                        // res.send(200, data);
                        if(dataArray){
                            dataArray.push(data);
                        } else {
                            res.send(200, data);    
                        }
                    });
            },function(err) {
                next(err);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 

}
function parseLocationData(req,rdm,catId) {
 
    var finalData = {};
    var locations = [];
    var locationNames = {};
    var catNames = {};
    var cats = [];

    for(var k in rdm.rdRows){
        var catId = rdm.rdRows[k].catId;
        var locId = rdm.rdRows[k].locationId;
        if(!finalData[locId]) {
            finalData[locId] = {};
        }
        finalData[locId][catId] = rdm.rdRows[k];

        if(locations.indexOf(locId) <0) {
            locations.push(locId);
            locationNames[locId] = rdm.rdRows[k].locationName;
        }

        if(cats.indexOf(catId) <0) {
            cats.push(catId);
            catNames[catId] = rdm.rdRows[k].catName;
        }

        //data.push(rdm.rdRows[k]);
    }
    finalData.locations = locations;
    finalData.locationNames = locationNames;
    finalData.cats = cats;
    finalData.catNames = catNames;

    return finalData;
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
function getGenericApiRequest(req,res,next){
    
}
function parseContentData(req,rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var d = commonContentController.getData(req,rdm,newsId);
        
        data.push(d);
    }
    var sortFunction = function(a,b){
        var d1 = new Date(a.date_content).getTime();
        var d2 = new Date(b.date_content).getTime();
        if(d1==d2){
            var s1 = a.title;
            var s2 = b.title;
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
function parseContentParamData(req,rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var newsId = rdm.rdRows[k].id;
        var option = rdm.rdRows[k].option_count;
       
        if(option && option!="null"){
            option = parseInt(option);
            for(var i=0;i<option;i++){
                data.push(rdm.rdRows[k]["option_name_"+i]);
            }
        }
    }
    return data;
    
};
function getContentData(req,res,next,props){
    var templateData  = props || req.query;
    var catId = templateData.categoryId;
    var content_type = templateData.generic_content_type;
    var count = templateData.newsCount;
    var options = staticMixinController.getContentData(req,res,next,props);
    
    if(catId)
        options.rdm.setRDMProperty("1","category",catId); 
    options.rdm.setRDMProperty("1","sendSync","true");
    
    options.rdm.setRDMProperty("1","newsType","USER");
    if(count) {
        options.rdm.setRDMProperty("1","counts",count);   
    } else {
        options.rdm.setRDMProperty("1","counts",newsCountInPage);
    }
    
    if(templateData.group_id && templateData.group_content_type){
        options.rdm.setRDMProperty("1","group_id",templateData.group_id);
        options.rdm.setRDMProperty("1","content_type",templateData.group_content_type);
        options.rdm.setRDMProperty("1","group_content_type",content_type);
                    
    } else {
        options.rdm.setRDMProperty("1","content_type",content_type);
    }
    if(templateData.extra_param_key && templateData.extra_param_value){
        options.rdm.setRDMProperty("1",templateData.extra_param_key,templateData.extra_param_value);
    }            
    
    
    return apiHelper.get(options, req, res);
        
}

function getContentParamData(req,res,next,props){
    var templateData  = props || req.query;
    var catId = templateData.categoryId;
    var content_type = templateData.generic_content_type;
    var name = templateData.param_name;
    var count = templateData.newsCount;
    var options = staticMixinController.getContentParamData(req,res,next,props);
    
    if(catId)
        options.rdm.setRDMProperty("1","category",catId); 
    options.rdm.setRDMProperty("1","sendSync","true");
    
    options.rdm.setRDMProperty("1","newsType","USER");
    if(count) {
        options.rdm.setRDMProperty("1","counts",count);   
    } else {
        options.rdm.setRDMProperty("1","counts",newsCountInPage);
    }
    // console.log(templateData);
    if(templateData.group_id && templateData.group_content_type){
        options.rdm.setRDMProperty("1","group_id",templateData.group_id);
        options.rdm.setRDMProperty("1","content_type",templateData.group_content_type);
        options.rdm.setRDMProperty("1","group_content_type",content_type);
        options.rdm.setRDMProperty("1","name",name);
                    
    } else {
        options.rdm.setRDMProperty("1","content_type",content_type);
        options.rdm.setRDMProperty("1","name",name);
    }
    if(templateData.extra_param_key && templateData.extra_param_value){
        options.rdm.setRDMProperty("1",templateData.extra_param_key,templateData.extra_param_value);
    }            
    
    
    return apiHelper.get(options, req, res);
        
}
function handleNewsData(req,res,next,props,dataArray,queue){
    var item = props;        
    var catId = item.categoryId;
    var count  = item.newsCount;
    var type = item.content_type;
    var pp = getCategoryNews(req,res,catId,count);
    queue.push(pp);
    pp.then(function(result){
        req.loadTime.push(new Date().getTime());
        var dataV = {};
        dataV["templateData"]  = props;
        
        dataV["templateData"]["heading"] = decodeURIComponent(dataV["templateData"]["heading"]);

        
        dataV['data'] = commonController.getListingData(req,result,catId);
        var currentCat = req.environment.partnerCatData.filter(function(item1){
            return item1.id==catId;
        });
        
        
        if(currentCat.length>0){
            dataV["currentCat"] = currentCat[0];
            dataV["templateData"]["currentCat"] = currentCat[0];    
        }
      
        if(dataV['templateData'].excludeNews){
            var index = -1;
            for(var i=0;i<dataV['data'].length;i++){
                if(dataV['data'][i].newsId==dataV['templateData'].excludeNews){
                    index=i;
                    break;
                }
            }
            if(index>-1){
                dataV['data'].splice(index,1);
            }
        }
        if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
            dataV['data'].splice(dataV['templateData'].maxCount);
        }
        
        res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
            data : dataV
            }, function(err, html) {
                req.loadTime.push(new Date().getTime());
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                var data = {};
                data["templateData"] = dataV["templateData"];

                data['viewData'] = html;
                Utils.writeToLogFile(logger,req.loadTime,req);
                dataArray.push(data);
                // res.send(200, data);
            });
        

    },function(e){
        next(e);
    }).catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    }); 
                    
}
function renderXHRCatNewsAll(req, res, next) {
        // console.log(req.body);
        var returnData = [];
        var queue = [];
        
        req.loadTime.push(new Date().getTime());
        
        var dataItems = req.body.items;
        
        req.environment.isLoggedInUser  = false;
        
        if(req.cookies && req.cookies._xhr_verified_ && req.cookies._xhr_verified_==1){
            req.environment.isLoggedInUser = true;
        }

        // console.log(dataItems);
        if(dataItems && dataItems.length){
            for(var i=0;i<dataItems.length;i++){
                var item = dataItems[i];        
                var catId = item.categoryId;
                var count  = item.newsCount;
                var type = item.content_type;
                // console.log(item);
                item.mixinName = decodeURIComponent(item.mixinName);
                item.heading = decodeURIComponent(item.heading);
                item.partner=req.partner;
                // console.log("==========");
                // console.log(item);

                if(type=="CATEGORY_LISTING" || type=="AUTHOR_LISTING" || type=="COMMENT_WIDGET" || type=="OTHER"){
                    var dataV={};
                    staticMixinController.getSingleData(req,res,item,dataV);
                    req.loadTime.push(new Date().getTime());
                    
                    var promise  = new Promise(function(resolve,reject){
                            res.render(PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                                data : dataV
                                }, function(err, html) {
                                    req.loadTime.push(new Date().getTime());
                                    if (err) {
                                        logger.error('in index file', err.message);
                                        return next(err);
                                    }
                                    var data = {};
                                    data["templateData"] = dataV["templateData"];
                                    data['viewData'] = html;
                                    Utils.writeToLogFile(logger,req.loadTime,req);
                                    returnData.push(data);
                                    resolve("");
                                    // res.send(200, data);
                            });
                    });
                    queue.push(promise);
                 
                }
                if(type=="FILE") {
                    handleFileData(req,res,next,item,returnData,queue);
                }
                if(type=="GENERIC") {
                    handleGenericRequest(req,res,next,item,returnData,queue);
                }
                if(type=="CONTENT_DATA") {
                    handleContentData(req,res,next,item,returnData,queue);
                }
                if(type=="CONTENT_PARAM_DATA") {
                    handleContentParamData(req,res,next,item,returnData,queue);
                }
                if(type=="LOCATION_DATA") {
                    handleLocationData(req,res,next,item,returnData,queue);
                }
                if(type=="CATEGORY_NEWS"){
                    req.loadTime.push(new Date().getTime());
                    handleNewsData(req,res,next,item,returnData,queue);
                    
                }
            }
        } else {

        }
        if(queue.length){
            var q = Q.all(queue);
            q.then(function(){
                res.send(200,returnData);
            },
            function(err){
                
            }).catch(function(e) {
                
            });  
        } else {

            res.send(200,returnData);
        }
        
        
        
}

function loadAdInIframe(req,res,next){
    var ads = PartnerContentTemplateModel.getAMPPageTemplate(req,PartnerPropsModel.data[req.partner]["theme"]);
    var elementId = req.query.elementId;
    var doc = "<html><head></head><body>";
    if(!elementId){
        doc+="<div style='font-size:30px;> No Data To Load</div>";
        doc+="</body>";
        res.send(doc);
    }
    var adHtml = "";
    if(ads[elementId] && ads[elementId]['adType']=='iframe' && ads[elementId]['is_visible']){
            adHtml = ads[elementId]['content'];
            doc+=adHtml;
            doc+="</body>";
           
    } else {
        doc+="</body>";
    }
    
    res.send(doc);
    res.end();
}
module.exports.loadAdInIframe = loadAdInIframe;
module.exports.renderXHRCatNews = renderXHRCatNews;
module.exports.renderXHRCatNewsAll=renderXHRCatNewsAll;