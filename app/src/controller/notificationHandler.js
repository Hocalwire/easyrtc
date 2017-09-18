"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var PartnerPropsModel = require('src/models/PartnerPropsModel');

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var partnerConfig = require('src/config/PartnerConfig');
var notification_data = {};
var fs = require("fs");
var MAX_NOTI_COUNT = 10;
var pushNotis = {};
var commonController = require("src/controller/helpers/commonController");
var request = require("request");
var http = require('http');
var Stream = require('stream').Transform;
function getImageFromUrl(req,res,next){
    var url = req.query.url;
    url = decodeURIComponent(url);
    console.log(url);
    http.request(url, function(response) {                                        
      var data = new Stream();                                                    

      response.on('data', function(chunk) {                                       
        data.push(chunk);                                                         
      });                                                                         

      response.on('end', function() {                                             
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(data.read(), 'binary');                             
      });                                                                         
    }).end();
    // http.request(url, function(response) {                                        
    //   var data = "";                                                    

    //   response.on('data', function(chunk) {                                       
    //     data+=chunk;                                                         
    //   });                                                                         

    //   response.on('end', function() {                                             
        
    //   });                                                                         
    // }).end();
    // console.log("image  url"+url);
    //   request.head(url, function(err, res, body){
    //     console.log('content-type:', res.headers['content-type']);
    //     console.log('content-length:', res.headers['content-length']);

    //     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    //   });
    // request(url, function(err, response, buffer) {
        
    // });
    
}
function renderSubscriptionPage(req,res,next){
    var params = req.query;
    var env = req.environment;
    var idx = env.pathname.lastIndexOf("/");
    var p = env.pathname.substring(idx+1,env.pathname.length);
    if(!p) {
        p=req.query.partner;
    }
    console.log("partner from URL"+p);
    if(!partnerConfig[p]){
        res.status(404);
        next();
        return;
    }
   
    // var partner = params.partner;
    var dataV = {"domainName":decodeURIComponent(params.domain_name),"partner":p};
    res.render("common/noti/registerNotification", {
            data:dataV
            }, function(err, html) {
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                res.send(200, html);
        });
}

function updatePushNotiDataForPartner(req,res,next){
    res.status(404);
    next();
    return;
    var partner = req.query.partner;
    var options = {
            rdm : apiHelper.getURL(Constants.validateURL,partner)
        };
    var path = req.query.path;
    options.rdm.setRDMProperty("1","url",path);
    apiHelper.get(options, req, res)
        .then(function(response) {
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
            logger.error("http code:"+httpCode);
            if(httpCode == '404') {
                res.status(404);
                next();
                return;
            } else if(httpCode == '301') {
                res.redirect(301, finalUrl);
                return;
            }
            
            if(pageType == 'news_details') {
                var d = commonController.getData(req,response,newsId);
                pushNotis[partner] = d;
                res.send(200,"<html><body><div>data  updated</div></body></html>");
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
function sendServiceWorker(req,res,next,partner){
    var fs = require('fs')
    fs.readFile('src/public/scripts/service-worker.js', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/$$$PARTNER_NAME$$$/g, partner);
      res.writeHead(200, {'Content-Type': 'text/javascript' });
      res.end(result,"binary");
      
    });
    // var img = fs.readFileSync('src/public/scripts/service-worker.js');
    // img=img.replace("$$$PARTNER_NAME$$$",p).replace("$$$PARTNER_NAME$$$",p);
    // res.writeHead(200, {'Content-Type': 'text/javascript' });
    

}
function getServiceWorker(req,res,next){
    var params = req.query;
    var env = req.environment;
    var idx = env.pathname.lastIndexOf("/");
    var p = env.pathname.substring(idx+1,env.pathname.length);
    if(!p) {
        p=req.query.partner;
    }
    if(!partnerConfig[p]){
        res.status(404);
        next();
        return;
    }
    sendServiceWorker(req,res,next,p);

}


var GCM = function(api_key) {
  this._api_key = api_key;
}

GCM.prototype.send = function(msg, callback) {
  request.post({
    uri: 'https://android.googleapis.com/gcm/send',
    json: msg,
    headers: {
      Authorization: 'key=' + this._api_key
    }
  }, function(err, response, body) {
    callback(err, body);
  })
}

function sendSubscriptionToServer(req,res,next){
    var body = req.body;
    var partner = body.partner;
    console.log(body);
    var notificationId = body.id;
    if(!notificationId){
        res.send(200,{'errorCode':-1});
    } else {
        var options = {
            rdm : apiHelper.getURL(Constants.sendDesktopNotificationSubscription,partner)
        };
        options.rdm.setRDMProperty("1","notificationId",notificationId);
        var isRemove = body.remove=="true" ? true : false;
        options.rdm.setRDMProperty("1","remove",isRemove);
        apiHelper.get(options, req, res)
        .then(function(response) {
                res.send(200,{'errorCode':0});
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
    
}
function getPartnerNotificationData(req,res,next){
    logger.error("inside get partner notifucatio data");
    var partner = req.query.partner;
    if(!partnerConfig[partner]){
        res.status(404);
        next();
        return;
    }
    var options = {
            rdm : apiHelper.getURL(Constants.getDesktopNotificationData,partner)
        };
        // options.rdm.setRDMProperty("1","notificationId",id);
        apiHelper.get(options, req, res)
        .then(function(response) {
            var title = response.getRDMProperty("1","title");
            var url = response.getRDMProperty("1","url_absolute");
            var isMobile = req.environment.isMobile;
            if(url.indexOf("?")>-1){
                url=url+"&utm_source=notification&utm_medium="+(isMobile?"mobile-":"desktop-")+"push&utm_partner="+partner+"&utm_campaign=notification";
            } else {
                url=url+"?utm_source=notification&utm_medium="+(isMobile?"mobile-":"desktop-")+"push&utm_partner="+partner+"&utm_campaign=notification";
            }
            var mediaIds = response.getRDMProperty("1","mediaIds");
            var domain = partnerConfig[partner].protocals[0]+"://" + partnerConfig[partner].domains[0];
            if(mediaIds){
                mediaIds = mediaIds.split(",");
            } else {
                var ids = domain+"/images/logo.png";
                mediaIds = [ids];
            }
            var data = {"partner":partner,"mediaIds":mediaIds};
            var imageUrl = Utils.getThumbUrl(data,"",domain,0,250,150);
            var description = response.getRDMProperty("1","description");
            var iconPath = "/xhr/admin/getPartnerNotificationImage?url="+encodeURIComponent(imageUrl);
            var d = {"title":title,"icon":iconPath,"description":Utils.trimSentence(description,200,"").finalString,"url":url};
            res.send({"notification":d});

            
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
function sendAPushNotification(req,res,next){
    var token = req.query.token;
    var singleToken = true;
    if(token.indexOf(",")>-1){
        token = token.split(",");
        singleToken=false;
    }
    var gcm = new GCM("AAAAaPAs_HM:APA91bHJ7ULD5pVHXborgin1wRPM-AC6URW9or8-YBsePlYARBcHQNBLGpM_BCteHChu1W7VWRuqLHtFORbqeRHTDOFqoeZZSZhOL0Wx88MVJi6x8Obhtj6Tox_MFN6J5xaSmC4itKVZ"); // https://code.google.com/apis/console

    var msg = {
      registration_ids: token, // this is the device token (phone)
      data: {
        "message": "Hello mundo cruel :P" ,
        "title":"Hello sir"// your payload data
      }
    };
    if(singleToken){
        delete msg.registration_ids;
        msg.to = token;
    }
    console.log(msg);
    // send the message and see what happened
    gcm.send(msg, function(err, response) {
      // that error is from the http request, not gcm callback
      console.log(response); // http://developer.android.com/guide/google/gcm/gcm.html#response
    });
}

function addNotification(req,res,next){
    var partner = req.partner;
    var data =  notification_data[partner];
    if(!data) {
        notification_data[partner] = [];
        data =  notification_data[partner];
    }

    var n = {};
    n['partner'] = partner;
    var d = req.body && req.body.heading ? req.body : req.query;

    d['partner'] = partner;
    n['title'] = d.heading;
    n['url'] = d.url;
    n['pname'] = req.environment.partnerData.partnerName || partner;
    n['mediaUrl'] = decodeURIComponent(d['imageUrl']);
    if(d.mediaIds){
        d.mediaIds = d.mediaIds.split(",");
    } else {
        d.mediaIds = [];
    }
    if(d.mediaIds.length && !n['mediaUrl']){
        n['mediaUrl'] = Utils.getMediaUrl(d); //env.rootUrl+        
    }
    if(d.source) {
        n['source'] = d['source'];
    }
    n['noti_id'] = d['id'] || new Date().getTime()+"_"+partner;
    if(data.length>MAX_NOTI_COUNT){
        data.pop();
    }
    data.unshift(n);
    console.log("noti========================="+data.length);
    res.send(200,{"message":"Added Notification"});
}

function sendNotification(req,res,next) {
    var notificationIds = (req.cookies && req.cookies["_notification_ids_"] ? req.cookies["_notification_ids_"] : "").split(",");
    var partner = req.partner;
    var data =  notification_data[partner];
    if(!data) {
        notification_data[partner] = [];
        data =  notification_data[partner];
    }
    var newNotificationIds = [];
    var noti;
    for(var i=0;i<data.length;i++){
        if(notificationIds.indexOf(data[i]['noti_id'])>-1) {  //notification already displayed, dont show that again
            newNotificationIds.push(data[i]['noti_id']);
            continue;
        }
        if(!noti){
            noti = data[i];
            newNotificationIds.push(data[i]['noti_id']);
        }
    }
    Utils.writeCookie(req,res,"_notification_ids_",(newNotificationIds.length ? newNotificationIds.join(","):""),(24*60*60*1000));
    if(noti){

        res.send(200, {"noti":JSON.stringify(noti),"errorCode":"0"});
    } else {
        res.send(200, {"noti":"","errorCode":"-1"});
    }
}
module.exports.addNotification = addNotification;
module.exports.sendNotification = sendNotification;
module.exports.renderSubscriptionPage = renderSubscriptionPage;
module.exports.sendAPushNotification = sendAPushNotification;
module.exports.sendSubscriptionToServer=sendSubscriptionToServer;
module.exports.getServiceWorker=getServiceWorker;
module.exports.updatePushNotiDataForPartner=updatePushNotiDataForPartner;
module.exports.getPartnerNotificationData=getPartnerNotificationData;
module.exports.getImageFromUrl=getImageFromUrl;