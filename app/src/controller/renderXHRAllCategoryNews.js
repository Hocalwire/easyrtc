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
var logger = require('src/libs/logger');
function writeResponseData(req,res,data,callback,count){
    res.write(data);
    callback(count);
}

function addToData(count,data,fullData){
    console.log("called full data write");
    console.log(data);
    if(!fullData){
        fullData = {};
    } 
    if(!fullData[data.templateData.element_id]){
        fullData[data.templateData.element_id] = data;
    }
    return fullData;
}
function getStaticData(dataPassed){
    
    var promise  = new Promise(function(resolve,reject){
        resolve("");
    });
    promise.data=dataPassed;
    promise.then(function(data){
        // promise.data = dataPassed;
    },
    function(e) {
        logger.error('error caching page', e.message);
        // next(e);
    })
    .catch(function(e) {
        logger.error('error caching page callback:', e.message);
        // next(e);
    }); 
    return promise;
}
function getCategoryNewsCombine(req,res,catId,newsCount){
        var options = staticMixinController.getCategoryNews(req,res);
        
        options.rdm.setRDMProperty("1","category",catId); 
        options.rdm.setRDMProperty("1","counts",newsCount); 

        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");

        
        return apiHelper.get(options, req, res);
        
}
function renderXHRCatNews(req, res, next) {
        var data = req.body;
        var items = data.items;
        if(!items || !items.length){
            logger.info("No Items in body");
            res.end();
            return;
        }
        var initCount = 0;
        var totalCount = items.length;
        var fullData = {};

        var callbackFn = function(){
            initCount++;
            if(initCount>=totalCount){
                console.log("all data is written");
                console.log(fullData);
                req.send(fullData);
                
            }
        }
        var newsItems = [];
        var promisses = [];

        for(var  i=0;i<items.length;i++){
            var item = items[i];
            var catId = item.categoryId;
            var count  = item.newsCount;
            var type = item.content_type;
            req.environment.isLoggedInUser  = false;
            if(req.cookies && req.cookies._xhr_verified_ && req.cookies._xhr_verified_==1){
                req.environment.isLoggedInUser = true;
            }
            
            if(type=="CATEGORY_LISTING" || type=="AUTHOR_LISTING" || type=="COMMENT_WIDGET" || type=="OTHER"){
                var dataV={};
                staticMixinController.getSingleData(req,res,item,dataV);
                promisses.push(getStaticData(dataV));
            }
            else if(type=="FILE") {
                    promisses.push(handleFileData(req,res,next,fullData,callbackFn,item));
            }
            else if(type=="GENERIC") {
                promisses.push(handleGenericRequest(req,res,next,fullData,callbackFn,item));
            }
            else if(type=="CONTENT_DATA") {
                promisses.push(handleContentData(req,res,next,fullData,callbackFn,item));
            }
            else if(type=="CONTENT_PARAM_DATA") {
                promisses.push(handleContentParamData(req,res,next,fullData,callbackFn,item));
            }
            else if(type=="LOCATION_DATA") {
                promisses.push(handleLocationData(req,res,next,fullData,callbackFn,item));
            }
            else {
                newsItems.push(item);
            }
        }
        var catIds = [];  
        var newsCount = [];      
        
        for(var i=0;i<newsItems.length;i++){
            catIds.push(newsItems[i].categoryId);
            newsCount.push(newsItems[i].newsCount)
        }


        newsCount = newsCount.join(",");
        catIds = catIds.join(",");
        
        promisses.push(getCategoryNewsCombine(req,res,catIds,newsCount));
               
}

function handleGenericRequest(req,res,next,fullData,callbackFn,item){
    req.query=item;
    var p = staticMixinController.getGenericApiRequest(req,res,next);
    p.then(function(result){
            var dataV = {};
            dataV["templateData"]  = item;
            
            dataV["templateData"]["heading"] = decodeURIComponent(dataV["templateData"]["heading"]);

            
            dataV['data'] = p.data;
            dataV["templateData"].counts = p.counts;
            if(dataV['templateData'].maxCount && dataV['data'].length > dataV['templateData'].maxCount){
                dataV['data'].splice(dataV['templateData'].maxCount);
            }
            console.log(dataV);
            renderAndWriteResponseData(req,res,PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, fullData,callbackFn);
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
}
function handleFileData(req,res,next,fullData,callbackFn,item){
    var templateData  = item;
    req.query=item;
    if(!templateData.mixinName){
        res.end();
        return;
    }
    var dataV = {};
    var fileName = templateData.mixinName.split("/");
    var fName = fileName.join("_");
    if(staticDataController[fName]){
        var dataPromise = staticDataController[fName](req,res,next);
        
        if(dataPromise && dataPromise.then){
            dataPromise.then(function(response){
                dataV['data'] = dataPromise.data;
                renderAndWriteResponseData(req,res,templateData.mixinName, {
                  data : dataV
                    
                }, fullData,callbackFn);
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
        } else {
            if(dataPromise!="redirect" || !dataPromise){
                renderAndWriteResponseData(req,res,templateData.mixinName, {
                  data : dataV
                    
                }, fullData,callbackFn);
            }
        }

    } else {
        renderAndWriteResponseData(req,res,templateData.mixinName, {
                  data : dataV
                    
                }, fullData,callbackFn);
    }
    
}
function handleContentData(req,res,next,fullData,callbackFn,item){
    var templateData  = item;
    req.query=item;
    getContentData(req,res,next).then(function(result){
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
            renderAndWriteResponseData(req,res,PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, fullData,callbackFn);
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 

}
function handleContentParamData(req,res,next,fullData,callbackFn,item){
    var templateData  = item;
    req.query=item;
    getContentParamData(req,res,next).then(function(result){
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
            renderAndWriteResponseData(req,res,PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                data : dataV
                }, fullData,callbackFn);
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 

}

function handleLocationData(req,res,next,fullData,callbackFn,item) {
    req.query=item;
     var catId = item.categoryId;
     var options = {
                    rdm : apiHelper.getURL(Constants.getLocationDataUrl,req.partner)
                };
  
        options.rdm.setRDMProperty("1","category",catId);     
        options.rdm.setRDMProperty("1","sendSync","true");
        apiHelper.get(options, req, res).then(
            function(response) {
                var dataV = {};
                dataV["templateData"]  = item;
             
                dataV['data'] = parseLocationData(req,response,catId);
                renderAndWriteResponseData(req,res,PartnerPropsModel.data[req.partner]['theme']+'/newsXHRListing', {
                    data : dataV
                    }, fullData,callbackFn);
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
        var d1 = new Date(a.date_content);
        var d2 = new Date(b.date_content);
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
function getContentData(req,res,next,fullData,callbackFn,item){
    var templateData  = req.query;
    var catId = templateData.categoryId;
    var content_type = templateData.generic_content_type;
    var count = templateData.newsCount;
    var options = staticMixinController.getContentData(req,res);
    
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

function getContentParamData(req,res,next){
    var templateData  = req.query;
    var catId = templateData.categoryId;
    var content_type = templateData.generic_content_type;
    var name = templateData.param_name;
    var count = templateData.newsCount;
    var options = staticMixinController.getContentParamData(req,res);
    
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
function loadAdInIframe(req,res,next){
    var ads = PartnerContentTemplateModel.getAMPPageTemplate(req,PartnerPropsModel.data[req.partner]["theme"]);
    var elementId = item.elementId;
    var doc = "<html><head></head><body>";
    if(!elementId){
        doc+="<div style='font-size:30px;> No Data To Load</div>";
        doc+="</body>";
        res.write(doc);
    }
    var adHtml = "";
    if(ads[elementId] && ads[elementId]['adType']=='iframe' && ads[elementId]['is_visible']){
            adHtml = ads[elementId]['content'];
            doc+=adHtml;
            doc+="</body>";
           
    } else {
        doc+="</body>";
    }
    
    res.write(doc);
    res.end();
}
module.exports.loadAdInIframe = loadAdInIframe;
module.exports.renderXHRCatNews = renderXHRCatNews;
