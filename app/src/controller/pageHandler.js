"use strict";


var CommonUtils = require("src/libs/CommonUtils");
var Constants = require("src/locales/Constants");
var apiHelper = require("src/libs/apiHelper");
var Environment = require('src/models/Environment');
var url = require("url");
var logger = require('src/libs/logger');

var PartnerPropsModel = require('src/models/PartnerPropsModel');
var cacheHandler = require("src/controller/cacheHandler");
var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerContentModel = require('src/models/PartnerContentModel');
var PartnerAuthorsModel = require('src/models/PartnerAuthorsModel');
var partnerConfig = require("src/config/PartnerConfig");
var homePageHandler = require('src/controller/renderHomePage');
var staticPageHandler = require('src/controller/renderStaticPage');
var catPageHandler = require('src/controller/renderCatPage');
var contentCatPageHandler = require('src/controller/renderContentCatPage');
var authorPageHandler = require('src/controller/renderAuthorPage');
var breakingNewsPageHandler = require('src/controller/renderBreakingNewsPage');
var photoGalleryPageHandler = require('src/controller/renderPhotoGalleryPage');
var homePageV2PageHandler = require('src/controller/renderSimilarHomePage');
var ePaperPageHandler = require('src/controller/renderEPaperPage');
var subscriptionPageHandler = require('src/controller/renderSubscriptionPage');
var dynamicPageHandler = require('src/controller/renderDynamicPage');
var externalLinkPageHandler = require('src/controller/renderExternalLinkPage');
var searchHandler = require('src/controller/renderSearchPage');
var contentSearchHandler = require('src/controller/renderContentSearch');
var loginController = require("src/controller/loginAndRegisterHandler");
var liveController = require("src/controller/liveController");
var notificationHandler = require("src/controller/notificationHandler");
var cartController = require("src/controller/cartController");
var postToSocial = require("src/controller/postToSocial");
var Utils = require("src/libs/Utils");
var request = require("request"),
    cheerio = require("cheerio");
var fs = require("fs");
var Q = require("q");
var isDevMode=false;
module.exports.setup = function(app) {
    if(app.get('env')=="development"){
        isDevMode=true;
    }
     // setup environment
    app.all('/*', function(req, res, next) {
            // if(isDevMode){
            //     CommonUtils = require("src/libs/CommonUtils");
            //     Constants = require("src/locales/Constants");
            //     apiHelper = require("src/libs/apiHelper");
            //     Environment = require('src/models/Environment');
            //     url = require("url");
            //     logger = require('src/libs/logger');

            //     PartnerPropsModel = require('src/models/PartnerPropsModel');

            //     PartnerCatsModel = require('src/models/PartnerCategoriesModel');
            //     PartnerContentModel = require('src/models/PartnerContentModel');
            //     PartnerAuthorsModel = require('src/models/PartnerAuthorsModel');
            //     partnerConfig = require("src/config/PartnerConfig");
            //     homePageHandler = require('src/controller/renderHomePage');
            //     staticPageHandler = require('src/controller/renderStaticPage');
            //     catPageHandler = require('src/controller/renderCatPage');
            //     contentCatPageHandler = require('src/controller/renderContentCatPage');
            //     authorPageHandler = require('src/controller/renderAuthorPage');
            //     breakingNewsPageHandler = require('src/controller/renderBreakingNewsPage');
            //     photoGalleryPageHandler = require('src/controller/renderPhotoGalleryPage');
            //     ePaperPageHandler = require('src/controller/renderEPaperPage');
            //     subscriptionPageHandler = require('src/controller/renderSubscriptionPage');
            //     dynamicPageHandler = require('src/controller/renderDynamicPage');
            //     externalLinkPageHandler = require('src/controller/renderExternalLinkPage');
            //     searchHandler = require('src/controller/renderSearchPage');
            //     contentSearchHandler = require('src/controller/renderContentSearch');
            //     loginController = require("src/controller/loginAndRegisterHandler");
            //     notificationHandler = require("src/controller/notificationHandler");
            //     Utils = require("src/libs/Utils");
                    
            // }
            var partner = req.partner;
            // req.pathanme = url.parse(req.url).pathname;
            if(!req.pathname) {
                next();
                return;
            }
            var reqType = req.pageRequestType;
            if(reqType=="page"){
                if(req.hasLogin){
                    processRequestWithValidateLogin(req,res,next,partner);
                } else {
                    processRequest(req,res,next,partner);
                }
            } else {
                next();
            }
            
           
    });
};
function processRequestWithValidateLogin(req,res,next,partner){

    var options = {
            rdm : apiHelper.getURL(Constants.validateLogin,req.parentPartner || req.partner)
        };
    
    apiHelper.get(options, req, res)
        .then(function(response) {
            req.environment.partnerLoginData = parseLoginData(req,res,response);
            req.partnerLoginData = req.environment.partnerLoginData;
            res.locals.partnerLoginData = req.environment.partnerLoginData;
            var errorCode = response.getRDMAttribute("errorCode");

            
            if(errorCode != '0') {
                var reqLoginPages = req.environment.partnerData.requireLoginPages;
                 var pData = req.environment.partnerData;
                if(reqLoginPages  && reqLoginPages.length >= 1) {
                    for(var i=0;i<reqLoginPages.length;i++){
                        var pageUrl = reqLoginPages[i];
                        if(pageUrl == req.pathname) {
                            Utils.writeCookie(req,res,"redirect_url",req.pathname);
                            if(pData.validate_login_redirect_page){
                                res.redirect(302,pData.validate_login_redirect_page+"?redirect_url="+encodeURIComponent(req.url));
                            } else {
                                res.redirect(302,"/login?redirect_url="+encodeURIComponent(req.url));
                            }
                            
                            res.end();

                            return;
                        } 
                    }
                }
            } else {
                req.environment.isLoggedInUser=true;
                //fetch user subscription filter
                var options1 = {
                    rdm : apiHelper.getURL(Constants.getUserSubscriptionFilter,req.parentPartner || req.partner)
                };
                    apiHelper.get(options1, req, res).then(
                    function(rdm) {
                        var data = [];
                        for(var k in rdm.rdRows){
                            var d = {};
                            d['partner'] = req.partner;
                            d['filter_id'] = rdm.rdRows[k].id;
                            d['content_type'] = rdm.rdRows[k].content_type;
                            d['value'] = rdm.rdRows[k].value;
                            d['sub_value'] = rdm.rdRows[k].sub_value;
                            d['id'] = rdm.rdRows[k].id;
                            data.push(d);
                        }
                        if(!req.environment.partnerLoginData){
                            req.environment.partnerLoginData = {};
                        }
                        req.environment.partnerLoginData['filters'] = data;
                        console.log("======partner login data\n");
                        console.log(data);
                        console.log("======partner login data\n");
                    },
                    function(e) {
                        logger.error('error validate login', e.message);
                        next(e);
                    })
                    .catch(function(e) {
                        logger.error('error in validate login callback:', e.message);
                        next(e);
                    });    

            }
            processRequest(req,res,next,partner);
            
        },
        function(e) {
            logger.error('error validate login', e.message);
            next(e);
        })
        .catch(function(e) {
            logger.error('error in validate login callback:', e.message);
            next(e);
        });    


                
}
function redirectToLoginPage() {
    
}
function parseLoginData(req,res,rdm){
    var data = {};
    if(rdm.getRDMAttribute('errorCode')  != 0) {
        data.isLoggedIn = false;
    } else {
        data.isLoggedIn = true;
    }
    data.loggedInAs = rdm.getRDMProperty("1","name");
    data.userId = rdm.getRDMProperty("1","userId");
    return data;
}
function processRequest(req,res,next,partner){
    Utils.increaseVisitorsCounter(req,res,next);
    setCustomVariables(req,res);
    if(req.environment.isLoggedInUser){
        Utils.writeCookie(req,res,"_xhr_verified_","1");
    } else {
        Utils.writeCookie(req,res,"_xhr_verified_","0");
    }
    CommonUtils.getPartnerProps(partner,req,res,next).then(
        function(){
            req.loadTime.push(new Date().getTime());
                        
            if(req.environment.partnerData.static_redirect_urls){
                var url = req.url;
                var pathname = req.environment.pathname;
                if(req.environment.partnerData.static_redirect_urls[pathname]){
                    res.redirect(301,req.environment.partnerData.static_redirect_urls[pathname]);   
                } else if(req.environment.partnerData.static_redirect_urls[url]){
                    res.redirect(301,req.environment.partnerData.static_redirect_urls[url]);  
                }
            }
            if(req.environment.partnerData.redirect_domain_for_unsupported_urls){ 
                var supportedUrls = req.environment.partnerData.supported_urls;
                logger.error("supported urls :::::");
                logger.error(supportedUrls);
                var pathname = req.environment.pathname;
                var url = req.url;
                var isSupported=false;
                if(supportedUrls.indexOf(pathname)>-1) {
                    isSupported=true;
                }
                logger.error("checking for support url end index");
                for(var i=0;i<supportedUrls.length;i++){
                    logger.error(supportedUrls[i]);
                    logger.error(supportedUrls[i].lastIndexOf("/")==supportedUrls[i].length-1);
                    logger.error(supportedUrls[i]!="/");
                    if(supportedUrls[i].lastIndexOf("/")==supportedUrls[i].length-1 && supportedUrls[i]!="/"){
                        logger.error(supportedUrls[i]);
                        var s = supportedUrls[i].substring(0,supportedUrls[i].length-2);
                        logger.error(s);
                        if(pathname.indexOf(s)>-1){
                            isSupported=true;
                            break;
                        }
                    }
                }
                logger.error(isSupported);
                if(!isSupported){
                    res.redirect(301,req.environment.partnerData.redirect_domain_for_unsupported_urls+url); 
                }
            }

            var query = req.query;
            var search = query.search!=undefined;
            if(search){
                processSearchRequest(req,res,next);
            } else {
                processPageRequest(req,res,next);
            }
        },
        function(err, html){
            if (err) {
                logger.error(' error in pageHandler file', err.message);
                return next(err);
            }
        
            res.send(200, html);
        }
    ).catch(function(e) {
        logger.error('in callback pageHandler page', e.message);
        return next(e);
    });
}
function processSearchRequest(req,res,next){
    if(PartnerContentModel.isSearchUrl(req)){

        var props = PartnerContentModel.getCatUrlProps(req);
        req.environment.lang=partnerConfig[req.partner].langs[0];
        res.locals.env.lang=req.environment.lang;
        req.lang=req.environment.lang;
        req.environment.trackingPageType="content_category";
        setupMetaObject(req,res,next,props,"website");
          
        contentSearchHandler.renderSearchPage(req,res,next,props);
        return;
    }  else if(req.query.content_type){
        res.redirect(302, PartnerContentModel.getSearchUrl(req));
        return;
    }
    if(req.pathname!=req.environment.partnerData.homePageRoot + "search"){ //not on home page, redirect to home page with search query
        res.redirect(302, req.environment.partnerData.homePageRoot + "search?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length));
        return;
    } else { //render search page
        searchHandler.renderSearchPage(req,res,next);
    }
};
function postScrapeDataToApi(data,callback){
   
}
function writePartnerFeedsCatsUrl(req,res,next){
    var promisses = [];
    var parseCatsData=function(rdm){
            var data = [];
            
            var partner = rdm.getRDMAttribute("partner");
            data.partner=partner;
            for(var k in rdm.rdRows){
                var d = {};
                var id = rdm.rdRows[k].id;
                for(var j in rdm.rdRows[k]){
                    d[j] = rdm.rdRows[k][j];

                }
                if(d.imageId && partner){
                    d['partner'] = partner;
                    d['mediaUrl'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
                } else {
                    d["mediaUrl"] = "/images/logo.png";
                }
                d.name = Utils.replaceHtmlEntities(d.name);
                data.push(d);
            }
            
            data = data.sort(function(a,b){
                    var a1 = a.sorting_order ? a.sorting_order :1;
                    var b1 = b.sorting_order ? b.sorting_order : 1;
                    if(a1!=b1){
                        return a1-b1;
                    } else {
                        return a.name > b.name ? 1 : -1;
                    }
                    // var res = (a.sorting_order) 
                    // return (a.sorting_order - b.sorting_order);
            });
            return data;
    };
    var excelbuilder = require('msexcel-builder');
    var writeToXML = function(data,rootUrl){

        var partner=data.partner;
        var path = "src/data/rss/";
        var name = partner+".xlsx";
                // Create a new workbook file in current working-path 
        var workbook = excelbuilder.createWorkbook(path, name);
          var sheet1 = workbook.createSheet('sheet1', 4, (data.length+10));
          // Fill some data 
          sheet1.set(1, 1, 'Category Name');
          sheet1.set(2, 1, 'Feed Url');
          sheet1.set(3, 1, 'Category Url');

          sheet1.set(1, 2, 'Home/Root');
          sheet1.set(2, 2, rootUrl+"/custom_feeds.xml");
          sheet1.set(3, 2, '/');


          var len = data.length+3;

          for(var i=3;i<len;i++){
            if(!data[i]){
                continue;
            }
            var catName = data[i].url ? data[i].url.split("/").join("-").split(" ").join("-") : data[i].id;
            if(catName.indexOf("&")>-1){
                catName = catName.split("&").join("");
            }
            var nameForPath = (catName||data[i].id);
            nameForPath = nameForPath.toLowerCase();
            var finalPath = rootUrl+"/category/"+nameForPath+"/feed.xml";
            var finalName = data[i].name ? data[i].name : data[i].url;
            sheet1.set(1, i, finalName);
            sheet1.set(2, i, finalPath);
            
            sheet1.set(3, i, rootUrl+data[i].url);
          }
          workbook.save(function(ok,err){
            if (!ok) {
              workbook.cancel();
            }
            else{
            }
          });
    }
    var xx = ["thehawk","thehawkhi"];//,,,"specialcoveragehindi",,"rdigest",
    var rootUrls = [];
    for(var i=0;i<xx.length;i++){
        var c = partnerConfig[xx[i]];
        if(!c){
            continue;
        }
        var partner = xx[i];
        var domain = c.domains[0];
        var proto = c.protocals[0];

        var options = {
            rdm: apiHelper.getURL(Constants.getCategoriesUrl,partner),
            host:domain
        };
        options.rdm.setRDMProperty("1","sendSync","true");
        
        if(partner){
            options.rdm.setRDMAttribute("partner",partner);
        }
        if(partner)
        promisses.push(apiHelper.get(options));  
        rootUrls.push(proto+"://"+domain);  
    }
    var p = Q.all(promisses);
    p.then(function(resdata){
        for(var i=0;i<resdata.length;i++){
            var rdm = resdata[i];
            if(rdm.getRDMAttribute("errorCode")==0){
                var pData = parseCatsData(rdm);
                writeToXML(pData,rootUrls[i]);
            }
            
        }
        
    },function(e){});
    res.end();
};
function scrapDataFromJSONFile(req,res,next){
    var jsonfile = require("jsonfile");

    var idStart = req.query.startIndex || 1;
    var idEnd = req.query.endIndex || 2;
    var totalCount = idEnd-idStart;
    var fileName = req.query.filename || "virarjun.txt";
    fileName = "src/data/d/"+fileName;
    jsonfile.readFile(fileName, function(err, obj) {
        if(err){
            return;
        }
      var data = obj.data;
      for(var i=idStart;i<idEnd;i++){
        postScrapeDataToApi(req,res,next,data[i]);
      }
    });
    res.end();
}
function scrapBfirstData(req,res,next){
    var lines = [];
    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader(req.query.file || 'royal.txt');

    lr.on('error', function (err) {
        console.log("error reading file");
        res.end();
    });

    lr.on('line', function (line) {
        lines.push(line);
        
        
    });

    lr.on('end', function () {
        var total = lines.length;
        if(total>0){ //there are page to post on
		logger.error("count >.0 ");    
        var callbackurl = function(countDone){
                logger.error("inside callback:"+countDone);
                if(countDone==total-1){
                    logger.error("All scraped");

                    
                } else {
                    scrapeAndStoreBFirst(lines[countDone+1],callbackurl,countDone+1,total);
                }
            };
		logger.error("calling scrap");
            scrapeAndStoreBFirst(lines[0],callbackurl,0,total);
        }
    });
   res.end();
   return;
}
function scrapeAndStoreBFirst(url,callback,count,totalCount){
    logger.error(url);
    var newsId = url.split(',')[0];
    var url1 = url.split(',')[1];
if(!url1) { callback(count); return;}
    logger.error(url1);
    request(url1, function (error, response, body) {
	logger.error(error);
        logger.error("got response");
        // console.log(body);
        var $;
        try {
            var partner="royal";
            $ = cheerio.load(body);
            var title = $(".single_post_title h1");
            var story = $(".post_content p:not(.code-block,.innerOneTopMain p)");
            var img = $(".single_post_format .single_post_format_image img");
            var time = $(".single_post_title .post-date")
            var author = "";
            if(!title || !title.length || !story || !story.length){
                callback(count);
                return;
            
	       }
	    var category=$(".breadcrumbs_options a"); //(".breadcrumbs_options a:last");
            var desc = "";
            var o = {};
            o['title'] = title.text();
            o['image'] = (img && img.length>0 ? img.attr("src"): '');
            var ss = "";
            for(var xx=0;xx<story.length;xx++){
                ss = ss+$(story[xx]).html();
            }
            o['story'] = encodeURIComponent(ss);
            if(category && category.length) {
        		o['category']=$(category[category.length-1]).text();
        		o['categoryName']=o['category'];

        	    }	
            o['dateNews'] = Utils.formatDate(new Date(time.text()),"yyyy-mm-dd hh:mm");
            
            o['author'] = "";//author.text();
            o['description'] = "";//desc.text();
            o['id'] = newsId;
            o['partner'] = partner;
            o['app'] = "rdes";
            o["url"] = url1;
		logger.error("psoting url"+url1);
		logger.error(o);
            // postScrapeDataToApi(o,callback);
            var url2 = "http://royal.vocalwire.com/servlet/AdminController?command=partner.ServletImportNews";
            // url1+="&title="+o.title;
            // url1+="&story="+o.story;
            // url1+="&image="+o.image;
            // url1+="&id="+id;
            var od = "";
            for(var k in o){
                od += k+"="+o[k]+"&";
            }
            request.post({
              headers: {'content-type' : 'application/x-www-form-urlencoded'},
              url:     url2,
              body:    od
            }, function(error, response, body){
                logger.error(error);
                callback(count);
            });
            
           logger.error("posting url data:"+url);         
        }catch(e){
            logger.error("error occired in catch case");
            logger.error(e);
            callback(count);
        }
                
    });
}
function scrapNews4thePeopleData(req,res,next){
    var lines = [];
    var LineByLineReader = require('line-by-line'),
        lr = new LineByLineReader('news4thepeople.txt');

    lr.on('error', function (err) {
        res.end();
    });

    lr.on('line', function (line) {
        lines.push(line);
        
    });

    lr.on('end', function () {
        var total = lines.length;
        if(total>0){ //there are page to post on
            var callbackurl = function(countDone){
                
                if(countDone==total-1){
                    logger.error("All scraped");

                    
                } else {
                    scrapeAndStoreNews4(lines[countDone+1],callbackurl,countDone+1,total);
                }
            };
            scrapeAndStoreNews4(lines[0],callbackurl,0,total);
        }
    });
   res.end();

}
function scrapeAndStoreNews4(url,callback,count,totalCount){
    request(url, function (error, response, body) {
        var $;
        try {
            var partner="news4thepeople";
            $ = cheerio.load(body);
            var img = $(".td-post-featured-image img");
            var xsrc = img.attr("src");
            var data = url+","+xsrc+"\n";
            writeDataToFile("news4people.txt",data,function(){
                callback(count);
            });
        }catch(e){
            logger.error("error occired in catch case");
            logger.error(e);
            callback(count);
        }
                
    });
}
function writeDataToFile(file,data,callbackfunction){

        fs.appendFile(file, data, function (err) {
            if(err){
            }
            if(callbackfunction){
                callbackfunction();    
            }
            
        });
};
function scrapeData(req,res,next){
    // res.end();
    // return;
    // return scrapNews4thePeopleData(req,res,next);
    // return;
    // // return scrapDataFromJSONFile(req,res,next);
    return scrapBfirstData(req,res,next);

    var idStart = req.query.startIndex || 1;
    var idEnd = req.query.endIndex || 2;
    var partner="virarjun";
    var rootUrl = "http://www.virarjun.com/DisplayNews.aspx?newsid=";
    var currentCount = 0;
    var totalCount = idEnd-idStart;
    var fileName = req.query.filename || "virarjun.txt";
    fileName = "src/data/"+fileName;
    var urlStart = rootUrl+idStart;
    var callback = function(){
        idStart++;
        if(idStart>=idEnd){
             // writeDataToFile(fileName,"\n\n]\n\n}");
             return;
        }
        var url = rootUrl+idStart;
        fetchData(url,idStart);
    }
    
    var writeDataToFile = function(file,data,callbackfunction){

        fs.appendFile(file, data, function (err) {
            if(err){
            }
            if(callbackfunction){
                callbackfunction();    
            }
            
        });
   };
    
    var fetchData = function(url,id){
        request(url, function (error, response, body) {
                // console.log(body);
                var $;
                try {
                    $ = cheerio.load(body);
                    var title = $("table span.news_text");
                    var story = $(".content_text");
                    var img = story.find("img");
                    var o = {};

                    o['title'] = title.text();
                    o['image'] = (img.length>0 ? img.attr("src"): '');
                    o['story'] = story.text();
                    o['id'] = id;
                    o['partner'] = partner;
                    o['app'] = "rdes";
                    // postScrapeDataToApi(o,callback);
                    var url1 = "http://admin.vocalwire.com/servlet/AdminController?command=partner.ServletImportNews";
                    // url1+="&title="+o.title;
                    // url1+="&story="+o.story;
                    // url1+="&image="+o.image;
                    // url1+="&id="+id;
                    var od = "";
                    for(var k in o){
                        od += k+"="+o[k]+"&";
                    }

                    request.post({
                      headers: {'content-type' : 'application/x-www-form-urlencoded'},
                      url:     url1,
                      body:    od
                    }, function(error, response, body){
                        logger.error(error);
                        callback();
                    });
                    
                }catch(e){
                    logger.error("error occired in catch case");
                    logger.error(e);
                    callback();
                }
                
            });
    };
    // writeDataToFile(fileName,"\n\n{\n\n'data': [\n\n");
    fetchData(urlStart,idStart,callback);
    res.end();

};
function getLinks(req,res,next,rootUrl,category,urls,callbackfunction){
    
    var done = 0;
    var alphas = ["1","2","3","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    var total=alphas.length;
    var callback = function(countDone){
        
        if(countDone==total){
            
            callbackfunction(req,res,next);
        } else {
            countDone++;
            var url = rootUrl+"category="+category+"&alpha="+alphas[countDone];
            addLinks(url,urls,countDone,callback);
        }
    }
    var url = rootUrl+"category="+category+"&alpha="+alphas[0];
    addLinks(url,urls,0,callback);


}
function addLinks(url,urls,count,callback){
    var ids = [];
    var idsM = {};
    request(url, function (error, response, body) {
        var $ = cheerio.load(body),

            links = $(".agency.big_btmargin .odd a");
            
            for(var j=0;j<links.length;j++){
                var tempUrl = $(links[j]).attr("href");
                var i1 = tempUrl.indexOf("id=");
                var i2 = tempUrl.indexOf("&")>-1 ? tempUrl.indexOf("&") : tempUrl.length;
                var id = tempUrl.substring(i1+3,i2);
                
                ids.push(id);
                idsM[id] = true;
                urls["http://resources.afaqs.com/"+$(links[j]).attr("href")]=true;;
            }
        
         callback(count);
    });
}
function processPageRequest(req,res,next){
    var isHomePage = PartnerPropsModel.isHomePage(req);
    req.environment.isStaticUrl = PartnerPropsModel.isStaticUrl(req);
    var customFeedPath = req.environment.partnerData.custom_rss_feed_path;
    
    if(req.pathname=="/oauth/linkedin/callback"){
        postToSocial.handleCallback(req,res,next);
        return;
    }
    if(req.pathname=="/oauth/linkedin"){
        postToSocial.handleLinkedIn(req,res,next);
        return;
    }
    if(customFeedPath && (req.pathname==customFeedPath || req.pathname==customFeedPath+"/" || req.pathname+"/"==customFeedPath)){
        var img = fs.readFileSync('src/partners/'+req.partner+'/custom_feeds_partners.xml');
        res.writeHead(200, {'Content-Type': 'text/xml' });
        res.end(img,"binary");
        return;
    }
    if(req.environment.isStaticUrl) {
        req.environment.staticUrlProps = PartnerPropsModel.getStaticUrlProps(req);
        var props = req.environment.staticUrlProps;
        req.environment.lang=props.lang;
        res.locals.env.lang=props.lang;
        req.lang=props.lang;
        req.environment.trackingPageType="static";
        setupMetaObject(req,res,next,props,"website");
    }
    var props;
    if(req.pathname=="/admin"){ //admin url
        var url = "http://"+req.partner+".hocalwire.com";
        if(req.environment && req.environment.partnerData && req.environment.partnerData.admin_page_url)
            url = req.environment.partnerData.admin_page_url;
        res.redirect(301,url);
        return;

    }
    if(req.pathname.indexOf("/live/")==0){
        liveController.handleRequest(req,res,next);
        return;
    }
     var cookie = req.cookies._ga_store;
     if(req.pathname=="/scrape-bfirst-details"){
        
        return scrapeData(req,res,next);

     }
    if(cookie){
        req.environment.has_ga_store_key = 1;
    }
    
    if(req.pathname.indexOf("/payments/")==0 || req.pathname.indexOf("/xhr/admin/payments/")==0){
        loginAndRegisterHandler.handlePaymentRequest(req,res,next);
        return;
    }
   // if(req.pathname=="/create-all-rss-xl"){
   //      writePartnerFeedsCatsUrl(req,res,next);
   //      return;
   // }
   //  if(req.pathname=="/external-link"){
   //      externalLinkPageHandler.renderPage(req,res,next);
   //      return;
   //  }
    if(req.pathname=="/verify-email"){
        loginController.verifyEmail(req,res,next);
        return;
    }
    if(req.pathname=="/nadi-ad-fallback"){
        var dataV = {};
        var renderUrl = "common/ads/nadi-video-fallback"
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
    var isGlobalStatic=false;
    var globalTemplate="";
    if(req.environment.partnerData.global_static_pages){
        for(var k in req.environment.partnerData.global_static_pages){
            var url = req.url;
            var pathname = req.environment.pathname;
            if(req.environment.partnerData.global_static_pages[pathname]){
                isGlobalStatic=true;
                globalTemplate=req.environment.partnerData.global_static_pages[pathname];
                break;
            } else if(req.environment.partnerData.global_static_pages[url]){
                isGlobalStatic=true;
                globalTemplate=req.environment.partnerData.global_static_pages[url];
                // res.redirect(301,req.environment.partnerData.static_redirect_urls[url]);  
                break;
            }
        }
    }
    if(isGlobalStatic){
        console.log("===========================its a global static page-----");
        var dataV = {};
        var renderUrl = "common/global/"+globalTemplate;
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
    if(req.pathname=="/capture-screen-full-mode"){
        var dataV = {};
        var renderUrl = "common/liveCaptureScreen"
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
    if(req.pathname.indexOf("/cart/")==0 || req.pathname.indexOf("/user/")==0) {
        cartController.handleRequest(req,res,next);
        return;
    }
    if(req.pathname=="/share/send-article-by-email"){
        loginController.renderSendEmailPage(req,res,next);
        return;
    }
    // if(req.pathname=="/xhr/admin/loadYoutubeThumb"){
    //     cacheHandler.renderYoutubeThumb(req,res,next);
    // } else if(req.pathname=="/xhr/admin/downloadYoutubeThumb"){
    //     console.log("calliing load youtube thumb");
    //     cacheHandler.imageDownload(req,res,next);
    // } 
    // if(req.pathname=="/pdftohtml"){
    //     convertPDFToHTML(req,res,next);
    //     return;
    // }
    if(req.pathname.indexOf("/partner-services/enable-notification")==0){
        notificationHandler.renderSubscriptionPage(req,res,next);
        return;
    }
    if(req.pathname.indexOf("/partner-services/get-service-worker")==0){
        notificationHandler.getServiceWorker(req,res,next);
        return;
    }
    if(req.pathname=="/partner-services/send-notification"){
        notificationHandler.sendAPushNotification(req,res,next);
    }
    if(req.pathname=="/xhr/admin/getPartnerNotificationImage"){
        notificationHandler.getImageFromUrl(req,res,next);   
    }
    if(PartnerPropsModel.isStaticUrl(req)){
        props = PartnerPropsModel.getStaticUrlProps(req);
        req.environment.lang=props.lang;
        res.locals.env.lang=props.lang;
        req.lang=props.lang;
        req.environment.trackingPageType="static";
        setupMetaObject(req,res,next,props,"website");
        staticPageHandler.renderStaticPage(req,res,next,props);
    }else if(req.pathname.indexOf("/clip-preview/")==0){
        staticPageHandler.renderClipPage(req,res,next);

    }else if(isHomePage){
        //temp data to be removed
        props = PartnerPropsModel.getHomePageUrlProps(req);
        req.environment.lang=props.lang;
        res.locals.env.lang=props.lang;
        req.lang=props.lang;
        setupMetaObject(req,res,next,props,"website");
        req.environment.trackingPageType="home";
        homePageHandler.renderHomePage(req,res,next,props);
    } else if(isEPaperUrl(req,res,next)){
            var props = {"lang":req.lang};
            var propsA = req.environment.partnerCatData.filter(function(item){
                return item.categoryId == req.environment.partnerData.epaperCategoryId;
            });
            if(propsA.length){
                props = propsA[0];
            }
            props["theme"] = req.environment.partnerData.theme;
            ePaperPageHandler.renderEPaperPage(req,res,next,props);
    } else if(isSubscriptionPageUrl(req,res,next)){
            var props = {"lang":req.lang};
            props["theme"] = req.environment.partnerData.theme;
            subscriptionPageHandler.renderSubscriptionPage(req,res,next,props);
    } else if(isSubscriptionDetailsPageUrl(req,res,next)){
            var props = {"lang":req.lang};
            props["theme"] = req.environment.partnerData.theme;
            subscriptionPageHandler.renderSubscriptionDetailsPage(req,res,next,props);
    } else if(PartnerContentModel.isContentParamUrl(req)){
        var props = PartnerContentModel.isContentParamUrl(req);
        staticPageHandler.renderContentParamsPage(req,res,next,props);

    }else if(PartnerContentModel.isCatUrl(req)){
        req.environment.partnerProfileData = {};
            req.environment.partnerProfileData["followed"] = {};
            req.environment.partnerProfileData["bookmarked"] = {};
            req.environment.partnerProfileData["followed"]["1"] = ["99","88","81"];
            req.environment.partnerProfileData["followed"]["4"] = ["120"];
            req.environment.partnerProfileData["followed"]["7"] = ["107"];
            req.environment.partnerProfileData["followed"]["10"] = ["125","126"];

            req.environment.partnerProfileData["bookmarked"]["1"] = ["90","80","99"];
            req.environment.partnerProfileData["bookmarked"]["4"] = ["112"];
            req.environment.partnerProfileData["bookmarked"]["7"] = ["102"];
            req.environment.partnerProfileData["bookmarked"]["10"] = ["126","127","128"];

            
        props = PartnerContentModel.getCatUrlProps(req);
        req.environment.lang=partnerConfig[req.partner].langs[0];
        res.locals.env.lang=req.environment.lang;
        req.lang=req.environment.lang;
        req.environment.trackingPageType="content_category";
        setupMetaObject(req,res,next,props,"website");
        contentCatPageHandler.renderCatPage(req,res,next,props);
        
        
    } else if(PartnerCatsModel.isCatUrl(req)){
        props = PartnerCatsModel.getCatUrlProps(req);
        req.environment.lang=props.lang;
        res.locals.env.lang=props.lang;
        req.lang=props.lang;
        req.environment.trackingPageType="category";
        setupMetaObject(req,res,next,props,"website");
        if(props.id==req.environment.partnerData.breakingNewsCategory){ //breaking News
            breakingNewsPageHandler.renderBreakingNewsPage(req,res,next,props);
        } else if(props.id==req.environment.partnerData.photoGalleryNewsCategory){ //Photo Gallery
            photoGalleryPageHandler.renderPhotoGalleryPage(req,res,next,props);
        } else if(props.id==req.environment.partnerData.homePageV2NewsCategory){ //Similar to home page V2
            homePageV2PageHandler.renderSimilarHomePage(req,res,next,props);
        }  else {
            catPageHandler.renderCatPage(req,res,next,props);
        }

        
    }else if(PartnerAuthorsModel.isAuthorUrl(req)){
        props = PartnerAuthorsModel.getAuthorUrlProps(req);
        req.environment.trackingPageType="author";
        setupMetaObject(req,res,next,props,"website");
        authorPageHandler.renderAuthorPage(req,res,next,props);
    } else {
        req.environment.requestId = new Date().getTime();
        req.environment.trackingPageType="dynamic";

        dynamicPageHandler.renderDynamicPage(req,res,next);
    }
}
function checkIfEPaperUrl(path,env,epaperRoot,ePaperLocations){
        if(!epaperRoot){
            console.log("No Epaper root, returning");
            return false;
        }
        var result = false;
        var hasLocations = ePaperLocations && ePaperLocations.length>0;
        var arr = path.split("/");

        var remain = path.substring(epaperRoot.length+1,path.length);
        var a = remain.split("/");

        if(a.length>3){
            result=false;
        } else if(a.length>2 && a[2]){
            result=false;
        } else if(a.length>1 && a[1]){
            var dateReg = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
            var locReg = /^([a-zA-Z]+(-[a-zA-Z])*)+$/
            var x1=a[0];
            var x2=a[1];
            if(x2.match(dateReg) && x1.match(locReg) && x1.match(locReg)[0]==x1){
                env.ePaperLocation = x1;
                env.ePaperDate = x2;
                result=true;
            }

        } else {
            var dateReg = /^\d{4}[./-]\d{2}[./-]\d{2}$/;
            var locReg = /^[a-z]+$/;
            var x=a[0];
            if(x.match(dateReg)){
                env.ePaperDate = x;
                result=true;
            } else if(x.match(locReg)){
                env.ePaperLocation = x;
                result=true;
            } else {
                result=false;
            }
        }
        if(result && env.ePaperLocation){
            for(var i=0;i<ePaperLocations.length;i++){
                if(env.ePaperLocation == ePaperLocations[i]){
                    env.ePaperLocation = ePaperLocations[i];
                    result=true;
                    break;
                }   else {
                    result=false;
                }    
            }  
            if(!result){
                env.ePaperLocation = "";
            }  
        }
    return result;
}

function isSubscriptionDetailsPageUrl(req,res,next){
    var path = req.environment.pathname;
    var env = req.environment;
  
    var subscriptionDetailsPage = req.environment.partnerData.subscriptionDetailsPageUrl;
    if(!subscriptionDetailsPage){
        return false;
    }
    var result = false;
    var subscriptionDetailsRootCurrent="";
 
    if(req.environment.pathname==subscriptionDetailsPage || req.environment.pathname==subscriptionDetailsPage+"/"){
        result=true;
        subscriptionDetailsRootCurrent=subscriptionDetailsPage;
    }
    
    req.environment.subscriptionDetailsRootCurrent=subscriptionDetailsRootCurrent;
    return result;

}
function isSubscriptionPageUrl(req,res,next){
    
    var path = req.environment.pathname;
    var env = req.environment;
    
    var subscriptionPage = req.environment.partnerData.subscriptionPageUrl;
    // console.log(subscriptionPage);
    if(!subscriptionPage){
        return false;
    }
    var result = false;
    var subscriptionRootCurrent="";
 
    if(req.environment.pathname==subscriptionPage || req.environment.pathname==subscriptionPage+"/"){
        result=true;
        subscriptionRootCurrent=subscriptionPage;
    }
    
    req.environment.subscriptionRootCurrent=subscriptionRootCurrent;
    return result;
}


function isEPaperUrl(req,res,next){
    
    var path = req.environment.pathname;
    var env = req.environment;
    var epaperRoot = req.environment.partnerData.ePaperRootUrl;
    if(!epaperRoot){
        return false;
    }
    var epaperRootMultiple = req.environment.partnerData.ePaperRootUrlMuiltiple;
    var ePaperLocations = req.environment.partnerData.epaperLocationsUrls;
    var result = false;
    var epaperRootCurrent="";
    
    if(epaperRootMultiple){
        for(var i=0;i<epaperRoot.length;i++){
            if(req.environment.pathname==epaperRoot[i] || req.environment.pathname==epaperRoot[i]+"/"){
                result=true;
                epaperRootCurrent=epaperRoot[i];
                break;
            }
        
            if(path.indexOf(epaperRoot[i])==0){
                result = checkIfEPaperUrl(path,env,epaperRoot[i],ePaperLocations);
                if(result){
                    epaperRootCurrent = epaperRoot[i];
                    break;
                }
            } else {
                result=false;
            }
            
        }
    } else {
        if(req.environment.pathname==epaperRoot || req.environment.pathname==epaperRoot+"/"){
            result=true;
            epaperRootCurrent=epaperRoot;
        }
        if(!result) {
            if(path.indexOf(epaperRoot)!=0){
                result=false;
            } else {
                result = checkIfEPaperUrl(path,env,epaperRoot,ePaperLocations);
            }
        }
        if(result){
            epaperRootCurrent = epaperRoot;
        }
    }
    req.environment.epaperRootCurrent=epaperRootCurrent;
    return result;
}
function setupMetaObject(req,res,next,props,type){
    console.log(props);
    var env = req.environment;
    env.pageType=type;

    var partnerProps = req.environment.partnerData;
    res.locals.meta["title"] = props.title || props.pageTitle;
    res.locals.meta["description"] = props.description;
    res.locals.meta["keywords"] = props.keywords;
    res.locals.meta["lang"] = props.lang || partnerProps.defaultLang;
    res.locals.meta["logo"] = partnerProps.partnerLogo || "/images/logo.png";
    res.locals.meta["name"] = partnerProps.partnerName || req.partner;
    res.locals.meta["copyright"] = partnerProps.partnerCopyrightName || partnerProps.partnerName || req.partner;
    res.locals.meta["author"] = props.author || partnerProps.author || req.partner;
    res.locals.meta["url"] = env.rootUrl + (props.url || "/");
    res.locals.meta["searchUrl"] = env.rootUrl + (props.url ? (props.url.lastIndexOf("/")==props.url.length-1 ? props.url+"search?search={search_term_string}" : props.url+"/search?search={search_term_string}") :  "/search?search={search_term_string}");
    res.locals.meta["image"] = env.rootUrl + (props.image || res.locals.meta["logo"]);

    
    
}

function convertPDFToHTML(req,res,next){
    var pdftohtml = require('pdftohtmljs');
    var converter = new pdftohtml('file.pdf', "file.html");

    // see https://github.com/fagbokforlaget/pdftohtmljs/blob/master/lib/presets/ipad.js 
    converter.convert('ipad').then(function() {
      res.end();
    }).catch(function(err) {
      console.log(err);
      res.end();
    });
}

function setCustomVariables(req,res){
    var env = req.environment;
    var type="website";
    var d = {};
    var props = {};
    var partnerProps = env.partnerData;
    d['partnerName']=req.partner;
    d['domainName']=env.rootUrl;
    d['storyUrl']=env.pathname;
    d['authorName']=(props.author ? props.author.name : (props.source || partnerProps.author  || req.partner) );
    d['type']=type;
    d['campaignId']=env.query.utm_campaign || "NOT_FOUND";    
    if(env.customVariables){
        for(var k in d ){
            env.customVariables[k] = d[k];
        }
    } else {
        env.customVariables = d;    
    }
    
}
