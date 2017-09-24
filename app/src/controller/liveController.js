"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var staticDataController = require("src/controller/helpers/staticDataController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var request = require("request");
function recordAndSave(req,res,next){
    var dataV = {};
    var renderUrl = "common/recordAndSave"
    res.render(renderUrl, {
      data : dataV
        
    }, function(err, html) {
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }

        res.send(200, html);
    });
    return;
}
function autoRecordAndSave(req,res,next){
    var dataV = {};
    var renderUrl = "common/autoRecordAndSave"
    res.render(renderUrl, {
      data : dataV
        
    }, function(err, html) {
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }

        res.send(200, html);
    });
    return;
}
function autoRecordAndSaveAudio(req,res,next){
    var dataV = {};
    var renderUrl = "common/autoRecordAndSaveAudio"
    res.render(renderUrl, {
      data : dataV
        
    }, function(err, html) {
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }

        res.send(200, html);
    });
    return;
}
function autoRecordAndSaveConf(req,res,next){
    var dataV = {};
    var renderUrl = "common/demoConfUser"
    res.render(renderUrl, {
      data : dataV
        
    }, function(err, html) {
        if (err) {
            logger.error('in index file', err.message);
            return next(err);
        }

        res.send(200, html);
    });
    return;
}
function handleRequest(req,res,next){
    var pathname = req.pathname;
    if(pathname=="/live/record-and-save"){
        recordAndSave(req,res,next);
    } else if(pathname=="/live/auto-record-and-save"){
        autoRecordAndSave(req,res,next);
    } else if(pathname=="/live/auto-record-and-save-audio"){
        autoRecordAndSaveAudio(req,res,next);
    }  else if(pathname=="/live/auto-record-and-save-conf"){
        autoRecordAndSaveConf(req,res,next);
    } else if(pathname=="/create-or-join"){
        recordAnSave(req,res,next);
    } else {
        res.status(404);
        next();
    }
}
module.exports.handleRequest = handleRequest;
