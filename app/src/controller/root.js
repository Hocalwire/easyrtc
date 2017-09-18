"use strict";

var partnerConfig = require("src/config/PartnerConfig");
var CommonUtils = require("src/libs/CommonUtils");
var Environment = require('src/models/Environment');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var PartnerStylingModel = require('src/models/PartnerStylingModel');
var PartnerAMPStylingModel = require('src/models/PartnerAMPStylingModel');
var PartnerCategoriesModel = require('src/models/PartnerCategoriesModel');
var PartnerContentModel = require('src/models/PartnerContentModel');
var PartnerLocationsModel = require('src/models/PartnerLocationsModel');
var PartnerAuthorsModel = require('src/models/PartnerAuthorsModel');
var url = require("url");
var logger = require('src/libs/logger');
var evc;
var EVC = require('express-view-cache');
var CACHE_DURATION=5*60*1000;
var livePartnersFromConfig;
module.exports.setup = function(app) {
    
    app.all('/*', function(req, res, next) {
	   
		    
            if(!req.pathname) {
                next();
                return;
            }
            var reqType = req.pageRequestType;
            var partner = req.partner;
            if(reqType=="page" || reqType=="xhr" || req.xhr){
                CommonUtils.getPartnerProps(partner,req,res,next).then(
                    function(){
                        console.log("All Promissed resolved");
                        console.log("===================111"+req.loadTime);
                        if(!req.loadTime){
                            req.loadTime=[];
                        }
                        req.loadTime.push(new Date().getTime());

                        var environment = Environment.get(req, res, partner);
                        environment.query = req.query ? req.query : {};
                        environment.hasLogin = req.hasLogin;
                        res.locals.pathname = req.pathname;
                        if (reqType=="xhr" || req.xhr) {
                            environment.xhr = true;
                            // req.xhr=true;
                        } else {
                            // req.xhr=false;
                            environment.xhr=false;
                        }
                        environment.asyncTemplates = [];
                        environment.pathname = res.locals.pathname;
                        environment.partner=partner;
                        environment.meta = {};
                        environment.breadcrumb = [];

                        environment.livePartners = [];
                        addLivePartners(environment);
                        var CDNUrl = "";
                        var c = partnerConfig[partner];
                        if(c && c['CDNURL']){
                            CDNUrl = c['CDNURL'];
                        }
                        
                        environment.CDNURL=CDNUrl;

                        res.locals.meta = {};
                        req.environment = environment;
                        res.locals.env = environment;
                        res.locals.partner=partner;

                        req.environment.partnerStylingData = PartnerStylingModel.getPartnerStylingData(req);
                        res.locals.env.partnerStylingData = req.environment.partnerStylingData;

                        req.environment.partnerAMPStylingData = PartnerStylingModel.getPartnerStylingData(req);
                        res.locals.env.partnerAMPStylingData = req.environment.partnerAMPStylingData;


                        req.partnerData = PartnerPropsModel.getPartnerPropsData(req);
                        req.environment.partnerData = req.partnerData;
                        res.locals.env.partnerData = req.partnerData;
                                             
                        req.partnerCatData = PartnerCategoriesModel.getPartnerCatsData(req);

                        req.environment.partnerCatData=req.partnerCatData;
                        res.locals.env.partnerCatData = req.partnerCatData;
                        
                        req.partnerAuthorData = PartnerAuthorsModel.getPartnerAuthorsData(req);
                        req.environment.partnerAuthorData=req.partnerAuthorData;
                        res.locals.env.partnerAuthorData = req.partnerAuthorData;

                        
                        req.partnerPublicAuthorData = PartnerAuthorsModel.getPartnerPublicAuthorsData(req);
                        req.environment.partnerPublicAuthorData=req.partnerPublicAuthorData;
                        res.locals.env.partnerPublicAuthorData = req.partnerPublicAuthorData;



                        var partnerConfigData = partnerConfig[partner];
                        if(partnerConfigData.contentTypes){
                            req.partnerContentData = PartnerContentModel.getPartnerContentData(req);
                            req.environment.partnerContentData=req.partnerContentData;
                            res.locals.env.partnerContentData = req.partnerContentData;
                        } else {
                            req.partnerContentData = {};
                            req.environment.partnerContentData={};
                            res.locals.env.partnerContentData = {};
                        }
                        if(partnerConfigData.locationsParentId){
                            req.partnerLocationsData = PartnerLocationsModel.getPartnerLocationsData(req);
                            req.environment.partnerLocationsData=req.partnerLocationsData;
                            res.locals.env.partnerLocationsData = req.partnerLocationsData;
                        } else {
                            req.partnerLocationsData = [];
                            req.environment.partnerLocationsData=req.partnerLocationsData;
                            res.locals.env.partnerLocationsData = req.partnerLocationsData;
                        }
                        
                        processToRenderPage(req,res,next);
                    },
                    function(err, html){
                        if (err) {
                            logger.error('in root.js file', err.message);
                            return next(err);
                        }
                    
                        res.send(200, html);
                    })
                .catch(function(e) {
                    logger.error('in callback fetching categories in careers page', e.message);
                    return next(e);
                });
           
            } else {
                next();
            }
            
    });
};

function processToRenderPage(req,res,next){
    next();
}

function addLivePartners(data){
    

    if(livePartnersFromConfig){
        data.livePartners = livePartnersFromConfig;
        return;
    }
    var types = {};
    var config=partnerConfig;
    for(var k in config){
        var d = config[k].domains[0];
        var o = {};
        if(!(d.indexOf("demo")>-1  || d.indexOf("vocalwire")>-1 || d.indexOf("hocalwire")>-1 || d.indexOf("local")>-1)) {
            o['url'] = "http://"+d;
            o['partner'] = k;
            var type = config[k].mediaType ? config[k].mediaType : "demo";
            if(type.toLowerCase()!="demo"){
                o['mediaType'] = type.toLowerCase().split(" ").join("-");
                if(!types[o['mediaType']]) types[o['mediaType']] = [];
                types[o['mediaType']].push(k);
                types[o['mediaType']].name = type;
                data.livePartners.push(o);
            }
        }
        
    }
    data.livePartners.mediaInfo = types;
    livePartnersFromConfig = data.livePartners;
    
    return;
}