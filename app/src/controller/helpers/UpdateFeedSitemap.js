
"use strict";

var Utils = require("src/libs/Utils");
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var PartnerConfig = require('src/config/PartnerConfig');
var Utils = require('src/libs/Utils');
var fs = require('fs');
var RSS = require('rss');
var dateFormat = require('dateformat');
var isProcessing =false;
var requestQueue = [];
var feedItemsObject = {};

var maxFeedCount = 50;
var maxCatFeedCount=20;
var UpdateFeedSitemap = {};
var count =0;
function createAndUpdateFeed(req,res,options){
    var createCategoryFeed = true;
    logger.error("Feed sitemap update is called for partner************"+req.partner);
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
    console.log("need to create category feed ==========================="+createCategoryFeed);
    var hasFeed = feedItems.filter(function(item){
        return (item.id==options.id);
    });
    if(!hasFeed.length){
        feedItems.push(options);
    } 
    
    var partner = req.partner;
    var finalPath = "src/partners/"+partner+"/feeds.xml";

    var processingCallback = function(){
        isProcessing=false;
        if(requestQueue.length){
            var reqO = requestQueue.shift();
            UpdateFeedSitemap.updateFeed(reqO.req,reqO.res,reqO.options);    
        }    
    };
    var feed = UpdateFeedSitemap.getFeedItem(req);
    feed = UpdateFeedSitemap.addFeedItems(req,feed);
    var createcatrsscallback = function(){
        createCategoryRSSFeeds(req,res,options,processingCallback);      
    };
    UpdateFeedSitemap.writeToFile(finalPath,feed.xml({'indent':true}),(createCategoryFeed ? createcatrsscallback : processingCallback));
    
    logger.error("Feed sitemap is updated at **************:"+finalPath);
    res.end();
    return;
}
UpdateFeedSitemap.updateFeed = function(req,res,options){
    initialied=true;
    createAndUpdateFeed(req,res,options); 
    // console.log("\n\n\n\n\n\n\n\n\n\n\ninside update FEEEDDDDDDDDD"+initialied);
    // if(!initialied){
    //     UpdateFeedSitemap.loadFeedItems(function(){
               
    //     });
    // } else {
    //     createAndUpdateFeed(req,res,options);
    // }
  
};
function createRSSForCategory(req,res,options,category,callback){
        var catName = category.url ? category.url.split("/").join("-").split(" ").join("-") : category.id;
        if(catName.indexOf("&")>-1){
            catName = catName.split("&").join("");
        }

        // var catName = category.name ? category.name.split(" ").join("-") : category.id;
        // if(catName.indexOf("&")>-1){
        //     catName = catName.split("&").join("");
        // }
        var partner = req.partner;
        logger.info("creating feed for category:================="+category.name);
        var catFeedItems = feedItemsObject[partner][catName];
        if(!catFeedItems){
            feedItemsObject[partner][catName] = [];
            catFeedItems = feedItemsObject[partner][catName];
        }
        if(catFeedItems.length>=maxCatFeedCount){ //feed items more than maxFeedCount, remove old ones
            catFeedItems.shift();
        }  
        catFeedItems.push(options); 
        var callback = function(){
            isProcessing=false;
            if(requestQueue.length){
                var reqO = requestQueue.shift();
                UpdateFeedSitemap.updateFeed(reqO.req,reqO.res,reqO.options);    
            }   
        };
        var nameForPath = (catName||category.id);
        nameForPath = nameForPath.toLowerCase();
        var finalPath = "src/partners/"+partner+"/category/"+nameForPath+"/feed.xml";
        console.log("final path:****************"+finalPath);
        var feed = UpdateFeedSitemap.getFeedItem(req);
        feed = UpdateFeedSitemap.addFeedItems(req,feed,catFeedItems,true);
        UpdateFeedSitemap.writeToFile(finalPath,feed.xml({'indent':true}),callback);

}
function createCategoryRSSFeeds(req,res,options,finalcallback){
    var catData = req.environment.partnerCatData;
    var catIds = {};
    catIds[options.category] = true;
    if(options.otherCategories){
        for(var i=0;i<options.otherCategories.length;i++){
            catIds[options.otherCategories[i]]=true;
        }
    }
    var count=0;
    for(var k in catIds){
        count++;
    }
    console.log(options.category);
    console.log(options.otherCategories);
    var doneCount = 0;
    var callback = function(){
        doneCount++;
        if(doneCount==count){
            finalcallback();
        }
    }
    for(var k in catIds){
        var category = catData.filter(function(item){
            return (item.id==k);
        });
        createRSSForCategory(req,res,options,category[0],callback);
    }
};
UpdateFeedSitemap.getBreakingNewsItem = function(req,data){
    var breakingNews = req.partnerData.breakingNewsCategory;
    if(!breakingNews){
        return false;
    }
    var isBreaking = false;
    if(data.category==breakingNews || data.otherCategories.indexOf(breakingNews)>-1){
        isBreaking = req.partnerCatData.filter(function(item){
            return item.id==breakingNews;
        });
        return isBreaking;
    }
    return false;
};
UpdateFeedSitemap.getFeedItemFromData = function(req,data){
    
    var f = {};
    var breakingO = UpdateFeedSitemap.getBreakingNewsItem(req,data);
    var isBreaking = breakingO && breakingO.length>0 ? breakingO[0]: false;

    f.title = data.title;
    f.title = f.title.replace(/&/g,"&amp;");
    f.description =data["socialDescription"] =="no_social" ? "" : data.description;
    f.url = req.environment.rootUrl+(isBreaking ? isBreaking.url : data.newsUrl);
    f.categories = [data.category];
    f.author = data.source || req.partnerData.partnerName;
    var d = new Date(data.date);
    d = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)); //concver to local timezone
    f.date = d;
  
    f.enclosure = {
            url : (isBreaking ? req.environment.rootUrl+ "/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl)),
            type : "image/*"
    };
    
    return f;

};
UpdateFeedSitemap.getFeedItemFromDataForCategory = function(req,data){
    
    var f = {};
    var breakingO = UpdateFeedSitemap.getBreakingNewsItem(req,data);
    var isBreaking = breakingO && breakingO.length>0 ? breakingO[0]: false;

    f.title = data.title;
    f.title = f.title.replace(/&/g,"&amp;");
    f.description =Utils.trimSentence(data.story,200,"...").finalString;
    f.url = req.environment.rootUrl+(isBreaking ? isBreaking.url : data.newsUrl);
    f.categories = [data.categoryName];
    f.author = data.source || req.partnerData.partnerName;

    var d = new Date(data.date);
    d = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)); //concver to local timezone
    f.date = d;
    f.custom_elements =  [
      {'image': "<![CDATA[ "+ (isBreaking ? req.environment.rootUrl+"/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl))+" ]]>"},
      {'content': "<![CDATA[ "+data.story+" ]]>"},
    ];
    if(data.mediaType=="youtube"){
        f.custom_elements.push({'iframe': "<![CDATA[ "+ (isBreaking ? req.environment.rootUrl+"/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl))+" ]]>"});
    }
    // f.image = req.environment.rootUrl+ (isBreaking ? "/images/breaking.png" : Utils.getMediaUrl(data));
    // f.content = data.story;

    f.enclosure = {
            url : (isBreaking ? req.environment.rootUrl+ "/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl)),
            type : "image/*"
    };
    
    return f;


};
UpdateFeedSitemap.addFeedItems = function(req,feed,data,forCat){
    var partner = req.partner;
    var feedItems = data || feedItemsObject[partner];
    if(!feedItems) {
        feedItems = [];
    }
    for(var i=0;i<feedItems.length;i++){
        if(forCat){
            feed.item(UpdateFeedSitemap.getFeedItemFromDataForCategory(req,feedItems[i]));
        } else {
            feed.item(UpdateFeedSitemap.getFeedItemFromData(req,feedItems[i]));
        }
    }
   
    return feed;
};
var feedDataFileName = "src/data/partnerfeeds.txt";
var initialied=false;

UpdateFeedSitemap.loadFeedItems =  function(callback){
    console.log("=======================\n\n\n\n===============");
    console.log("load Feed Items is called******");
    if(initialied){
        return;
    }
    console.log("load Feed Items is called******11");
    var fs = require('fs');
    fs.readFile(feedDataFileName, 'utf8', function(err, contents) {
        console.log("insidefeed load-------");
        console.log(err);
        console.log(contents);
        if(!err){
            console.log("file is loaded, update feed items");
            try {
                feedItemsObject = JSON.parse(contents);
                initialied=true;
                console.log(feedItemsObject);
                
            }catch(e){
                if(callback){
                    callback(feedItemsObject);
                }    
            }
            
        } else {
            if(callback){
                callback(feedItemsObject);
            }
        }
    });
}
UpdateFeedSitemap.writeToFile = function(fileName,data,callback){
    console.log("write to file called :"+fileName);
    var index = fileName.lastIndexOf("/");
    var folderPath = fileName.substring(0,index);
    var mkdirp = require('mkdirp');
    mkdirp(folderPath, function(err) { 
        
        if(err){
            logger.error("====================================Error in creating Folder path:"+folderPath);
            callback();  
            return;
        }
        // path exists unless there was an error    
        var stream = fs.createWriteStream(fileName);
        stream.once('open', function(fd) {
            console.log("writing data..........");
            stream.write(data);
            stream.end();
            logger.info("written to feed sitemap : "+fileName);
            callback();  
          
        });

    });
    
};

UpdateFeedSitemap.getFeedItem = function(req){
        var options = {};
        var data = req.environment.partnerData;
        console.log(data);
        options.title = data && data.homePageUrls && data.homePageUrls.length ? data.homePageUrls[0].title : req.partner+" News";
        options.description = data && data.homePageUrls && data.homePageUrls.length ? data.homePageUrls[0].description : req.partner+" News";
        options.feed_url = req.environment.rootUrl+"/feeds.xml";
        options.site_url = req.environment.rootUrl;
        options.image_url = data.partnerLogo || "/images/logo.png";;
        options.managingEditor = data.editorEmail || "admin@"+req.partner+".com";
        options.copyright = data.partnerCopyrightName || data.partnerName || req.partner;
        options.language = data.defaultLang || "en";
        options.ttl = 1;
        var d = new Date();
        options.pubDate =  dateFormat( d , "mmm dd, yyyy, h:MM TT");;        
        logger.info("final formatted date:"+options.pubDate);
        var feed = new RSS(options);
        return  feed;
        
};
module.exports = UpdateFeedSitemap;
