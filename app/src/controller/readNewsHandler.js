"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
function updateNewsState(req,res,next){
    var partner = req.partner;

    var cookie = req.cookies._ga_store;
    
    logger.info("update news state is called*******************************");
    var body = req.body;
    if(!body){
        logger.info("no body found in request");
        return;
    }
    var code = body.code;
    logger.info("code is:"+code);
    var newsId = body.id;
    if(cookie){
        var c = decodeURIComponent(cookie);
        c = c.split("==##");
        cookie = c[1];
    }
    
    
    if(cookie){
        code=cookie;
    } else {
        var ip = Utils.getIP(req);
        logger.info("IP of the system is:"+ip +" for newsId:"+newsId);
        ip=ip.split(".").join("");
        code=code+ip;
    }

    
    if(!code){
        logger.info("no code found in request");
        logger.info("not sending full view request because of code not found: newsId" +newsId);
        return;
    }

    var options = {
            rdm : apiHelper.getURL(Constants.updateNewsState,req.partner)
    };
    options.rdm.setRDMProperty("1","userId",code);
    options.rdm.setRDMProperty("1","news_id",newsId);
    options.rdm.setRDMProperty("1","id",newsId);
    options.rdm.setRDMProperty("1","news_state","FULL_VIEW");
    // logger.info("request RDM is:"+options.rdm.toXML());
    Utils.writeCookie(req,res,"_ga_store",encodeURIComponent("!@#$%^&*@#$^%&(*)(&$%&^*"+"==##"+code),(365*24*60*60*1000));
    apiHelper.get(options, req, res)
    .then(function(response) {
            // logger.info("news state set response"+response.toXML());
            var errorcode = response.getRDMAttribute("errorCode");
            if(!errorcode) {
                errorcode = "200";
                logger.info("full view request sent succesfully: newsId" +newsId);
            }
            res.send(200,{"code":errorcode});
            res.end();
    },
    function(e) {
        logger.info("full view request sent failed: newsId" +newsId);
        res.send(200,{"code":"200"});
        res.end();
    })
    .catch(function(e) {
        logger.info("full view request sent failed: newsId" +newsId);
        res.send(200,{"code":"200"});
        res.end();
    }); 

}
module.exports.updateNewsState = updateNewsState;