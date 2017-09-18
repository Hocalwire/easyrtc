
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
var util = require("util");
var maxFeedCount = 20;
var maxCatFeedCount=20;
var UpdateCustomFeedSitemap = {};
var count =0;
function createAndUpdateFeed(req,res,options){
    var createCategoryFeed = false;//req.environment.partnerData.create_category_rss_feed;
    console.log("\n\naasdfasdfasdf asdfasd fasdf asdfasd");
    logger.error("Custom Feed sitemap update is called for partner************"+req.partner);
    var partner = req.partner;
    console.log(isProcessing);
    if(isProcessing){
        var q = {'req' : req,'res':res,'options':options};
        requestQueue.push(q);
        logger.info("*****************************************************************request queued as already processing data");
        return;
    }
    if(!feedItemsObject) {
        feedItemsObject={};
    }
    isProcessing=true;
    var feedItems = feedItemsObject[partner];
    console.log("===============================");

    // console.log(feedItems);
    console.log(feedItemsObject);
    if(!feedItems){
        // feedItemsObject = {};
        feedItemsObject[partner] = [];
        feedItems = feedItemsObject[partner];
    }
    var hasFeed=false;
    if(feedItems){
         hasFeed = feedItems.filter(function(item){
            return (item.id==options.id);
        });
    } else {
        hasFeed = [];
        feedItems=[];
    }
    if(!hasFeed.length){
        feedItems.push(options);
    }
    if(feedItems.length>=maxFeedCount){ //feed items more than maxFeedCount, remove old ones
        feedItems.shift();
    }
    console.log("need to create category feed ==========================="+createCategoryFeed);
    
    // feedItems.push(options);
    var partner = req.partner;
    var finalPath = "src/partners/"+partner+"/custom_feeds.xml";
    var finalPath1 = "src/partners/"+partner+"/custom_feeds_partners.xml";

    var processingCallback = function(){
        isProcessing=false;
        if(requestQueue.length){
            var reqO = requestQueue.shift();
            UpdateCustomFeedSitemap.updateFeed(reqO.req,reqO.res,reqO.options);    
        }    
    };
    var feed = UpdateCustomFeedSitemap.getFeedItem(req);
    feed = UpdateCustomFeedSitemap.addFeedItems(req,feed);
    var feed1 = UpdateCustomFeedSitemap.getFeedItem(req);
    feed1 = UpdateCustomFeedSitemap.addFeedItemsCheetah(req,feed1);
    var createcatrsscallback = function(){
        processingCallback();   
    };
    UpdateCustomFeedSitemap.writeToFile(finalPath,feed.xml({'indent':true}),(createCategoryFeed ? createcatrsscallback : processingCallback),{"path":finalPath1,"data":feed1.xml({'indent':true})});
    console.log(feed1.xml({'indent':true}));
    UpdateCustomFeedSitemap.saveFeedItemsToFile();
    logger.error("Feed sitemap is updated at **************:"+finalPath);
    res.end();
    return;
}
UpdateCustomFeedSitemap.updateFeed = function(req,res,options){
     console.log("\n\n\n\n\n\n\n\n\n\n\ninside custom update FEEEDDDDDDDDD"+initialied);
    if(!initialied){
        UpdateCustomFeedSitemap.loadFeedItems(function(){
            createAndUpdateFeed(req,res,options);    
        });
    } else {
        createAndUpdateFeed(req,res,options);
    }

    
};
function createRSSForCategory(req,res,options,category,callback){
        if(callback)
            callback();
        // var catName = category.name ? category.name.split(" ").joing("-") : category.id;
        // if(catName.indexOf("&")>-1){
        //     catName = catName.split("&").join("");
        // }
        // var partner = req.partner;
        // logger.info("creating feed for category:================="+category.name);
        // var catFeedItems = feedItemsObject[partner][catName];
        // if(!catFeedItems){
        //     feedItemsObject[partner][catName] = [];
        //     catFeedItems = feedItemsObject[partner][catName];
        // }
        // if(catFeedItems.length>=maxCatFeedCount){ //feed items more than maxFeedCount, remove old ones
        //     catFeedItems.shift();
        // }  
        // catFeedItems.push(options); 
        // var callback = function(){
        //     isProcessing=false;
        //     if(requestQueue.length){
        //         var reqO = requestQueue.shift();
        //         UpdateCustomFeedSitemap.updateFeed(reqO.req,reqO.res,reqO.options);    
        //     }   
        // };
        // var nameForPath = (catName||category.id);
        // nameForPath = nameForPath.toLowerCase();
        // var finalPath = "src/partners/"+partner+"/category/"+nameForPath+"/feed.xml";
        // console.log("final path:****************"+finalPath);
        // var feed = UpdateCustomFeedSitemap.getFeedItem(req);
        // feed = UpdateCustomFeedSitemap.addFeedItems(req,feed,catFeedItems);
        // UpdateCustomFeedSitemap.writeToFile(finalPath,feed.xml({'indent':true}),callback);

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
UpdateCustomFeedSitemap.getBreakingNewsItem = function(req,data){
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
UpdateCustomFeedSitemap.getFeedItemFromData = function(req,data){
    
    var f = {};
    var breakingO = UpdateCustomFeedSitemap.getBreakingNewsItem(req,data);
    var isBreaking = breakingO && breakingO.length>0 ? breakingO[0]: false;

    f.title = data.title;
    f.title = Utils.xmlEncodeChars(f.title);
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
UpdateCustomFeedSitemap.getFeedItemFromDataCheetah = function(req,data){
    console.log("1111111");
    var d = new Date(data.date);
    console.log("*22222222");
    d = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)); //concver to local timezone
    var dnow = new Date();
    var t1 = dnow.getTime()-(48*60*60*1000);
    var t2 = d.getTime();
    console.log("*3333333333333");
    if(t2<t1){
        console.log("returning  ************");
        return "";
    }
    var f = {};
    var isBreaking=false;
    f.title = data.title;
    f.title = Utils.xmlEncodeChars(f.title);
    console.log(f);
    console.log("222222");
    f.description =Utils.trimSentence(data.story,200,"...").finalString;
    f.url = req.environment.rootUrl+(isBreaking ? isBreaking.url : data.newsUrl);
    f.categories = [data.categoryName];
    f.author = data.source || req.partnerData.partnerName;
    console.log(f);
    console.log("3333333333");
    var d = new Date(data.date);
    d = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)); //concver to local timezone
    f.date = d;
    if(data.mediaType=="youtube"){
        data.story = '<iframe width="642" height="361" src="'+Utils.getMediaUrl(data,"",req.environment.rootUrl)+'" frameborder="0" allowfullscreen></iframe>'+data.story;
    }
    f.custom_elements =  [
      {'image': "<![CDATA[ "+ (isBreaking ? req.environment.rootUrl+"/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl))+" ]]>"},
      {'content:encoded': "<![CDATA[ "+data.story+" ]]>"},
      {'source': "<![CDATA[ "+((data.author & data.author!="undefined")?data.author.name : (data.source ? data.source : (req.partnerData.partnerName)))+" ]]>"}
    ];
    if(data.mediaType=="youtube"){
        f.custom_elements.push({'iframe': "<![CDATA[ "+ (isBreaking ? req.environment.rootUrl+"/images/breaking.png" : Utils.getMediaUrl(data,"",req.environment.rootUrl))+" ]]>"});
    }
    console.log(f);
    console.log("4444444");
    console.log("809080980--098======\n\n\n");
    console.log(f);
    console.log("809080980--098======\n\n\n");

    return f;

};
UpdateCustomFeedSitemap.addFeedItems = function(req,feed,data){
    var partner = req.partner;
    var feedItems = data || feedItemsObject[partner];
    if(!feedItems) {
        feedItems = [];
    }
    for(var i=0;i<feedItems.length;i++){
        feed.item(UpdateCustomFeedSitemap.getFeedItemFromData(req,feedItems[i]));
    }
   
    return feed;
};
UpdateCustomFeedSitemap.addFeedItemsCheetah = function(req,feed,data){
    var partner = req.partner;
    var feedItems = data || feedItemsObject[partner];
    console.log("=================\n\n\n\n\n");
    console.log(feedItems);
    console.log("\n\n=================\n\n");
    if(!feedItems) {
        feedItems = [];
    }
    for(var i=0;i<feedItems.length;i++){
        var dd = UpdateCustomFeedSitemap.getFeedItemFromDataCheetah(req,feedItems[i]);
        console.log("\n\n=================\n\n");
        console.log(dd);
        console.log("=================\n\n\n\n\n");
        if(!dd){
            continue;
        }
        feed.item(dd);
    }
    console.log(feed);
    return feed;
};

var feedDataFileName = "src/data/partnerfeeds.txt";
var initialied=false;

UpdateCustomFeedSitemap.loadFeedItems =  function(callback){
    initialied=true;
    console.log("=======================\n\n\n\n===============");
    console.log("load Feed Items is called******");
    if(initialied){
        if(callback){
            callback();
        }
        return;
    }
    console.log("load Feed Items is called******11");
    var fs = require('fs');
    fs.readFile(feedDataFileName, 'utf8', function(err, contents) {
        //console.log("insidefeed load-------");
        //console.log(err);
        //console.log(contents);
        if(!err){
            console.log("file is loaded, update feed items");
            try {
                console.log(contents);
                console.log("111111111111111111111");
                feedItemsObject = JSON.parse(contents);
                console.log(feedItemsObject['royal']);
                console.log("11111111111111111");
                console.log(feedItemsObject.length);
                console.log("22222222222222");
                console.log(feedItemsObject);
                console.log("333333333333333");
            } catch(e){
                console.log("ERROR IN PARSING");
                feedItemsObject={};
                console.log(e);
            }
            initialied=true;
            if(callback){
                setTimeout(callback,10);
            }
        } else {
            if(callback){
                setTimeout(callback,10);
            }
        }
    });
}
UpdateCustomFeedSitemap.saveFeedItemsToFile =  function(){
    // console.log("daving feed items");
    // var sData = {};
    // var jsonString = "{";
    // for(var k in feedItemsObject){
    //     var items = feedItemsObject[k];
    //     sData[k] = [];
    //     // jsonString+='"'+k+'":[';
    //     for(var i=0;i<items.length;i++){
    //         var item = items[i];
    //         var o = {};
    //         // jsonString+="{";
    //         for(var m in item){
    //             if(item[m]){
    //                 o['"'+m+'"']=item[m];
    //             }
    //             // jsonString+='"'+m+'":"'+item[m]+'","';

    //         }
    //         sData[k].push(o);
    //     }
    //     // jsonString+="],";
    // }
    // // jsonString+="}";
    // var data =Utils.extend({},sData);
    // console.log(data);
    // var items = util.inspect(data);
    // var finalWriteData = JSON.stringify(items);
    // var x = JSON.stringify(util.inspect(feedItemsObject));
    // console.log("stringifyied"+x);
    // var y = JSON.parse(x);
    // console.log(y);
    // console.log("====");
    // var z = JSON.stringify(y);
    // console.log(z);
    // console.log(finalWriteData);
    // UpdateCustomFeedSitemap.writeToFile(feedDataFileName,z,function(){
    //     console.log("saved the file");
    // });
}
UpdateCustomFeedSitemap.writeToFile = function(fileName,data,callback,options){
    // console.log(fileName);
    console.log(data);
    // console.log(callback);
    // console.log(options);
    console.log("==========");
    data = Utils.replaceHtmlEntities(data);
    console.log(data);
    console.log("write to file called :"+fileName);
    var index = fileName.lastIndexOf("/");
    var folderPath = fileName.substring(0,index);
    var mkdirp = require('mkdirp');
    console.log(options);
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
            console.log(options);
            if(options && options.path){
                console.log("sindeite custom feed partneres one-----------------------------");
                var stream1 = fs.createWriteStream(options.path);
                stream1.once('open', function(fd) {
                    console.log("writing to file------"+options.path);
                    var data1 = Utils.replaceHtmlEntities(options.data);
                    var d2 = Utils.replaceHtmlEntitiesExtra(data1);
                    console.log(d2);
                    stream1.write(d2);
                    stream1.end();
                    callback();  
                });        
                
            } else {
                callback();      
            }
            
          
        });

    });
    
};

UpdateCustomFeedSitemap.getFeedItem = function(req){
        var options = {};
        var data = req.environment.partnerData;
        console.log(data);
        var partnerProps = req.environment.partnerData;
        options.title = data && data.homePageUrls && data.homePageUrls.length ? data.homePageUrls[0].title : (partnerProps.partnerName || req.partner+" News");
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
module.exports = UpdateCustomFeedSitemap;
