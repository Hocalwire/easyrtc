"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var commonController = require("src/controller/helpers/commonController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerPropsModel = require("src/models/PartnerPropsModel");
var Promise = require('promise');
var logger = require('src/libs/logger');
var extend = require("extend");
var profileLogger = require("src/controller/helpers/profileLogger");


function renderPage(req, res, next) {
    var  d  = req.query;
    if(!d || !d.link) {
        res.redirect(301,"/404");
        return;
    }
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
    setBreadcrumb(req,d);
    // staticMixinController.getMixinData(req,res,syncTemplates,d);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,d);
    setAsyncTenmplates(req,asyncTemplates);
    setupMetaObject(req,res,next,d,"external");
    res.render(PartnerPropsModel.data[req.partner]["theme"]+'/externalLink', {
            data : d
        }, function(err, html) {
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
            
    });
            
}
function setAsyncTenmplates(req,asyncTemplates){
           
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);
    for(var i=0;i<aTemplates.length;i++){ //encode content of templatest

        if(aTemplates[i].content.indexOf("##$$") >-1){
            var index1 = aTemplates[i].content.indexOf("##$$");
            var index2 = aTemplates[i].content.indexOf("$$##");
            var varvalue = aTemplates[i].content.substring(index1+4,index2);
            var result="";
            var a = varvalue.split("+");
            for(var k=0;k<a.length;k++){
                var res;
                var aa = a[k].split(".");
                for(var j=0;j<aa.length;j++){
                    if(!res) {
                        res = req[aa[j]];
                    } else {
                        res = res[aa[j]];
                    }
                    
                }
                result =result+res;
            }
            aTemplates[i].content = aTemplates[i].content.substring(0,index1) + result + aTemplates[i].content.substring(index2+4,aTemplates[i].content.length);
            aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
        } else {
            aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
        }
        
    }
    req.environment.asyncTemplates = aTemplates;

}
function setupMetaObject(req,res,next,props){
    var env = req.environment;
    env.pageType="external";
    var partnerProps = req.environment.partnerData;
    res.locals.meta["title"] = props.title||"External Link";
    res.locals.meta["description"] = props.title||"External Link";
    res.locals.meta["socialDescription"] = "External Link";
    
    res.locals.meta["keywords"] = "External Link";
    res.locals.meta["lang"] = "en";
    res.locals.meta["logo"] = partnerProps.partnerLogo || "/images/logo.png";
    res.locals.meta["name"] = partnerProps.partnerName || req.partner;
    res.locals.meta["copyright"] = partnerProps.partnerCopyrightName || partnerProps.partnerName || req.partner;
    res.locals.meta["author"] = partnerProps.defaultSourceUrl || props.author || props.source || partnerProps.author || req.partner;
    res.locals.meta["image"] = env.rootUrl+"/images/logo.png";
    res.locals.meta["url"] = props.link;
    res.locals.meta["publishDate"] = new Date();
    env.pageIdentifier = "external-"+props.link;

}
function setBreadcrumb(req,props){
    req.environment.breadcrumb.push({"name":"Home","url":"/"});
    req.environment.breadcrumb.push({"name":props.title||"External Link","url":"..."});
}

module.exports.renderPage = renderPage;
