"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");

var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerPropsModel = require("src/models/PartnerPropsModel");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var staticDataController = require("src/controller/helpers/staticDataController");
var logger = require('src/libs/logger');
var extend = require("extend");
var profileLogger = require("src/controller/helpers/profileLogger");

function renderStaticPage(req, res, next,props,fromError) {
    var renderPath = "";
    if(req.query && req.query.redirect_url) {
        console.log("writing refdirection cookieeeeeeeeeeeeeeeee:"+req.query.redirectURL);
        Utils.writeCookie(req,res,"redirect_url",req.query.redirect_url,(10*60*1000));
    }

    var partner = req.partner;
    var partnerData = PartnerPropsModel.data[req.partner];
    var renderUrl = props.template.indexOf("/")==0 ? partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",partnerData ?  partnerData["theme"] : "");
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",partnerData ?  partnerData["theme"] : "");
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);
    // Utils.setAsyncTenmplates(req,aTemplates);
    if(!req.environment.breadcrumb){
        req.environment.breadcrumb = [];
    }
    req.environment.breadcrumb.push({"name":props.title,"url":req.environment.pathname});
    var dataV = {};
    staticMixinController.getMixinData(req,res,syncTemplates,dataV);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
    // console.log("==========================================\n\n\n\n\n\n\n");
    // console.log(req.pathname);
    // console.log(req.pathname=="/anil-jangir-profile");
    // console.log("==========================================\n\n\n\n\n\n\n");

    if(req.pathname=="/anil-jangir-profile" || req.pathname=="/anil-jangir-coupon"){
        console.log("setting meta object for anil jangir********************");
        //setup meta here
        var env = req.environment;
        var partnerProps = req.environment.partnerData;
        res.locals.meta["title"] = "Gastric Problem, In Jaipur area, 20% discount on first visit, call 7073074636";
        res.locals.meta["description"] = "Gas Problem? Visit, Dr. Anil Jangir, call on 7073074636. Anil Jangir is a Gastroenterologist, Hepatology and Digestive Endoscopist in Jaipur Rajasthan. he have 5 years of experience in this field. He completed DM - Gastroenterology from IPGMER, Calcutta and General medicine from Government medical College, Jodhpur. He worked with Hospitals like Bhandari Hospital & Research Center, Rungta Hospital and NIMS Medical College and Hospital";
        res.locals.meta["keywords"] = "Gastric Problems,Visit Dr. Anil Jangir,Hepatology,Gastroenterologist ";
        res.locals.meta["url"] = env.rootUrl +req.pathname;
        res.locals.meta["image"] = env.rootUrl + "/images/offer_share.jpg?utm_source=hocalwire&utm_medium=promote";
        env.title=res.locals.meta["title"];
        env.description=res.locals.meta["description"];
        env.keywords=res.locals.meta["keywords"];
        env.url=res.locals.meta["url"];
        env.image=res.locals.meta["image"];

    
    }
    var status = 200;
    if(fromError){
      dataV.message = props.errorMessage;
      status = props.status;
      req.environment.trackingPageType="ERROR";
    }

    Utils.setAsyncTenmplates(req,aTemplates);
    console.log(staticDataController[props.dataPromise]);
    if(props.dataPromise && staticDataController[props.dataPromise]){
        var dataPromise = staticDataController[props.dataPromise](req,res,next);
        
        if(dataPromise && dataPromise.then){
            dataPromise.then(function(response){
                dataV['data'] = dataPromise.data;
                dataV['props'] = props;
                console.log(dataV['data']);
                res.render(renderUrl, {
                  data : dataV
                    
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    res.send(status, html);
                });
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
        } else {
            if(dataPromise!="redirect" || !dataPromise){
                dataV['props'] = props;
                res.render(renderUrl, {
                  data : dataV
                    
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    res.send(status, html);
                });
            }
        }

    } else {
        dataV['props'] = props;
        res.render(renderUrl, {
          data : dataV
            
        }, function(err, html) {
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }

            res.send(status, html);
        });
    }

    
   
}
function renderClipPage(req,res,next){
    var p = req.pathname;
    var i1 = p.lastIndexOf("/");
    var uid = p.substring(i1,p.length);
    var mediaIds = [uid];
    var partner = req.partner;
    var partnerData = req.environment.partnerData;
    var renderUrl = partnerData["theme"]+"/clipPreview";
    var status = 200;
    
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"static",partnerData ?  partnerData["theme"] : "");
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"static",partnerData ?  partnerData["theme"] : "");
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);
    
    if(!req.environment.breadcrumb){
        req.environment.breadcrumb = [];
    }
    req.environment.breadcrumb.push({"name":"User Clip","url":req.environment.pathname});
    var dataV = {"mediaIds":mediaIds,"partner":partner,"title":"User Shared Clip"};
    staticMixinController.getMixinData(req,res,syncTemplates,dataV);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
    
    Utils.setAsyncTenmplates(req,aTemplates);
    res.render(renderUrl, {
      data : dataV
        
    }, function(err, html) {
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }

        res.send(status, html);
    });
}
function renderContentParamsPage(req, res, next,props) {
    var renderPath = "";
    if(req.query && req.query.redirect_url) {
        console.log("writing refdirection cookieeeeeeeeeeeeeeeee:"+req.query.redirectURL);
        Utils.writeCookie(req,res,"redirect_url",req.query.redirect_url,(10*60*1000));
    }

    var partner = req.partner;
    var partnerData = req.environment.partnerData;
    var renderUrl = props.template.indexOf("/")==0 ? partnerData["theme"] + props.template: "partners/"+partner+"/"+props.template;
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,props.pageType || "static",partnerData ?  partnerData["theme"] : "");
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,props.pageType || "static",partnerData ?  partnerData["theme"] : "");
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);

    if(!req.environment.breadcrumb){
        req.environment.breadcrumb = [];
    }
    req.environment.breadcrumb.push({"name":props.title,"url":req.environment.pathname});
    var dataV = {};
    staticMixinController.getMixinData(req,res,syncTemplates,dataV);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,dataV);
    
    Utils.setAsyncTenmplates(req,aTemplates);
    console.log(staticDataController[props.dataPromise]);
    var status = 200;
    if(props.dataPromise && staticDataController[props.dataPromise]){
        var dataPromise = staticDataController[props.dataPromise](req,res,next);
        
        if(dataPromise && dataPromise.then){
            dataPromise.then(function(response){
                dataV['data'] = dataPromise.data;
                dataV['props'] = props;
                console.log(dataV['data']);
                res.render(renderUrl, {
                  data : dataV
                    
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    res.send(status, html);
                });
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
        } else {
            if(dataPromise!="redirect" || !dataPromise){
                dataV['props'] = props;
                res.render(renderUrl, {
                  data : dataV
                    
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }

                    res.send(status, html);
                });
            }
        }

    } else {
        dataV['props'] = props;
        res.render(renderUrl, {
          data : dataV
            
        }, function(err, html) {
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }

            res.send(status, html);
        });
    }

    
   
}
module.exports.renderContentParamsPage = renderContentParamsPage;
module.exports.renderClipPage = renderClipPage;
module.exports.renderStaticPage = renderStaticPage;
