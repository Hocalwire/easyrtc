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
var PartnerNewsCacheModel = require('src/models/PartnerNewsCacheModel');


var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var isDevMode=false;
var EVC = require('express-view-cache');
var evc;
var viewapp;
var defaultCacheDuration=(24*60*60*1000);
var requireCacheModules = [];


var Constants = require('src/locales/Constants');
var Utils = require('src/libs/Utils');
var logger = require('src/libs/logger');
var fs = require("fs");
var webshot = require('webshot');

module.exports.setup = function(app) {

    viewapp=app;
    if (app.get('config').cache) {
        evc = EVC(app.get('config').redisURL);
    }
    if(app.get('env')=="development"){
        isDevMode=true;
    }
    addRequireModules();
    PartnerNewsCacheModel.setup(app);
};

function renderYoutubeThumb(req,res,next){
    var videoId = req.query.videoId;
    if(!videoId){
        return;
    }
    res.send(getVideoPageContent(videoId));
    res.end();
}
function getVideoPageContent(videoId,large){
    var s="";
    if(!videoId || videoId.indexOf("/")>-1 || videoId.indexOf("href")>-1){
            s='<style> body { background: white; border: 1px solid #ccc;}</style>'+
            '<a class="ImageLink" style="background:white;text-align:center;height: 100%;'+
            'width:100%;position: relative;display: block;"'+
            'href="/xhr/images/yt_place_holder.jpg"'+
            'title="youtubevideo">'+'<img class="ItemImage" style="margin:0;height: 100%;'+
            'width: 100%" src="/xhr/images/yt_place_holder.jpg" alt="Youtube Video"/>'+'</a>';
        } else{
            s = '<style> body { background: white; border: 1px solid #ccc;}</style>'+
            '<a class="ImageLink" style="background:white;text-align:center;height: 100%;'+
            'width:100%;position: relative;display: block;"'+
            'href="https://www.youtube.com/embed/'+videoId+'"'+
            'title="youtubevideo">'+'<img class="ItemImage" style="margin:0;height: 100%;'+
            'width: 100%" src="http://img.youtube.com/vi/'+videoId+'/0.jpg" alt="Youtube Video"/>'+
            '<img class="OverlayIcon" style="position: absolute;top: 45%;left: 45%;" src="/images/yt_play_img.png" alt="" /></a>';
        }
        return s;
}
function imageDownload(req,res){
    var videoId = req.query.videoId;
    console.log("download image called******"+videoId);
    if(!videoId){
        return;
    }
    var width = req.query.width ? req.query.width : 500;
    var height = req.query.height ? req.query.height : 300;
    try {
        if(!videoId || videoId.indexOf("/")>-1 || videoId.indexOf("href")>-1){
            var filePath = "src/public/images/yt_place_holder.jpg";
            var img = fs.readFileSync(filePath);
            res.writeHead(200, {'Content-Type': 'image/png' });
            res.end(img, 'binary');
            return;
        }
        var filePath = "src/public/data/"+req.partner+"/youtubethumbs/"+videoId+"/default_"+width+".jpg";
        console.log("file path is:"+filePath);
        fs.exists(filePath, function(exists) {
            if(exists){
                var img = fs.readFileSync(filePath);
                res.writeHead(200, {'Content-Type': 'image/png' });
                res.end(img, 'binary');
            } else {
                var index = filePath.lastIndexOf("/");
                var folderPath = filePath.substring(0,index);
                console.log("-----------------folder pathh:"+folderPath);
                var mkdirp = require('mkdirp');
                mkdirp(folderPath, function(err) { 
                    if(err){
                        
                    } else {
                        var options = {
                  
                          screenSize: {
                            width: width
                          , height: height
                          }
                        , shotSize: {
                            width: width
                          , height: 'all'
                          }
                        , userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_2 like Mac OS X; en-us)'
                            + ' AppleWebKit/531.21.20 (KHTML, like Gecko) Mobile/7B298g'
                        };
                        console.log("doing webshot call");
                        if(!isDevMode){
                            webshot(req.environment.rootUrl+"/xhr/admin/loadYoutubeThumb?videoId="+videoId, filePath ,options , function(err) {
                                var img = fs.readFileSync(filePath);
                                res.writeHead(200, {'Content-Type': 'image/png' });
                                res.end(img, 'binary');
                            });
                        } else {
                                filePath = "src/public/images/yt_place_holder.jpg";
                                var img = fs.readFileSync(filePath);
                                res.writeHead(200, {'Content-Type': 'image/png' });
                                res.end(img, 'binary');
                        }
                        
                    }

                });
                
            }
            
        }); 
    } catch(e){
        var filePath = "src/public/images/yt_place_holder.jpg";
        var img = fs.readFileSync(filePath);
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(img, 'binary');
    }
    
}


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
    var subPartners = req.environment.partnerData && req.environment.partnerData.subPartners ? req.environment.partnerData.subPartners : "";
    PartnerPropsModel.lastFetchedTime[partner] = 100;
    PartnerCatsModel.lastFetchedTime[partner] = 100;
    PartnerContentTemplateModel.lastFetchedTime[partner]=100;
    PartnerAuhtorsModel.lastFetchedTime[partner]=100;
    PartnerStylingModel.lastFetchedTime[partner]=100;
    PartnerContentModel.lastFetchedTime[partner]=100;
    PartnerNewsCacheModel.clearCache();
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
    // if(isDevMode){
    //     var exec = require('child_process').exec;
    //     var cmd = 'cd node_modules && rm -fr src && ln -s ../src/ src';

    //     exec(cmd, function(error, stdout, stderr) {
    //       console.log("command executed");
    //       console.log(error);
    //     });
    //     // clearRequireMouleCache();    
    // }
    
    res.send("<center><div> partner cache cleared</div></center><br><br> <a href='/'> Go To Home Page</a>");
    res.end();
}
function clearRequireMouleCache(){
    // Object.keys(require.cache).forEach(function(key) { delete require.cache[key] });
    for(var i=0;i<requireCacheModules.length;i++){
        var module;
        try {
          module = require.resolve(requireCacheModules[i]); 
          console.log("clearing module ************"+module); 
        } catch(e){
            module=null;
        }
        if(module && require.cache[module]){
            purgeCache(requireCacheModules[i]);  
        }
        
    }
    
}
function addRequireModules(){
    requireCacheModules.push("src/controller/helpers/commonContentController");
    requireCacheModules.push("src/controller/helpers/commonController");
    requireCacheModules.push("src/controller/helpers/staticDataController");
    requireCacheModules.push("src/controller/helpers/staticMixinController");
    requireCacheModules.push("src/controller/helpers/UpdateCustomFeedSitemap");
    requireCacheModules.push("src/controller/helpers/UpdateFeedSitemap");
    requireCacheModules.push("src/controller/helpers/UpdateNewsSitemap");
    // requireCacheModules.push("src/controller/helpers/UpdateSitemap");
    requireCacheModules.push("src/controller/loginAndRegisterController");
    requireCacheModules.push("src/controller/notificationHandler");
    requireCacheModules.push("src/controller/pageHandler");
    requireCacheModules.push("src/controller/xhrHandler");
    requireCacheModules.push("src/controller/postToSocial");
    requireCacheModules.push("src/controller/readNewsHandler");
    requireCacheModules.push("src/controller/renderAuthorPage");
    requireCacheModules.push("src/controller/renderBreakingNewsPage");
    requireCacheModules.push("src/controller/renderCatPage");
    requireCacheModules.push("src/controller/renderContentCatPage");
    requireCacheModules.push("src/controller/renderContentSearch");
    requireCacheModules.push("src/controller/renderDynamicPage");
    requireCacheModules.push("src/controller/renderEPaperPage");
    requireCacheModules.push("src/controller/renderHomePage");
    requireCacheModules.push("src/controller/renerPhotoGalleryPage");
    requireCacheModules.push("src/controller/renderSearchPage");
    requireCacheModules.push("src/controller/renerSubscriptionPage");
    requireCacheModules.push("src/controller/root.js");
    requireCacheModules.push("src/controller/subscriptionHandler.js");
    requireCacheModules.push("src/controller/urlSetup.js");

    requireCacheModules.push("src/libs/apiHelper");
    requireCacheModules.push("src/libs/CommonUtils");
    requireCacheModules.push("src/libs/Utils");
    requireCacheModules.push("src/locales/Constants");
    requireCacheModules.push("src/models/Environment");

}
/**
 * Removes a module from the cache
 */
function purgeCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};
module.exports.cacheUserNews = cacheUserNews;
module.exports.clearPartnerCache = clearPartnerCache;
module.exports.renderYoutubeThumb = renderYoutubeThumb;
module.exports.imageDownload = imageDownload;