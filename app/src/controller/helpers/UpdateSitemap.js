
"use strict";

var Utils = require("src/libs/Utils");
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var fs = require('fs');
var prefix = "src/sitemaps/";

var startingLineImage = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

var robotsPath = "src/sitemaps/robots.txt";
var isProcessing =false;
var requestQueue = [];
var submitSitemap  = require('submit-sitemap').submitSitemap;

var UpdateSitemap = {};

UpdateSitemap.update = function(req,res,options){
    
    if(isProcessing){
        var q = {'req' : req,'res':res,'options':options};
        requestQueue.push(q);
        logger.info("*****************************************************************request queued as already processing data");
        return;
    }
    isProcessing=true;
    
    var name = options.name || "others";
    var category = options.category || "local";
    
    var type = options.type || "news";
    
    var fileName  = options.fileName || type+"-"+name+"-"+category+"-sitemap.xml";
    var data = UpdateSitemap.getUrlSitemapContent(req,res,options);
    var finalPath = "src/sitemaps/"+fileName;
    
    fs.exists(robotsPath, function(exists) {
        if (exists) {   
            var siteMapExist = function(result){
                var processingCallback = function(){
                    isProcessing=false;
                    if(requestQueue.length){
                        var reqO = requestQueue.shift();
                        UpdateSitemap.update(reqO.req,reqO.res,reqO.options);    
                    }
                };
                if(result){
                    // logger.info("site map exist, prepending to it"+finalPath);
                    var finalPath = "src/tempsitemap/sitemap_"+fileName+"_"+(new Date().getTime())+".temp";
                    UpdateSitemap.updateSitemapData(finalPath,data,processingCallback);
                } else {
                    // logger.info("site map does not exist, creating one"+finalPath);
                    var finalPath = "src/sitemaps/"+fileName;
                    UpdateSitemap.createSiteMapFileAndUpdate(finalPath,data,processingCallback);
                }

            }
            UpdateSitemap.isSitemapExist(fileName,siteMapExist);
                        
          } else {

            isProcessing=false;
            imageSiteMapProcessingImage=false;
            logger.info("Robot file does not exist");
            return;

          }
        });

};

UpdateSitemap.completetask = function(fileName,callback){

    logger.info("request completed --- doing callback");
    var finalPath = "http://"+Constants.siteRootURL+"/"+fileName;
    finalPath = finalPath.replace(prefix,"");
    
    submitSitemap(finalPath,function(err){
        if(err){
            logger.info("error in submitting sitemap"+err);
            return;
        } 
        logger.info("sitemap submitted succesfully");
    });
    callback();
    // gzipme(fileName,false,"best");
};
UpdateSitemap.updateSitemapData = function(fileName,data,callback){
    fs.writeFile(fileName, data, function(err) {
        if(err) {
           logger.info("error in creating temp sitemap"+fileName);
        } else {
            logger.info("temp sitemap created"+fileName);
        }
        UpdateSitemap.completetask(fileName,callback);
        
    }); 
   
};
UpdateSitemap.createSiteMapFileAndUpdate = function(fileName,data,callback){
        var finalPath = "Sitemap: http://"+Constants.siteRootURL+"/"+fileName;
        finalPath = finalPath.replace(prefix,"")+"\n";
        logger.info("final path to append in robots is"+finalPath);

        fs.appendFile(robotsPath, finalPath , function (err) {
                if(err){
                    logger.info("error updating robots.txt");
                    isProcessing=false;
                    imageSiteMapProcessingImage=false;
                    UpdateSitemap.completetask(fileName,callback);
                    return;
                }
                var stream = fs.createWriteStream(fileName);
                stream.once('open', function(fd) {

                  var text= startingLineImage +data+'\n</urlset>';
                  stream.write(text);
                  stream.end();
                  UpdateSitemap.completetask(fileName,callback);
                  
                });
        });
        
        
};
UpdateSitemap.isSitemapExist = function(name,callback){
    logger.info("checking for site map exist in robots"+robotsPath);
    fs.readFile(robotsPath, 'utf8', function (err,data) {
        if (err) {
            return logger.info("Error in reading robots.txt");
        }
        var base = "Sitemap: http://"+Constants.siteRootURL+"/";
        if(data.indexOf(base+name) > 0){
            callback(true);
        } else {
            callback(false);
        }
    });
};
UpdateSitemap.getUrlSitemapContent = function(req,res,options){
    var location = options.url || "/";
    var priority = options.priority | 0.9;
    
    var root_path = Constants.siteRootURL;
    // XML sitemap generation starts here
    var priority = 0.5;
    var freq = options.freq || 'daily';
    var xml = "\n";
        xml += '<url>\n';
        xml += '<loc>'+ "http://"+root_path + location.replace(/&(?!amp;)/g, '&amp;') + '</loc>\n';
        xml += '<changefreq>'+ freq +'</changefreq>\n';
        xml += '<priority>'+ priority +'</priority>\n';
        xml+=UpdateSitemap.getImageSitemapContent(req,res,options);
        xml += '\n</url>\n';
        logger.info("url content is"+xml);
        return xml;

};
UpdateSitemap.getImageSitemapContent = function(req,res,options){

    var images = options.images || [];
    var root_path = Constants.siteRootURL;
    var xml="\n";
    // XML sitemap generation starts here
    for(var i=0;i<images.length;i++){
        xml+="<image:image>\n";
        xml+="<image:loc>http://"+root_path+images[i].replace(/&(?!amp;)/g, '&amp;')+"\n</image:loc>"
        xml+="\n</image:image>\n\n"
    }
    
    return xml;

};
module.exports = UpdateSitemap;
