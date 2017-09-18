"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var Q = require("q");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var newsCountInPage = 12;
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var PartnerNewsCacheModel = require('src/models/PartnerNewsCacheModel');
var logger = require('src/libs/logger');
var extend = require("extend");

function renderSimilarHomePage(req, res, next,props) {
        var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"homev2",props.theme,"home");
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"homev2",props.theme,"home");
        var aTemplates = [];
       
       

        var syncNews = syncTemplates.filter(function(item){
            return item.content_type=="CATEGORY_NEWS";
        });
        var catIds = [];  
        var newsCount = [];      
        
        for(var i=0;i<syncNews.length;i++){
            catIds.push(syncNews[i].categoryId);
            newsCount.push(syncNews[i].newsCount)
        }
        


        newsCount = newsCount.join(",");
        catIds = catIds.join(",");
        req.loadTime.push(new Date().getTime());
                        
        getCategoryNews(req,res,catIds,newsCount).then(function(result){
            req.loadTime.push(new Date().getTime());
                        
            // var data = {};
            // console.log("======================\n\n\n\n\n\n");
            var allnews = commonController.getListingData(req,result);

            // console.log("======================\n\n\n\n\n\n");
            var dataV = commonController.parseNewsByCateogires(allnews,syncNews);

            asyncTemplates = PartnerNewsCacheModel.mergeAsynvWithSyncIfInCache(req,res,asyncTemplates,dataV);


            Utils.setAsyncTenmplates(req,asyncTemplates);
            staticMixinController.getMixinData(req,res,syncTemplates,dataV);
            
            
            
            staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
            req.loadTime.push(new Date().getTime());
            
            Utils.render(req,res,PartnerPropsModel.data[req.partner]["theme"]+'/homepage', {
                data : dataV
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                        
                    // console.log(html);
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    res.send(200, html);
                });
            
   
        },function(e){
            next(e);
        }).catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        }); 
        
        
}

function getCategoryNews(req,res,catId,newsCount,lang){
    var options = staticMixinController.getCategoryNews(req,res);
        
        options.rdm.setRDMProperty("1","category",catId); 
        options.rdm.setRDMProperty("1","counts",newsCount); 

        options.rdm.setRDMProperty("1","sendSync","true");
        options.rdm.setRDMProperty("1","newsType","USER");

        if(!newsCount)
            options.rdm.setRDMProperty("1","count",newsCountInPage);
       
        if(lang){
            options.rdm.setRDMAttribute("lang",lang);
        }
        return apiHelper.get(options, req, res);
        
}
module.exports.renderSimilarHomePage = renderSimilarHomePage;
