"use strict";


var CommonUtils = require("src/libs/CommonUtils");
var Environment = require('src/models/Environment');
var url = require("url");
var logger = require('src/libs/logger');
var xhrCatNews = require("src/controller/renderXHRCategoryNews");
// var xhrAllCatNews = require("src/controller/renderXHRAllCategoryNews");
var cacheHandler = require("src/controller/cacheHandler");
var updateFeedSitemap = require("src/controller/updateFeedSitemap");
var readNewsHandler = require("src/controller/readNewsHandler");
var adsController = require("src/controller/adLoadController");
var loginController = require("src/controller/loginAndRegisterHandler");
var cmsController = require("src/controller/cmsSearchController");
var notificationHandler = require("src/controller/notificationHandler");
var subscriptionController = require("src/controller/subscriptionHandler");
var profileLogger = require("src/controller/helpers/profileLogger");
var postToSocial = require("src/controller/postToSocial");
var PartnerContentModel = require('src/models/PartnerContentModel');
var contentCatPageHandler = require('src/controller/renderContentCatPage');
var contentSearchPageHandler = require('src/controller/renderContentSearch');
var notificationHandler = require("src/controller/notificationHandler");
var commonContentController = require("src/controller/helpers/commonContentController");
var cartController = require("src/controller/cartController");
var partnerNewsCacheModel = require("src/models/PartnerNewsCacheModel");
var Utils = require("src/libs/Utils");
var fs = require("fs");
var pollCount=0;
module.exports.setup = function(app) {
     // setup environment
    app.all('/*', function(req, res, next) {
            var partner = req.partner;
            if(!req.pathname) {
                next();
                return;
            }
            var reqType = req.pageRequestType;
            if(reqType=="xhr" || req.xhr){
                CommonUtils.getPartnerProps(partner,req,res,next).then(
                    function(){
                        processXHRRequest(req,res,next);
                        
                    },
                    function(err, html){
                        if (err) {
                            logger.error('error in xhrHandler file', err.message);
                            return next(err);
                        }
                        res.send(200, html);
                    }
                ).catch(function(e) {
                    logger.error('in callback xhrHandler page', e.message);
                    return next(e);
                });
               
            } else {
                next();
            }
            
    });
};

function processXHRRequest(req,res,next){
    logger.info("\n\n\n\n");
    logger.info("======================================xhr handler url call : "+req.url);
    logger.info("\n\n\n\n");
    var pathname = req.pathname;
    if(pathname=="/xhr/admin/make-video-live"){
        postToSocial.postVideoToFacebook(req,res,next);
        return;
    }
    if(pathname=="/xhr/admin/make-video-live"){
        postToSocial.postVideoToFacebook(req,res,next);
        return;
    }
    if(pathname=="/xhr/admin/update-stream-state"){
        console.log("update stream is called");
        console.log(req.query);
        postToSocial.setProcessStateFromCMS(req,res,next);
        return;
    }
    if(pathname=="/xhr/admin/loadSampleJSON"){
        res.send({errorCode:"0","data":[{"name":"ash"},{"name":"mish"}]});
        return;
    }
    if(req.pathname.indexOf("/xhr/admin/cart/")==0 || req.pathname.indexOf("/xhr/admin/user/")==0){
        cartController.handleRequest(req,res,next);
        return;
    }
    if(pathname=="/xhr/admin/save-user-location"){
        var lat = req.query.lat;
        var lng = req.query.lng;
        if(lat && lng){
            Utils.addLocation(lat,lng,req.partner);    
        }
        res.end();
        return;
    }
    if(pathname=="/xhr/admin/getNotification"){
        notificationHandler.sendNotification(req,res,next);
    } 
    else if(pathname=="/xhr/admin/loadYoutubeThumb"){
        cacheHandler.renderYoutubeThumb(req,res,next);
    } else if(pathname=="/xhr/admin/downloadYoutubeThumb"){
        cacheHandler.imageDownload(req,res,next);
    } 
    
    // else if(pathname=="/xhr/admin/pollServer"){
    //     var res1 = 'WAITING\nMESSAGE\nRDM\n<?xml version="1.0" encoding="UTF-8"?><rdm  sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" app="rdes" partner="sudarshan" action="com.rdes.service.rdm.RDMessageHandler#validateLogin:response" errorCode="0" isLoggedIn="false"><property   id="1"  avatarId="null" name="" sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" userId="19577"/></rdm>';
    //     var res2 = 'DISCONNECTED\nMESSAGE\nRDM\n<?xml version="1.0" encoding="UTF-8"?><rdm  sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" app="rdes" partner="sudarshan" action="com.rdes.service.rdm.RDMessageHandler#validateLogin:response" errorCode="0" isLoggedIn="false"><property   id="1"  avatarId="null" name="" sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" userId="19577"/></rdm>';
    //     var res3 = 'UNREACHABLE\nEMPTY\nRDM\n<?xml version="1.0" encoding="UTF-8"?><rdm  sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" app="rdes" partner="sudarshan" action="com.rdes.service.rdm.RDMessageHandler#validateLogin:response" errorCode="0" isLoggedIn="false"><property   id="1"  avatarId="null" name="" sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" userId="19577"/></rdm>';
    //     var res4 = 'FALIED\nMESSAGE\nRDM\n<?xml version="1.0" encoding="UTF-8"?><rdm  sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" app="rdes" partner="sudarshan" action="com.rdes.service.rdm.RDMessageHandler#validateLogin:response" errorCode="0" isLoggedIn="false"><property   id="1"  avatarId="null" name="" sessionId="RDWEBJHZ9MXR2JAIR0WWG3I2UPEMYVI14FXEH" userId="19577"/></rdm>';
    //     pollCount++;
    //     console.log(pollCount);
    //     if(pollCount%2==0){
    //         res.send(200,res1);    
    //     } else if(pollCount%3==0){
    //         setTimeout(function(){
    //             res.send(200,res2);    
    //         },5000);
    //     }
    //     else if(pollCount%7==0){
    //         setTimeout(function(){
    //             res.send(200,res3);    
    //         },60000);
    //     } else if(pollCount%11==0){
    //         setTimeout(function(){
    //             res.send(200,res3);    
    //         },60000);
    //     } else {
    //         res.send(200,res4);    
    //     }
        
    //     return;
    // }
    else if(pathname=="/xhr/admin/shareArticleByEmail"){
        loginController.sendArticleByEmail(req,res,next);
    } else if(pathname=="/xhr/admin/requestCaptcha"){
        loginController.requestCaptcha(req,res,next);
    } else if(pathname=="/xhr/admin/validateCaptch"){
        loginController.validateCaptch(req,res,next);
    } else if(pathname=="/xhr/admin/login/verify-otp"){
        loginController.verifyEmail(req,res,next);
    } else if(pathname=="/xhr/admin/updateContentProperety"){
        commonContentController.updateContentProperty(req,res,next);
    } else if(pathname=="/xhr/admin/addNotification"){
        notificationHandler.addNotification(req,res,next);
    } else if(pathname=="/xhr/admin/send-desktop-notification-data"){
        notificationHandler.sendSubscriptionToServer(req,res,next);
    } else if(pathname=="/xhr/admin/updatePushNotiDataForPartner"){
        notificationHandler.updatePushNotiDataForPartner(req,res,next);
    }else if(pathname=="/xhr/admin/getPartnerNotificationData"){
        notificationHandler.getPartnerNotificationData(req,res,next);
    } else if(pathname=="/xhr/admin/getPartnerNotificationImage"){
        notificationHandler.getImageFromUrl(req,res,next);
    }else if(pathname=="/xhr/getNewsMixin"){
        
        xhrCatNews.renderXHRCatNews(req,res,next);
    }else if(pathname=="/xhr/getNewsMixinAll"){
        
        xhrCatNews.renderXHRCatNewsAll(req,res,next);
    }
    // else if(pathname=="/xhr/admin/getNewsMixinAll"){
        
    //     xhrAllCatNews.renderXHRCatNews(req,res,next);
    // }
    else if(pathname=="/xhr/admin/loadAdIframe"){
        
        xhrCatNews.loadAdInIframe(req,res,next);
    }
    // else if(pathname=="/xhr/getAllNewsMixin"){
        
    //     xhrAllCatNews.renderXHRCatNews(req,res,next);
    // }
    else if(pathname=="/xhr/admin/save-visitor-counts"){
        Utils.updateVisitorsCount(req,res,next);
        res.end();
        return;
    }
    else if(pathname=="/xhr/admin/clearPartnerCache"){
        cacheHandler.clearPartnerCache(req,res,next);
    } else if(pathname=="/xhr/admin/clearNewsCache"){
        partnerNewsCacheModel.clearAllNewsCache(req,res,next);
    } 
    else if(pathname=="/xhr/admin/cacheNewsUrl"){
        cacheHandler.cacheUserNews(req,res,next);
    }
    else if(pathname=="/xhr/admin/updateFeedSitemap"){
        updateFeedSitemap.updateFeedSitemap(req,res,next);
    }
    else if(pathname=="/xhr/admin/send-read-info"){
        readNewsHandler.updateNewsState(req,res,next);
    }
    else if(pathname=="/xhr/admin/loadads"){
        adsController.loadAd(req,res,next);
    }
    else if(pathname.indexOf("/xhr/admin/login/")==0){
        loginController.handleRequest(req,res,next);
    }
    
    else if(pathname=="/xhr/admin/contactus"){
        loginController.contactus(req,res,next);
    }
    else if(pathname=="/xhr/admin/logDetails"){
        var type = req.body.type;
        delete req.body.type;
        profileLogger.logDetails(req,type,req.body);
        res.send(200,"success");
    }
    else if(pathname == "/xhr/admin/getGifTrackingImage"){
        imageDownload(req,res,next);
    }
    else if(pathname == "/xhr/admin/postToSocial"){
        postToSocial.post(req,res,next);
    }
    // else if(pathname == "/xhr/admin/scrape-urls"){
    //     postToSocial.scrapeUrl(req,res,next);
    // }
    else if(pathname == "/xhr/admin/submitSubscription"){
        subscriptionController.submitSubscriptionDetails(req,res,next);
    }
    else if(pathname == "/xhr/admin/save-and-follow"){
        subscriptionController.submitSubscriptionDetails(req,res,next);
    }
    else if(PartnerContentModel.isSearchUrl(req)){
        var props = PartnerContentModel.getCatUrlProps(req);
        req.environment.contentXHRRequest=true;
        contentSearchPageHandler.renderSearchPage(req,res,next,props);
    }else if(PartnerContentModel.isCatUrl(req)){
        var props = PartnerContentModel.getCatUrlProps(req);
        req.environment.contentXHRRequest=true;
        contentCatPageHandler.renderCatPage(req,res,next,props);
        
        
    }

    else if(pathname=="/xhr/admin/contentSearchAutoComplete"){
        contentSearchPageHandler.renderXHRSearch(req,res,next);        
    
    } else if(pathname=="/xhr/admin/get-mp4-as-stream"){
        streamMp4Video(req,res,next);
    }
    else if(pathname == "/xhr/admin/submitJoinUsForm"){
        loginController.handleJoinUs(req,res,next);
    } else if(pathname == "/xhr/admin/getInternalSearchData"){
        cmsController.getInternalSearchData(req,res,next);
    } else if(pathname == "/xhr/admin/getTweetData"){
        cmsController.getTweetSearchData(req,res,next);
    } else if(pathname == "/xhr/admin/getTweetEmbedData"){
        cmsController.getTweetEmbedCode(req,res,next);
    } else if(pathname == "/xhr/admin/requestTrialPackage"){
        subscriptionController.requestTrialPackageAccess(req,res,next);
    } else {
        res.status(404);
        next();
        return;
    }

}{};



function imageDownload(req,res,next){
    var ip = Utils.getIP(req);
    profileLogger.logDetails(req,"loadingSmapleImage",{"newsid":req.query.newsid,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"ip":ip});
    var img = fs.readFileSync('src/public/img/glyphicons-halflings.png');
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');

}
function addComment(req,res,next){
    var data = req.query || req.body;
    var partner = data.partner;
    var mediaIds = data.mediaIds;
    var comment = data.comment;
    var newsId = data.newsId;
    var options = {
                rdm : apiHelper.getURL(Constants.addNewsComment,partner)
            };
    options.rdm.setRDMProperty("1","comment",comment);
    options.rdm.setRDMProperty("1","news_id",newsId);
    options.rdm.setRDMProperty("1","mediaIds",mediaIds);
    apiHelper.get(options, req, res).then(function(rdm){
        res.send(200, {"errorCode":rdm.getRDMAttribute("errorCode")});
    },function(e){
        next(e);
    }).catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    }); 
}
function getComments(req,res,next){
    var data = req.query || req.body;
    var partner = data.partner;
    
    var newsId = data.newsId;
    var options = {
                rdm : apiHelper.getURL(Constants.getNewsComment,partner)
            };
    options.rdm.setRDMProperty("1","news_id",newsId);
    apiHelper.get(options, req, res).then(function(rdm){
        console.log(rdm.toXML());
        res.send(200, {"errorCode":rdm.getRDMAttribute("errorCode")});

    },function(e){
        next(e);
    }).catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    }); 
}


function streamMp4Video(req,res,next){
    var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

    var file = req.query.path;
    fs.stat(file, function(err, stats) {
      if (err) {
        if (err.code === 'ENOENT') {
          return res.sendStatus(404);
        }
      res.end(err);
      }
      var range = req.headers.range;
      if (!range) {
       return res.sendStatus(416);
      }
      var positions = range.replace(/bytes=/, "").split("-");
      var start = parseInt(positions[0], 10);
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;

      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        'Accept-Ranges': 'bytes',
        "Content-Length": chunksize,
        "Content-Type": "video/mp4"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
    
}