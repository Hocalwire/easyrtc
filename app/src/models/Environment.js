/**
 * [Environment description] Create an environment object which contains xhr, country and promise for fetching countries
 * @param {[type]} reqObj
 */
"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require("src/locales/Constants");
var PartnerConfig = require("src/config/PartnerConfig");
var Utils = require("src/libs/Utils");
var Country = {};
var logger = require('src/libs/logger');
var Promise = require('promise');

var url = require("url");

Environment.get = function(request, response) {
        var environment = new Environment(request,response);
        return environment;
};

function Environment(reqObj,response) {
    
    this.protocol = reqObj.protocol;

    var parsedURL = url.parse(reqObj.url);
    
    var urlQueryParams = parsedURL.search ? parsedURL.search : '';
    if(urlQueryParams && urlQueryParams.indexOf('?') ==0) {
        urlQueryParams = urlQueryParams.replace("?","&");
    }
    this.urlQueryParams = urlQueryParams;
    this.query =reqObj.query;

    //urlQueryParams=urlQueryParams?urlQueryP
    this.androidAppUrl = Constants.androidAppUrl+urlQueryParams;
    this.iOSAppUrl = Constants.iOSAppUrl+urlQueryParams;
    var reqSource = reqObj.query && reqObj.query.source ? reqObj.query.source.toLowerCase() : "";
    if(!reqSource && reqObj.cookies['source']){
        reqSource = reqObj.cookies['source'];
    }
    if(reqSource){
        logger.info("writing cookie");
        Utils.writeCookie(reqObj,response,"IGNORE_INTERSTITIAL","1",(1000*60*60*24*7));
        Utils.writeCookie(reqObj,response,"source",reqSource,(1000*60*60*24*7)); //set cookie for a week
        this.source = reqSource;
        if(Constants.partners.indexOf(reqSource)>-1){
            this.isPartner=true;
        } else {
            logger.info("non partner url");
        }
    }
    var partnerObj = PartnerConfig[reqObj.partner];
    
    this.protocol = partnerObj.protocals[0];
    this.host = partnerObj.domains[0];
    this.requestSessionId = partnerObj.sessionId;
    this.requestIp = Utils.getIP(reqObj);
    if((reqObj.query && reqObj.query.partner) || (reqObj.body && reqObj.body.partner)){
        var partner1 = (reqObj.query && reqObj.query.partner) ? reqObj.query.partner :  reqObj.body.partner;
        var p1 = PartnerConfig[partner1];
        this.queryhost = p1.domains[0];
        this.queryPartner = partner1;
        this.querySessionId = p1.sessionId;

    } else {
        this.queryhost = partnerObj.domains[0];
        this.querySessionId = partnerObj.sessionId;
        this.queryPartner = reqObj.partner;
    }
    console.log("HOST IS ***************************"+this.host);
    // this.host = reqObj.vhost ? reqObj.vhost.host :  PartnerConfig[reqObj.partner].domains[0];
    this.rootUrl = this.protocol+"://" + this.host;
    this.queryRootUrl = this.protocol+"://" + this.queryhost;
    this.pageUrl = this.rootUrl+reqObj.pathname;
    if(this.pageUrl.lastIndexOf("/")==this.pageUrl.length-2){ //url ending with /, remove extra /
        this.pageUrl = this.pageUrl.substring(0,this.pageUrl.length-2);
        // console.log(this.pageUrl);
    }
    var p = PartnerConfig[reqObj.partner];
    this.lang = p.langs[0];
    var isAndroid = Utils.isAndroid(reqObj),
        isLess3=Utils.isAndroidLessThan3(reqObj);
    this.isAndroid = (isAndroid && !isLess3); //this will be used to show sms scheme support for android > 2.3
    this.isIOS = Utils.isIOS(reqObj);
    
    this.androidAppSupported=Utils.isAndroidGB(reqObj);
    this.iOSAppSupported=Utils.isIOS7OrGreater(reqObj);
    this.appSupported = this.androidAppSupported || this.iOSAppSupported;
    this.isMobile = Utils.isMobile(reqObj);
    this.isBot = Utils.isBot(reqObj);
    // set app url irrespective of Android/iOS
    this.appStoreUrl = isAndroid ? this.androidAppUrl : (this.isIOS ? this.iOSAppUrl : '');
    if(!this.appStoreUrl) this.appStoreUrl = this.androidAppUrl;
    // this.appUrl = Constants.URL.APP_DOWNLOAD.urlStructure;

    this.onlyContent = reqObj.xhr;
    setupMobileNumber(this,reqObj);
    
}
function setupMobileNumber(env,req){
    var headers = req['headers'];

    for(var k in headers){
        switch(k){
            case "X-MSISDN":
                env['deviceNo1'] = headers[k];
                break;
            case "X_MSISDN":
                env['deviceNo2'] = headers[k];
                break;
            case "HTTP_X_MSISDN":
                env['deviceNo3'] = headers[k];
                break;
            case "X-UP-CALLING-LINE-ID":
                env['deviceNo4'] = headers[k];
                break;
            case "X_UP_CALLING_LINE_ID":
                env['deviceNo5'] = headers[k];
                break;
            case "HTTP_X_UP_CALLING_LINE_ID":
                env['deviceNo6'] = headers[k];
                break;
            case "X_WAP_NETWORK_CLIENT_MSISDN":
                env['deviceNo7'] = headers[k];
            break;
           
        }
        
    }
}

module.exports = Environment;
