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
var logger = require('src/libs/logger');
var extend = require("extend");

function renderSubscriptionPage(req, res, next,props) {
        console.log("====================== Inside renderSubscriptionPage =========================");
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);
        var mainNewsCatId = props.id;
        
        
        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
        });
        
        var catIds = [];        
        var newsCount = [];

        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        promises.push(getSubscribePageData(req,res)); 
        
        Q.all(promises).then(function(result){
            var data = {};
            var dataV = {};
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);

            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
          
            var mainListingData = parseSubscriptionPlanData(req,result[0]);
            console.log(mainListingData);
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = mainListingData;
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/subscription', {
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

function renderSubscriptionDetailsPage(req, res, next,props) { 

    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_listing",props.theme);
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_listing",props.theme);
        
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        Utils.setAsyncTenmplates(req,aTemplates);
        var mainNewsCatId = props.id;
        
        
        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
        });
        
        var catIds = [];        
        var newsCount = [];

        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        if(catIds){
            catIds = catIds.join(",");
            newsCount = newsCount.join(",");
        }
        var promises = [];
        var uid = req.query.planId;
        promises.push(getSubscribePageData(req,res,uid)); 
        
        Q.all(promises).then(function(result){
            var data = {};
            var dataV = {};
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);

            dataV['mainCatNews'] = {};
            dataV['mainCatNews']["catData"] = props;
          
            var mainListingData = parseSubscriptionPlanData(req,result[0]);
            console.log(mainListingData);
            dataV['mainCatNewsCount'] =mainListingData.length;
            dataV['mainCatNews']["data"] = mainListingData;
            res.render(PartnerPropsModel.data[req.partner]["theme"]+'/subscriptionDetails', {
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

function parseSubscriptionPlanData(req,rdm){
    console.log("================ parseSubscriptionPlanData = "+rdm.toXML());
    var data = [];
    for(var k in rdm.rdRows){
        var d = parseSubscriptionPlanItem(k,rdm);
        data.push(d);
    }
    // var sortFunction = function(a,b){
    //     var d1 = new Date(a.date);
    //     var d2 = new Date(b.date);
    //     return d2-d1;
    // }    
    // data.sort(sortFunction);
    data = data.sort(function(a,b){
            var a1 = a.sorting_order ? a.sorting_order :1000;
            var b1 = b.sorting_order ? b.sorting_order : 1000;
            if(a1!=b1){
                return a1-b1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
            // var res = (a.sorting_order) 
            // return (a.sorting_order - b.sorting_order);
    });
    console.log(data);
    return data;
};

function parseSubscriptionPlanItem(id,rdm) {
    var data  = {};
    var row = rdm.rdRows[id];
    for(var k in row){
        data[k] = row[k];
    }
    data.partner = rdm.getRDMAttribute('partner');
    
    return data;
}

function getSubscribePageData(req,res,uid,page){
    console.log("================================== getSubscribePageData");
    var options = {
                    rdm : apiHelper.getURL(Constants.getSubscriptionPlanUrl,req.parentPartner || req.partner)
                };
        options.rdm.setRDMProperty("1","sendSync","true");
        if(uid && uid.length >=1) {
            options.rdm.setRDMProperty("1","planId",uid);
        }
        return apiHelper.get(options, req, res);
        
}

module.exports.renderSubscriptionPage = renderSubscriptionPage;
module.exports.renderSubscriptionDetailsPage = renderSubscriptionDetailsPage;
