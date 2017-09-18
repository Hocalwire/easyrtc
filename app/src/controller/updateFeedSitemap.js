"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var commonController = require("src/controller/helpers/commonController");
var UpdateFeedSitemap = require("src/controller/helpers/UpdateFeedSitemap");
var UpdateCustomFeedSitemap = require("src/controller/helpers/UpdateCustomFeedSitemap");
var UpdateNewsSitemap = require("src/controller/helpers/UpdateNewsSitemap");
var partnerNewsCacheModel = require("src/models/PartnerNewsCacheModel");

var Promise = require('promise');
var logger = require('src/libs/logger');
var extend = require("extend");

function updateFeedSitemap(req, res, next) {
    var options = {
            rdm : apiHelper.getURL(Constants.validateURL,req.partner)
        };
    var path = req.query.path;
    options.rdm.setRDMProperty("1","url",path);
    apiHelper.get(options, req, res)
        .then(function(response) {
            //pageType, 

            var newsId = "";
            var pageType = "";
            var httpCode = "";
            var finalUrl = "";
            for(var k in response.rdRows){
                newsId = response.rdRows[k].id;
                pageType = response.rdRows[k].pageType;
                httpCode = response.rdRows[k].http_response;
                finalUrl = response.rdRows[k].url;
                break;
            }
            

            if(httpCode == '404') {
                res.status(404);
                next();
                return;
            } else if(httpCode == '301') {
                res.redirect(301, finalUrl);
                return;
            }
            
            if(pageType == 'news_details') {
                partnerNewsCacheModel.clearCache();
                var d = commonController.getData(req,response,newsId);
                if(d && d.title){
                    var pData = req.environment.partnerData;
                    d.editorEmail = pData.editorEmail;
                    d.copyright = pData.partnerCopyrightName || pData.partnerName || req.partner;
                    d.description = Utils.trimSentence(d.description || d.story,200,"...").finalString;
                    var mediaUrl = Utils.getMediaUrl(d,"",req.environment.rootUrl);
                    if(pData.rss_prepend_image_in_story && mediaUrl){
                        d.description = '<img src="'+mediaUrl+'" alt="'+d.title+'">'+d.description;
                    }
                    if(pData.rss_prepend_image_in_story && mediaUrl){
                        d.story = '<img src="'+mediaUrl+'" alt="'+d.title+'"/>'+d.story;
                    }
                    console.log("============================================== updating feed-----------------------------------");
                    UpdateFeedSitemap.updateFeed(req,res,d);
                    console.log("============================================== updating news feed");
                    UpdateNewsSitemap.updateFeed(req,res,d);
                    console.log("============================================== updating done");
                    // if(req.environment.partnerData.create_custom_feed_with_all_data){
                    UpdateCustomFeedSitemap.updateFeed(req,res,d);
                    // }
                    
                }  
            } 
    },
    function(e) {
        logger.error('error caching page', e.message);
        next(e);
    })
    .catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    });       
        
}


module.exports.updateFeedSitemap = updateFeedSitemap;
