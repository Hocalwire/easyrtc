"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var Utils = require("src/libs/Utils");
var url = require("url");
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var staticDataController = require("src/controller/helpers/staticDataController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var PartnerNewsCacheModel = require('src/models/PartnerNewsCacheModel');
var PartnerPropsModel = require("src/models/PartnerPropsModel");
var Promise = require('promise');
var logger = require('src/libs/logger');
var extend = require("extend");
var profileLogger = require("src/controller/helpers/profileLogger");

function checkIfImagPage(req,res,next){
    var env =req.environment;
    var path = req.pathname;
    if(path.indexOf(".png")==(path.length-4) || path.indexOf(".gif")==(path.length-4) || path.indexOf(".jpg")==(path.length-4)) {
        res.status(404);
        next();
        return true;
    }
    var isImagePage=false;
    var imgPref = env.partnerData.image_page_prefix || "";
    var imagePageQueryParam = env.partnerData.image_page_query_param || "";
    var prefHasVar = false;
    var prefHasVarIndex = imgPref.indexOf("##$$");
    var mediaId = "";
    var query = req.query;
    
    if(prefHasVarIndex>-1){  //prefix has variable position
        prefHasVar=true;
        imgPref = imgPref.substring(0,prefHasVarIndex);
    }
    
    if(imgPref && (path.indexOf(imgPref)==0 || path.indexOf("/"+imgPref)==0) ){
        isImagePage=true;
        if(imagePageQueryParam && query[imagePageQueryParam]){
            mediaId = query[imagePageQueryParam];
        } else if(prefHasVarIndex){

            mediaId = path.replace(imgPref,"");
        }
    }
    
    if(isImagePage && mediaId){
        var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
        setAsyncTenmplates(req,asyncTemplates);
        var data = {};
        data.partner = req.partner;
        data.mediaIds = mediaId ? [mediaId] : [];
        data.title = "Image Page";
        data.newsUrl = path;
        var renderpath = PartnerPropsModel.data[req.partner]["theme"]+'/newsImagePage';
        // data["ampAds"] = PartnerContentTemplateModel.getAMPPageTemplate(req,PartnerPropsModel.data[req.partner]["theme"]);
                  
        Utils.render(req,res,renderpath, {
            "data" : data
        }, function(err, html) {
            
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            Utils.writeToLogFile(logger,req.loadTime,req);
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
            
        });
        return true;

    } 
    return false;
    
}
function checkifPlaceHolderPath(req,res,next){
    var path = req.pathname;
    if(path.indexOf("/show-all-placeholder-options")==0) {
        var renderpath = 'common/placeHolderTypesSupported';
        // data["ampAds"] = PartnerContentTemplateModel.getAMPPageTemplate(req,PartnerPropsModel.data[req.partner]["theme"]);
                  
        Utils.render(req,res,renderpath, {
            "data" : {"styles":["style1","style2","style3","style4","style5","style6","style7","style8","style9"]}
        }, function(err, html) {
            
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(html);
            return true;
            
        });
        return true;
        
    }
    return false;
}
function attachSocialItems(req,data,rdm,meta){
    var env =req.environment;
    var socialObject = {};
    
    socialObject["og:title"]=rdm.fb_title_heading || meta["title"];
    socialObject["og:description"]=rdm.fb_title_desc || meta["description"];
    var fbMediaId=rdm.fb_media && rdm.fb_media!="undefined" ? rdm.fb_media.split(",")[0] : data.mediaIds.length>0?data.mediaIds[0] :"";
    var fbMediaUrl =  data["mediaType"]=="youtube" || data["mediaType"]=="external" || data["mediaType"]=="externalNoProtocol" ? Utils.getMediaUrl(data,[fbMediaId]) : Utils.getMediaUrl(data,[fbMediaId],env.rootUrl); //env.rootUrl+
    if(data["mediaType"]=="youtube" && fbMediaId.indexOf("yt_")==0){
        fbMediaId = fbMediaId.trim().substring(3,fbMediaId.trim().length); 
        fbMediaUrl = env.rootUrl+"/xhr/admin/downloadYoutubeThumb?videoId="+fbMediaId;//"https://img.youtube.com/vi/"+mediaId+"/0.jpg"; //"http://hocalwire.com/admin/downloadYoutubeThumb?videoId="+mediaId;   
    }
    
    socialObject["og:image"]=fbMediaUrl || meta.shareImage || meta.image;

    socialObject["twitter:title"]=rdm.tw_title_heading || meta["title"];;
    socialObject["twitter:description"]=rdm.tw_title_desc || meta["description"];
    var twMediaId=rdm.tw_media && rdm.tw_media!="undefined" ? rdm.tw_media.split(",")[0] : data.mediaIds.length>0?data.mediaIds[0] :"";
    var twMediaUrl = data["mediaType"]=="youtube" || data["mediaType"]=="external" || data["mediaType"]=="externalNoProtocol" ? Utils.getMediaUrl(data,[twMediaId]) : Utils.getMediaUrl(data,[twMediaId],env.rootUrl); //env.rootUrl+
    if(data["mediaType"]=="youtube" && twMediaId.indexOf("yt_")==0){
        twMediaId = twMediaId.trim().substring(3,twMediaId.trim().length); 
        twMediaUrl = env.rootUrl+"/xhr/admin/downloadYoutubeThumb?videoId="+twMediaId;//"https://img.youtube.com/vi/"+mediaId+"/0.jpg"; //"http://hocalwire.com/admin/downloadYoutubeThumb?videoId="+mediaId;   
    }

    socialObject["twitter:image"]=twMediaUrl || meta.shareImage || meta.image;
    socialObject['twitter:image:alt'] = data.mainImageAlt || data.title;
    if(rdm.tw_tags){
        socialObject['article:tag'] = rdm.tw_tags;
    }
    if(rdm.fb_tags){
        socialObject['og:tag'] = rdm.fb_tags;
    }
    if(env.partnerData.twitter_handle){
        socialObject['twitter:site'] = env.partnerData.twitter_handle;    
    }
    if(rdm.fb_author_url){
        socialObject['og:author'] = rdm.fb_author_url;
    } else if(env.partnerData.defaultSourceUrl){
        socialObject['og:author'] = env.partnerData.defaultSourceUrl;
    }
    if(env.partnerData.defaultSourceUrl){
        socialObject['article:publisher'] = env.partnerData.defaultSourceUrl;
    }
    if(rdm.tw_author_url){
        socialObject['twitter:creator'] = rdm.tw_author_url;
    }
    env.customSocialMeta = socialObject;
    return data['socialObject'] = socialObject;
}
function setCustomVariables(req,res,props){
    var env = req.environment;
    var type=props.storyType || "story";
    var d = {};
    var partnerProps = env.partnerData;
    d['partnerName']=req.partner;
    d['domainName']=env.rootUrl;
    d['storyId']=props.newsId;
    d['storyUrl']=props.newsUrl || props.url;
    d['date']=props.date?props.date.split(" ")[0] : "NOT_FOUND";
    d['time']=props.date?props.date.split(" ")[1] : "NOT_FOUND";
    d['createdById']=props.creatorId || props.authorId;
    d['createdByName']=props.creatorName || ((props.author ? props.author.name : (props.source || partnerProps.author  || req.partner) ));
    d['authorId']=props.authorId || "NOT_FOUND";
    d['authorName']=(props.author ? props.author.name : (props.source || partnerProps.author  || req.partner) );
    d['type']=type;
    d['language'] =props.lang || "";
    d['campaignId']=env.query.utm_campaign || "NOT_FOUND";    
    if(env.customVariables){
        for(var k in d ){
            env.customVariables[k] = d[k];
        }
    } else {
        env.customVariables = d;    
    }
    
}
function replaceInsideContentSyncAds(data){
	var s = data.story;
	for(var i=0;i<4;i++){
		var xx = "inside_post_content_ad_"+(i+1); 
		if(data[xx] && data[xx]['templateData'] && data[xx]['templateData']['content']){
			s=s.replace("<div class='hide inside-post-ad' id='"+xx+"'>",data[xx]['templateData'].content);
		}
		
	}
	return s;
}
function renderDynamicPage(req, res, next) {
    // console.log("================================render dynamic page===================");
    // console.log("checking clear cache for parther test========================================================================================================================================");
    // console.log("================================render dynamic page===================11111");
    req.loadTime.push(new Date().getTime());
    var isBot = Utils.isBot(req);
    var ip = Utils.getIP(req);
    var cookie = req.cookies["_ga_external_value_"];
    var isOldUser = false;
    var referer =  req.headers.referer;
    req.environment.referer = referer;
    req.environment.isDynamicPage = true;
    var env =req.environment;
    env.isArticlePage=true;
    if(cookie && cookie=="1"){
        isOldUser = true;
    } 
    var ifPlaceHolderPath = checkifPlaceHolderPath(req,res,next);
    if(ifPlaceHolderPath){
        return;
    }
    var isImagePage = checkIfImagPage(req,res,next);
    if(isImagePage){
        return;
    }

    var hasAmp = req.environment.partnerData.hasAMPPage || false;
    var path = req.pathname;
    if(hasAmp && path.indexOf("/amp/")==0){
        path = path.substring(4,path.length);
    } else {
        hasAmp = false;
    }
    var isPdfFullPage = false;
    if(path.indexOf("/full-page-pdf/")==0){
        var l = "/full-page-pdf/".length;
        isPdfFullPage=true;
        path = path.substring(l-1,path.length);
    }
    profileLogger.logDetails(req,"validateUrl",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
    // renderIfPDF(req,res,next);
    var options = {
            rdm : apiHelper.getURL(Constants.validateURL,req.partner)
        };
    options.rdm.setRDMProperty("1","url",path);
    if(req.environment.partnerData.sendQueryParamsInValidate){
        var queryParams = [];
        var qp = "";
        for(var k in req.query){
            queryParams.push(k+"="+req.query[k]);
        }
        if(queryParams.length){
            qp = queryParams.join("&");
        }
        qp=encodeURIComponent(qp);
        options.rdm.setRDMProperty("1","query_params",qp);
    }
    var promiseNew = PartnerNewsCacheModel.getNews(options, req, res);
    promiseNew.then(function(response) {
            //pageType, 
            req.loadTime.push(new Date().getTime());
            var newsId = "";
            var pageType = "";
            var httpCode = "";
            var finalUrl = "";
            var resourceUrl = "";
            var pageCount=1;
            var baseUrl ="";
            var pageNo=1;
            var pageSufix = "";
            var originalUrl = "";
            var isContent = false;
            var contentType = "-1";
            var altText = "";
            var caption = "";
            var rdmRow;
            for(var k in response.rdRows){
                newsId = response.rdRows[k].id;
                pageType = response.rdRows[k].pageType;
                httpCode = response.rdRows[k].http_response;
                finalUrl = response.rdRows[k].url;
                resourceUrl = response.rdRows[k].resourceUrl;
                pageCount = response.rdRows[k].page_count;
                baseUrl = response.rdRows[k].base_url;;
                pageNo = response.rdRows[k].page_no;
                pageSufix = response.rdRows[k].sufix;
                originalUrl = finalUrl;
                altText = response.rdRows[k].alt_text;
                caption = response.rdRows[k].caption;
                contentType = response.rdRows[k].content_type;
                rdmRow = response.rdRows[k];
                break;
            }

            if(req.environment.urlQueryParams ){
                    finalUrl = finalUrl+"?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
            }
            
            if(httpCode == '404' && req.xhr){
                res.send(404,"loaderror=true");
                res.end();
                return;
            }
            if(httpCode == '404') {
                res.status(404);
                next();
                return;
            } else if(httpCode == '301') {
                var urll = Utils.xmlEncodeChars(finalUrl);
                console.log(urll);
                res.redirect(301, urll);
                return;
            }
            
            
            
            
            var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
            if(pageType=="buzz_details"){
                handleBuzzDetailsPage(req,res,next,response,"news_details");
                return;
            }
            
            if(pageType == 'news_details' || pageType == 'story_preview') {
                if(req.environment.partnerData.news_cache_millis){
                    if(promiseNew.data){
                    } else {
                        PartnerNewsCacheModel.updateNewsInCache(req,res,response);
                    }
                }
                req.loadTime.push(new Date().getTime());
                var d = commonController.getData(req,response,newsId);
                if(pageType == 'news_details'){
                    setCustomVariables(req,res,d);
                }
                req.environment.dynamicPage=true;
                var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,pageType,PartnerPropsModel.data[req.partner]["theme"]);
                var env =req.environment;
                asyncTemplates = PartnerNewsCacheModel.mergeAsynvWithSyncIfInCache(req,res,asyncTemplates,d);
                
                // d.story=replaceInsideContentSyncAds(d);
                req.loadTime.push(new Date().getTime());
                commonController.setBreadcrumb(req,d.category);
                
                // pageCount = "3";
                // baseUrl = "/ashwani";
                // pageNo = "2";
                // pageSufix = "/page-";
                d['pageCount'] = pageCount ? parseInt(pageCount) :1;
                d['baseUrl'] = baseUrl ? baseUrl : originalUrl ? originalUrl: finalUrl;
                d['pageNo'] = pageNo ? parseInt(pageNo) :1;
                d['pageSufix'] = pageSufix ? pageSufix :"/page-";
                d["queryparams"] = req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
                req.environment.breadcrumb.push({"name":d.title,"url":d.newsUrl});
                setupMetaObject(req,res,next,d,"article");
                attachSocialItems(req,d,rdmRow,res.locals.meta);
                // if(pageType = 'news_details'){
                    var similarNews = { id: d.newsId,
                        mixinName: 'relatedPost',
                        theme: PartnerPropsModel.data[req.partner]["theme"],
                        categoryId: d.category,
                        link: d.categoryUrl,
                        
                        element_type: 'CONTENT',
                        element_id: 'related_post',
                        is_visible: 'true',
                        content: '',
                        default_content: '',
                        is_sync: 'false',
                        page: 'news_details',
                        excludeNews : d.newsId,
                        description: '',
                        content_type: 'CATEGORY_NEWS',
                        heading: 'Similar Posts',
                        maxCount:  req.environment.partnerData.similar_news_count || 4,
                        newsCount:  req.environment.partnerData.similar_news_count ? parseInt(req.environment.partnerData.similar_news_count)+1: 5,
                        includeAsItemsInResponse : "inside_post_content_ad_1_before,inside_post_content_ad_2_before"
                    };

                    asyncTemplates.push(similarNews);
                        
                // }
                var env = req.environment;
                if(env.partnerData.disqus_root_url){

                    var commentWidget = { 
                        id: env.pageIdentifier,
                        mixinName: 'commentWidget',
                        theme: env.partnerData["theme"],
                        categoryId: "comment",
                        link: "http://"+env.partnerData.disqus_root_url,
                        newsCount: '5',
                        element_type: 'CONTENT',
                        element_id: 'comments',
                        is_visible: 'true',
                        content: '',
                        default_content: '',
                        is_sync: 'false',
                        page: pageType,
                        description: '',
                        content_type: 'COMMENT_WIDGET',
                        heading: 'Comments',
                        maxCount:  4
                    };
                         
                    asyncTemplates.push(commentWidget);
                } else if(env.partnerData.useCustomCommentWidget){
                    var commentWidget = { 
                        id: env.pageIdentifier,
                        mixinName: 'commentWidget',
                        theme: env.partnerData["theme"],
                        categoryId: "comment",
                        link: "http://"+env.partnerData.disqus_root_url,
                        newsCount: '5',
                        element_type: 'CONTENT',
                        element_id: 'comments',
                        is_visible: 'true',
                        content: '',
                        default_content: '',
                        is_sync: 'false',
                        page: pageType,
                        description: '',
                        content_type: 'COMMENT_WIDGET',
                        heading: 'Comments',
                        maxCount:  4,
                        widgetType:"custom"

                    };
                         
                    asyncTemplates.push(commentWidget);
                }
                staticMixinController.getMixinData(req,res,syncTemplates,d);
                staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,d);

                setAsyncTenmplates(req,asyncTemplates);
                if(d.story){
					d['story'] = Utils.replaceHtmlEntities(d.story);
					if(env.partnerData.postContentAdInsertRange){
					    d['story'] = Utils.getDetailedStoryContent(d['story'],(env.partnerData.postContentAdInsertRange || 200),(env.partnerData.no_of_ads_inside_post || 3),d);  
				    } 
                } else {
                	d.story = d.description;
                }
                profileLogger.logDetails(req,"callingRender",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
                var requestTime = new Date().getTime();
                var isFinished =false;
                var isAborted=false;
                var isClosed=false;
                res.on('finish',function(){   
                   if(isFinished){
                    return;
                   }
                   isFinished =true;
                   profileLogger.logDetails(req,"connectionfinished",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
                });
                req.on('close',function(){   
                    if(isClosed) return;
                    isClosed=true;
                   profileLogger.logDetails(req,"connectionclosed",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
                });
                
                req.on('aborted',function(){   
                    if(isAborted) return;
                    isAborted=true;
                   profileLogger.logDetails(req,"connectionaborted",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
                });
               

               var renderpath = (hasAmp && pageType=="news_details" ? 'common/amp/ampNewsDetails' : PartnerPropsModel.data[req.partner]["theme"]+'/newsDetails');
               if(hasAmp){
                    d["ampAds"] = PartnerContentTemplateModel.getAMPPageTemplate(req,PartnerPropsModel.data[req.partner]["theme"]);
                    req.environment.isAMPPage=true;
               }
               req.loadTime.push(new Date().getTime());
               Utils.render(req,res,renderpath, {
                    data : d
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    if(!isOldUser){
                        Utils.writeCookie(req,res,"_ga_external_value_","1",(365*24*60*60*1000));
                    }
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    profileLogger.logDetails(req,"rendering",{"url":req.pathname,"user agent":req.headers["user-agent"],"requestId":req.environment.requestId,"isBot":isBot,"ip":ip,"isold":isOldUser,"referer":referer});
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(html);
                    
                });
            }else if(pageType == 'epaper') {
                req.loadTime.push(new Date().getTime());
                var d = {"pageType":pageType,"url":finalUrl,"resourceUrl":resourceUrl,"title":"E-Paper","description":"E-Paper description","keywords":req.environment.partnerData.partnerName+" epaper","mediaIds":[],"id":newsId};
                var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
                staticMixinController.getMixinData(req,res,syncTemplates,d);
                staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,d);
                
    
                req.environment.breadcrumb.push({"name":"E-Paper","url":url});
                setupMetaObject(req,res,next,d,"article");
                
                
                
                // asyncTemplates.push(similarNews);
                setAsyncTenmplates(req,asyncTemplates);
                if(isPdfFullPage){
                    res.render('common/fullPageEpaperDetails', {

                        data : d
                        }, function(err, html) {
                            req.loadTime.push(new Date().getTime());
                            if (err) {
                                logger.error('in index file', err.message);
                                return next(err);
                            }
                            Utils.writeToLogFile(logger,req.loadTime,req);
                            res.send(200, html);
                        });    
                } else {
                    res.render(PartnerPropsModel.data[req.partner]["theme"]+'/epaperDetails', {
                        data : d
                        }, function(err, html) {
                            req.loadTime.push(new Date().getTime());
                            if (err) {
                                logger.error('in index file', err.message);
                                return next(err);
                            }
                            Utils.writeToLogFile(logger,req.loadTime,req);
                            res.send(200, html);
                        });    
                }
                
            } else if(pageType == 'blog_details') {
                var d = commonController.getData(req,response,newsId);
                setAsyncTenmplates(req,asyncTemplates);
                res.render(PartnerPropsModel.data[req.partner]["theme"]+'/blogDetails', {
                data : d
                }, function(err, html) {
                    req.loadTime.push(new Date().getTime());
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    Utils.writeToLogFile(logger,req.loadTime,req);
                    res.send(200, html);
                });
            } else if(pageType=="content_details"){
                handleContentDetailsDisplay(req,res,next,response,newsId,contentType);
            } else {
                res.status(404);
                next();
                return;
            }
            
    },
    function(e) {
        logger.error('error caching page', e.message);
        next(e);
    })
    .catch(function(e) {
        logger.error('error caching page callback:', e.message);
        next(e);
    });       
        
}
function handleBuzzDetailsPage(req,res,next,rdm,pageType){
    var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
    var d = staticDataController.parseBuzzData(req,res,rdm,"");
    if(d.length>0){
        d = d[0];
    }
    var similarNews = { id: d.newsId,
        mixinName: 'relatedPost',
        theme: PartnerPropsModel.data[req.partner]["theme"],
        categoryId: d.category || "5400",
        link: d.categoryUrl,
        
        element_type: 'CONTENT',
        element_id: 'related_post',
        is_visible: 'true',
        content: '',
        default_content: '',
        is_sync: 'false',
        page: 'news_details',
        excludeNews : d.newsId,
        description: '',
        content_type: 'CATEGORY_NEWS',
        heading: 'Similar Posts',
        maxCount:  req.environment.partnerData.similar_news_count || 4,
        newsCount:  req.environment.partnerData.similar_news_count ? req.environment.partnerData.similar_news_count+1: 5
    };

    asyncTemplates.push(similarNews);
    var syncTemplates = PartnerContentTemplateModel.getSyncPageTemplate(req,pageType,PartnerPropsModel.data[req.partner]["theme"]);
    commonController.setBreadcrumb(req,d.category);
    staticMixinController.getMixinData(req,res,syncTemplates,d);
    staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,d);
    setAsyncTenmplates(req,asyncTemplates);
    var templatePath = PartnerPropsModel.data[req.partner]["theme"]+"/buzzDetails";
    res.render(templatePath, {
        data : d
        }, function(err, html) {
            req.loadTime.push(new Date().getTime());
            if (err) {
                logger.error('in index file', err.message);
                return next(err);
            }
            Utils.writeToLogFile(logger,req.loadTime,req);
            res.send(200, html);
    });
}
function handleContentDetailsDisplay(req,res,next,rdm,id,type){
    var env = req.environment;
    var d = commonContentController.getData(req,rdm,id);
    var templatePath = PartnerPropsModel.data[req.partner]["theme"]+"/genericDetails";
    var asyncTemplates;// = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
    console.log(type);
    if(type){
        var content;
        console.log(env.partnerContentData);
        for(var k in env.partnerContentData){
           console.log(env.partnerContentData[k].props);
            if(env.partnerContentData[k].props.id==type){
                content = env.partnerContentData[k].props;
                break;
            }
        }
        console.log(content);
        if(content && content.name){
            asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,content.name.toLowerCase()+"_details",PartnerPropsModel.data[req.partner]["theme"]);
            templatePath = PartnerPropsModel.data[req.partner]["theme"]+"/"+content.name+"Details";
            req.environment.breadcrumb.push({"name":content.display_name,"url":content.url});
            req.environment.breadcrumb.push({"name":d.title,"url":d.url});
        } else {
            asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"generic_details",PartnerPropsModel.data[req.partner]["theme"]);
        }
        var rdmRow;
        for(var k in rdm.rdRows){
            rdmRow = rdm.rdRows[k];
            break;
        }
        if(!d.mediaUrl){
            d.mediaUrl = "/images/logo.png";
        }

        setupMetaObject(req,res,next,d,"article");
        attachSocialItems(req,d,rdmRow,res.locals.meta);
        staticMixinController.addAsyncPlaceHolderMixin(req,res,asyncTemplates,d);
        
        setAsyncTenmplates(req,asyncTemplates);
        res.render(templatePath, {
            data : d
            }, function(err, html) {
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                req.loadTime.push(new Date().getTime());
                Utils.writeToLogFile(logger,req.loadTime,req);
                res.send(200, html);
        });
    }        
}
function getValValue(req,varvalue){
    var result="";
    var a = varvalue.split("+");
    for(var k=0;k<a.length;k++){
        var res;
        var aa = a[k].split(".");
        for(var j=0;j<aa.length;j++){
            if(!res) {
                res = req[aa[j]];
            } else {
                res = res[aa[j]];
            }
            
        }
        result =result+res;
    }
    return result;
}
function setAsyncTenmplates(req,asyncTemplates){
    var aTemplates = [];
    var aTemplates = extend(true,aTemplates,asyncTemplates);
    for(var i=0;i<aTemplates.length;i++){ //encode content of template

        if(aTemplates[i].content.indexOf("##$$") >-1){
            var variables = [];
            var c=aTemplates[i].content;
            var start = -1;
            var end = -1;
            for(var j=0;j<c.length;j++){

                if(start<0 && j<c.length && c[j]=="$" && c[j-1]=="$" && c[j-2]=="#" && c[j-3]=="#"){
                    start = j+1;
                }
                if(end<0 && j<c.length && c[j]=="#" && c[j-1]=="#" && c[j-2]=="$" && c[j-3]=="$"){
                    end = j-3;
                }
                if(start>-1 && end>-1){
                    var tvar = c.substring(start,end);
                    var vvalue = getValValue(req,tvar);
                    variables.push({"start":start,"end":end,"variable":tvar,"value":vvalue});
                    start=-1;
                    end=-1;
                }
            }
            var indexShift=0;
            for(var j=0;j<variables.length;j++){
                var i1 = variables[j].start-4+indexShift;
                var i2 = variables[j].end+4+indexShift;
                var vva = variables[j].value;
                var tvar = variables[j].variable;
                indexShift = indexShift+(vva.length-tvar.length-8);
                var p1 = aTemplates[i].content.substring(0,i1);
                var p2 = aTemplates[i].content.substring(i2,aTemplates[i].content.length);
                // console.log(p1);
                // console.log(p2);
                aTemplates[i].content = p1 + vva +p2;
            }
                    
            
            aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
        } else {
            aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
        }
        
    }
    req.environment.asyncTemplates = aTemplates;

}
function setupMetaObject(req,res,next,props,type){
    var env = req.environment;
    env.pageType=type;
    env.newsId = props.newsId;
    var partnerProps = req.environment.partnerData;
    
    res.locals.meta["title"] = Utils.trimSentence(props.title,200,"").finalString;
    res.locals.meta["description"] = Utils.trimSentence(props.description || props.story || "",200,"...").finalString;
    if(!res.locals.meta["description"]) {
        res.locals.meta["description"] = res.locals.meta["title"];
    }
    res.locals.meta["socialDescription"] = props.socialDescription;
    
    res.locals.meta["keywords"] = props.keywords;
    res.locals.meta["lang"] = props.lang;
    res.locals.meta["logo"] = partnerProps.partnerLogo || "/images/logo.png";
    res.locals.meta["name"] = partnerProps.partnerName || req.partner;
    res.locals.meta["copyright"] = partnerProps.partnerCopyrightName || partnerProps.partnerName || req.partner;
    res.locals.meta["author"] = partnerProps.defaultSourceUrl ? partnerProps.defaultSourceUrl : (props.author ? props.author.name : (props.source || partnerProps.author  || req.partner) );
    res.locals.meta["mediaType"] = props.mediaType;
    res.locals.meta["image"] = props.mediaUrl || "/images/logo.png";
    res.locals.meta["shareImage"] = props.thumbUrlShare || props.thumbUrl;
    res.locals.meta["videoId"] = props.videoId;
    res.locals.meta["tags"] = props.tags;
    res.locals.meta["url"] = env.rootUrl+props.newsUrl;
    res.locals.meta["ampurl"] = env.rootUrl+"/amp"+props.newsUrl;
    res.locals.meta["publishDate"] = props.date_published;
    for(var k in res.locals.meta){
        if(!env[k]){
            env[k] = res.locals.meta[k];
        }
    }
    env.pageIdentifier = props.newsUrl;

}


module.exports.renderDynamicPage = renderDynamicPage;
