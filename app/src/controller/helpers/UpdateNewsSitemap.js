
"use strict";

var Utils = require("src/libs/Utils");
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var PartnerConfig = require('src/config/PartnerConfig');
var Utils = require('src/libs/Utils');
var fs = require('fs');
var dateFormat = require('dateformat');
var isProcessing =false;
var requestQueue = [];
var feedItemsObject = {};
var start = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';

var maxFeedCount = 200;
var UpdateNewsSitemap = {};
var count =0;
UpdateNewsSitemap.updateFeed = function(req,res,options){
    logger.error("News Feed sitemap update is called for partner************"+req.partner);
    var partner = req.partner;
    if(isProcessing){
        var q = {'req' : req,'res':res,'options':options};
        requestQueue.push(q);
        logger.info("*****************************************************************request queued as already processing data");
        return;
    }

    isProcessing=true;
    var feedItems = feedItemsObject[partner];
    if(!feedItems){
        feedItemsObject[partner] = [];
        feedItems = feedItemsObject[partner];
    }
    if(feedItems.length>=maxFeedCount){ //feed items more than maxFeedCount, remove old ones
        feedItems.shift();
    }
    feedItems.push(options);
    var partner = req.partner;
    var finalPath = "src/partners/"+partner+"/news-sitemap-daily.xml";
    var processingCallback = function(){
            isProcessing=false;
            
            if(requestQueue.length){
                var reqO = requestQueue.shift();
                    UpdateNewsSitemap.updateFeed(reqO.req,reqO.res,reqO.options);    
            }
    };
    var data = start+"\n";
    data = UpdateNewsSitemap.addFeedItems(req,data);
    data+="</urlset>\n";
    UpdateNewsSitemap.writeToFile(finalPath,data,processingCallback);
    logger.error("News Feed sitemap is updated at **************:"+finalPath);
    res.end();
    return;
};

UpdateNewsSitemap.getFeedItemFromData = function(req,data){
        var env = req.environment;
        var partner = req.partner;
        var partnerProps = req.partnerData;
        var config = PartnerConfig[partner];
        var dnow = new Date();

        var d = new Date(data.date);
        d = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)); //concver to local timezone

        var t1 = dnow.getTime()-(48*60*60*1000);
        var t2 = d.getTime();
        if(t2<t1){
            return "";
        }
        var title = data.title;
        title = title.replace(/&/g,"&amp;");
        var keywords = data.keywords;
        if(keywords){
            keywords = keywords.replace(/&/g,"&amp;");
        }
        var xml = "\n";
        xml += '<url>\n';
        xml += '<loc>'+ req.environment.rootUrl+data.newsUrl+'</loc>\n';
        xml+="<news:news>\n<news:publication>\n<news:name>";
        xml+=partnerProps.partnerName || req.partner;
        xml+="</news:name>\n";
        xml+= "<news:language>"+config.langs[0]+"</news:language>\n";
        xml+="</news:publication>\n";
        xml+="<news:publication_date>"+data.date_published+"</news:publication_date>\n";
        xml+="<news:title>"+title+"</news:title>\n";
        if(keywords){
            xml+="<news:keywords>"+keywords+"</news:keywords>\n";
        }
        var imageUrl =  Utils.getMediaUrl(data,"",req.environment.rootUrl);
        imageUrl = imageUrl.replace(/&(?!amp;)/g, '&amp;')
        xml+="</news:news>";
        xml+="<image:image><image:loc>"+imageUrl+"</image:loc></image:image>";
        xml+="\n</url>";
        return xml;

};
UpdateNewsSitemap.addFeedItems = function(req,data){
    var partner = req.partner;
    var feedItems = feedItemsObject[partner];
    if(!feedItems) {
        feedItems = [];
    }
    for(var i=0;i<feedItems.length;i++){
        data += UpdateNewsSitemap.getFeedItemFromData(req,feedItems[i]);
        data+="\n";
    }
   
    return data;
};
UpdateNewsSitemap.writeToFile = function(fileName,data,callback){
    console.log("writing to news sitemap ---------"+fileName);
    var stream = fs.createWriteStream(fileName);
    stream.once('open', function(fd) {

     
        stream.write(data);
        stream.end();
        console.log("written newsitemap data");
        callback();  
      
    });
    
};


module.exports = UpdateNewsSitemap;
