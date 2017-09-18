"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var Utils = require("src/libs/Utils");
var url = require("url");
var staticDataController = require("src/controller/helpers/staticDataController");

var logger = require('src/libs/logger');


module.exports.setup = function(app) {
    app.get("/xhr/admin/loadads", loadAd);
};

function loadAd(req, res, next) {
    
    var query = req.query;
    logger.info("inside load ad for ad id: "+query.id);
    var id = query.id;
    if(!id && !query.templatepath){ //no ad id given, return
        res.redirect(301,"/404");
        return;
    }
    console.log("load ads controller is called *******************");
    var domain = req.get('origin');
    var hostname = query.host;
    console.log("host name is :"+hostname+ " origin is:"+domain);

    // if(!domain || !hostname || !(hostname.indexOf(domain)==0 || hostname.indexOf(domain)==0)){
    //     res.redirect(301,"/404");
    //     return; //host name problems
    // }
    var dataV = {};
    var path = 'ads/'+id+"/index";
    if(query.templatepath){
        path = query.templatepath;
    } 
    console.log("=========================================");
    console.log("template path is:"+path);
    console.log("======================\n\n\n\n\n===================");
    if(query.function && staticDataController[query.function]){
        var dataPromise = staticDataController[query.function](req,res,next);
        
        if(dataPromise && dataPromise.then){
            dataPromise.then(function(response){
                dataV['data'] = dataPromise.data;

                res.render(path, {
                   data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in ad loading file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
            },function(e){
                next(e);
            }).catch(function(e) {
                logger.error('error caching page callback:', e.message);
                next(e);
            }); 
        } else {
            res.render(path, {
                   data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in ad loading file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
        }

    } else {
        res.render(path, {
                   data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in ad loading file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
    }
    
   
}
module.exports.loadAd = loadAd;
