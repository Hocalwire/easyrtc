"use strict";

var partnerConfig = require("src/config/PartnerConfig");
var CommonUtils = require("src/libs/CommonUtils");
var Environment = require('src/models/Environment');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var PartnerCategoriesModel = require('src/models/PartnerCategoriesModel');
var url = require("url");
var logger = require('src/libs/logger');
var evc;
var EVC = require('express-view-cache');
var CACHE_DURATION=24*60*60*1000;
function getPartnerFromDomain(domain){
    var p;
    for(var k in partnerConfig){
        if(partnerConfig[k].domains.indexOf(domain)>-1){
            return k;
        }
    }
    return "";
}
module.exports.setup = function(app) {
    app.all('/*', function(req, res, next) {
        var partner = req.headers['partner'];
        var rootUrl = req.headers['root_url'] || "";
        if(!partner){
            if(req.query && req.query.partner){
                partner = req.query.partner;
                console.log("partner"+partner);
                if(partner.indexOf(",")>0){
                    var a= partner.split(",");
                    partner = a[a.length-1];

                }
            }
        } 
        if(!partner && req.vhost){
            partner = getPartnerFromDomain(req.vhost.hostname);
        }
        if(!partner) partner="jantakiawaz";
        req.partner=partner;
        var c = partnerConfig[partner];
        if(c && c.parentPartner){
            req.parentPartner = c.parentPartner;
        }
        req.loadTime  = [];
        req.loadTime.push(new Date().getTime());
        console.log("===================111"+req.loadTime);
        console.log("*********************");
        console.log("partner is ***************"+partner);
        req.lang = partnerConfig[req.partner].langs[0];
        req.environment = {"meta" : {}};
        req.pathname = decodeURI(url.parse(req.url).pathname);
        
        // logger.error("path requested:"+req.pathname);
        var reqType = CommonUtils.getRequestType(req);
        if(reqType=="page" && rootUrl && req.pathname.indexOf(rootUrl)<0){
            req.pathname=rootUrl+req.pathname;
        }
        req.pageRequestType=reqType;
        req.hasLogin = partnerConfig[req.partner].hasLogin;
        req.requestTime = new Date().getTime();
        next();
    });
    var options = {
            'host': 'localhost',
            'port': 6379,
            'appPort': app.get('config').port
    }
    
    for(var k in partnerConfig){
        var cache = partnerConfig[k]["cache"];
        if(cache){
            var regex = partnerConfig[k]["cacheRegex"];
            var staticCacheUrls = partnerConfig[k]['staticCacheUrls'];
            if( !evc && (regex || staticCacheUrls)){
                evc = EVC(options);
            }

            var partner = k;
            if(regex){
               app.use(regex, evc.cachingMiddleware(CACHE_DURATION,[],true,true,partner));      
            }
            if(staticCacheUrls){
                var a = staticCacheUrls.split(",");
                for(var i=0;i<a.length;i++){
                    app.use(a[i], evc.cachingMiddleware(CACHE_DURATION,[],true,true,partner));             
                }
            }    
        }
    }
    
};

