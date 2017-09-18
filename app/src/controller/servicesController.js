"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var PartnerPropsModel = require('src/models/PartnerPropsModel');

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var partnerConfig = require('src/config/PartnerConfig');
var fs = require("fs");
var commonController = require("src/controller/helpers/commonController");
var Datastore = require('nedb');
var db;
function renderSnapPage(req,res,next){
    logger.info("inside render snap page -------");
    var path = req.pathname;
    if(!db) {
        db = new Datastore({"fileName":"src/datastorage/snap-storage.db"});
    }
    db.find({ url: path }, function (err, docs) {
        logger.info(docs);
        if(err){
            res.status(404);
            next();
            return;
        }
        var rpath = PartnerPropsModel.data[req.partner]["theme"]+'/socialSnap';
        res.render(rpath, {
            data:docs
            }, function(err, html) {
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                res.send(200, html);
        });
    });
    
}
function uploadImageAndGetSnapUrl(req,res,next){
    if(!db) {
        db = new Datastore({"fileName":"src/datastorage/snap-storage.db"});
    }
    var t = new Date().getTime()+"-"+Math.floor((Math.random()*10000));
    var query = req.query;
    var data = req.body;
    
    var imageData = data.image;
    
    var dtitle = data.title;
    var ddescription = data.description;
    var dauthor = data.author;
    var dkeywors = data.keywors;
    var dlang = data.lang;
    var dreferral = data.referral;
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(imageData, 'base64');
    var durl = "/social-snaps/"+t;
    fs.writeFile("src/public/snap-storage/"+t+'.png', buf,function(err){
        if(err){
            res.send({errorCode:-1,url: ""});
            return;
        }
           var doc = { title: dtitle,
                        description : ddescription,
                        url : durl,
                        keywords : dkeywors,
                        author : dauthor,
                        lang : dlang,
                        image : "src/snap-storage/"+t+'.png',
                        referral :dreferral
                    
               };

            db.insert(doc, function (err, newDoc) {   // Callback is optional
              res.send({errorCode:0,url: req.environment.rootUrl+durl,"image":"src/public/snap-storage/"+t+'.png'});
            });
    });
}

module.exports.renderSnapPage = renderSnapPage;
module.exports.uploadImageAndGetSnapUrl = uploadImageAndGetSnapUrl;
