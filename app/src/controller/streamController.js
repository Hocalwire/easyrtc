"use strict";


var CommonUtils = require("src/libs/CommonUtils");
var Environment = require('src/models/Environment');
var url = require("url");
var logger = require('src/libs/logger');

var PartnerPropsModel = require('src/models/PartnerPropsModel');

var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerAuhtorsModel = require('src/models/PartnerAuthorsModel');
var PartnerStylingModel = require('src/models/PartnerStylingModel');
var PartnerContentModel = require('src/models/PartnerContentModel');


var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');

var EVC = require('express-view-cache');
var evc;
var viewapp;
var defaultCacheDuration=(24*60*60*1000);
module.exports.setup = function(app) {

    viewapp=app;
    if (app.get('config').cache) {
        evc = EVC(app.get('config').redisURL);
    }
};

function cacheUserNews(req,res,next){
    if(!evc){ //cache module not initialized
        return;
    }
    var query = req.query;
    var newsUrl = query.newsUrl;
    if(!newsUrl) {
        return;
    }
    var duration = query.duration || defaultCacheDuration;
    viewapp.use(newsUrl, evc.cachingMiddleware(duration,newsUrl));
    res.end();
}
function clearPartnerCache(req,res,next){
    var partner = req.partner;
    var propsCache = PartnerPropsModel.lastFetchedTime[partner];
    var catsCache = PartnerCatsModel.lastFetchedTime[partner];
    var templatesCache = PartnerContentTemplateModel.lastFetchedTime[partner];
    var authorsCache = PartnerAuhtorsModel.lastFetchedTime[partner];
    var subPartners = req.environment.partnerData.subPartners ? req.environment.partnerData.subPartners : "";
    PartnerPropsModel.lastFetchedTime[partner] = 100;
    PartnerCatsModel.lastFetchedTime[partner] = 100;
    PartnerContentTemplateModel.lastFetchedTime[partner]=100;
    PartnerAuhtorsModel.lastFetchedTime[partner]=100;
    PartnerStylingModel.lastFetchedTime[partner]=100;
    PartnerContentModel.lastFetchedTime[partner]=100;
    if(subPartners){
        if(subPartners.constructor === Array) {
            for(var i=0;i<subPartners.length;i++){
                var partner = subPartners[i];
                PartnerPropsModel.lastFetchedTime[partner] = 100;
                PartnerCatsModel.lastFetchedTime[partner] = 100;
                PartnerContentTemplateModel.lastFetchedTime[partner]=100;
                PartnerAuhtorsModel.lastFetchedTime[partner]=100;
                PartnerStylingModel.lastFetchedTime[partner]=100;
                PartnerContentModel.lastFetchedTime[partner]=100;
            }
        } else {
            var partner = subPartners;
            PartnerPropsModel.lastFetchedTime[partner] = 100;
            PartnerCatsModel.lastFetchedTime[partner] = 100;
            PartnerContentTemplateModel.lastFetchedTime[partner]=100;
            PartnerAuhtorsModel.lastFetchedTime[partner]=100;
            PartnerStylingModel.lastFetchedTime[partner]=100;
            PartnerContentModel.lastFetchedTime[partner]=100;
        }
    }
    res.send("<center><div> partner cache cleared</div></center><br><br> <a href='/'> Go To Home Page</a>");
    res.end();
}

module.exports.cacheUserNews = cacheUserNews;
module.exports.clearPartnerCache = clearPartnerCache;