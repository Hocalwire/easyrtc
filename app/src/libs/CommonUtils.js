/**
 * [exports description] Utils class used on server
 * @type {Object}
 */

"use strict";
var Constants = require("src/locales/Constants");
var mobileAgent = require('mobile-agent');
var app;
var logger = require('src/libs/logger');
var partnerPropsModel = require("src/models/PartnerPropsModel");
var partnerContentTemplateModel = require("src/models/PartnerContentTemplateModel");
var partnerCatsModel = require("src/models/PartnerCategoriesModel");
var partnerAuthorsModel = require("src/models/PartnerAuthorsModel");
var partnerContentModel = require("src/models/PartnerContentModel");
var partnerLocationModel = require("src/models/PartnerLocationsModel");
var partnerStylingModel = require("src/models/PartnerStylingModel");
var partnerAMPStylingModel = require("src/models/PartnerAMPStylingModel");
var partnerConfig = require("src/config/PartnerConfig");
var Q = require("q");
var resources = ["bower_component","images","font","scripts","styles","favicon.ico","img","theme_","undefined","analytics","assets"];
var xhr = ["xhr","jhr"];
module.exports = {
    setup: function(expressApp) {
        app = expressApp;
    },
    getPartnerProps : function(partner,req,res,next){
        var partnerConfigData = partnerConfig[partner];
        var promises = [];
        promises.push(partnerPropsModel.fetch(partner,req,res,next));
        promises.push(partnerContentTemplateModel.fetch(partner,req,res,next));
        if(partnerConfigData.hasAuthors){
            promises.push(partnerAuthorsModel.fetch(partner,req,res,next));
        }
        var styling = partnerStylingModel.fetch(partner,req,res,next);
        console.log("checking for stying promise"+styling);
        if(styling){
            console.log("promise pushed");
            console.log(styling);
            promises.push(styling);    
        }
        var stylingAMP = partnerAMPStylingModel.fetch(partner,req,res,next);
        console.log("checking for stying promise"+stylingAMP);
        if(stylingAMP){
            console.log("promise pushed");
            console.log(stylingAMP);
            promises.push(stylingAMP);    
        }
        // promises.push(partnerStylingModel.fetch(partner));
        if(partnerConfigData.contentTypes){
            
            promises.push(partnerContentModel.fetch(partner,req,res,next));
        }
        if(partnerConfigData.locationsParentId){
            
            promises.push(partnerLocationModel.fetch(partner,req,res,next));
        }
        var langs = partnerConfigData.langs;
        // for(var i=0;i<langs.length;i++){
            promises.push(partnerCatsModel.fetch(partner,req,res,next));
        // }
        return Q.all(promises);
    },
    getRequestType : function(req){

        var p = req.pathname;
        var p = p.substr(1);
        var start = p.split("/")[0];
        logger.info("request start is:"+start);
        var type = "page";
        for(var i=0;i<resources.length;i++){
            if(start.indexOf(resources[i])==0){
                type="resource";
                break;
            }
        }

        if(type!="page"){
        }
        else if(xhr.indexOf(start)>-1){
            type= "xhr";
        } else {
            type = "page";
        }
        req.requestContentType=type;
        console.log("******************************** request type is:"+type);
        return type;
    }
};
