
'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var partnerConfig = require('src/config/PartnerConfig');
var PartnerNotificationModel = {};
var MAX_NOTI_COUNT = 10;
var MAX_SESSION_COUNT = 1000;
PartnerNotificationModel.getNotification = function(req,res,next) {
    return sendNotification(req,res,next);
};
PartnerNotificationModel.addNotification = function(req,res,next) {
    return addNotification(req,res,next);
};

PartnerNotificationModel.data = {};

function addNotification(req,res,next){

}

function sendNotification(req,res,next) {
    var notificationIds = (req.cookies["_notification_ids"] || "").split(",");
    var partner = req.partner;
    var data =  PartnerNotificationModel.data[partner];
    if(!data) {
        PartnerNotificationModel.data[partner] = [];
        data =  PartnerNotificationModel.data[partner];
    }

    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerNotificationModel.promises[partner] = getPartnerPropsApi(partner);

        PartnerNotificationModel.promises[partner].then(
            function(response){
                PartnerNotificationModel.data[partner] = getPartnerPropsData(response);
            },
            function(err){
                PartnerNotificationModel.promises[partner] = null;
                PartnerNotificationModel.data[partner] = null;
            });

    
    return PartnerNotificationModel.promises[partner];
}
function getPartnerPropsData(rdm){
    var data = {};
    data = processHomePageUrlsData(rdm,data);
    data = processStaticPageUrlsData(rdm,data);
    data = processOtherProps(rdm,data);
    data = processHeaderUrls(rdm,data);
    data = processHeaderCategoryUrls(rdm,data);
    return data;
};
function processOtherProps(rdm,data){
    var socialUrls,socialUrlsDisplay,currentTags,currentTagsDisplay;
    
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        
        switch(key) {
            
            case "postContentAdInsertRange" : 
                data["postContentAdInsertRange"] = parseInt(rdm.getRDMProperty(id,"value"));
                break;          
            case "partner_preload_extra_resource_path" : 
                data["extraPreloadResouces"] = rdm.getRDMProperty(id,"value");
                var a = data["extraPreloadResouces"].split("##$$");
                data["extraPreloadResouces"] ={};
                if(a.length>1){
                    data["extraPreloadResouces"]['js'] = a[0].split(",");
                    data["extraPreloadResouces"]['css'] = a[1].split(",");
                } else {
                    data["extraPreloadResouces"]['js'] = a[0].split(",");
                    data["extraPreloadResouces"]['css']=[];
                }
                
                break;
            case "partner_domain" : 
                data["partnerDomains"] = rdm.getRDMProperty(id,"value");
                data["partnerDomains"] = data["partnerDomains"].split(",");
                break;
            case "domain_name" : 
                data["domainName"] = rdm.getRDMProperty(id,"value");
                break;
            case "site_ad_tracking_id" : 
                data["piwikSiteTrackingId"] = rdm.getRDMProperty(id,"value");
                break;

            case "PRELOAD_GTMCODE" : 
                data["PRELOAD_GTMCODE"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_extra_header_tags" : 
                data["extraHeaderTags"] = rdm.getRDMProperty(id,"value");
                break;
            case "breaking_news_category" : 
                data["breakingNewsCategory"] = rdm.getRDMProperty(id,"value");
                break;
            case "no_description_in_social_share" : 
                data["doNotShowDescriptionInSocialShare"] = rdm.getRDMProperty(id,"value");
                break;
            case "editor_email" : 
                data["editorEmail"] = rdm.getRDMProperty(id,"value");
                break;
            case "default_source_url" : 
                data["defaultSourceUrl"] = rdm.getRDMProperty(id,"value");
                break;
            case "old_post_has_duplicate_image" : 
                data["oldPostDuplicateImage"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_extra_css_path" : 
                data["extraStylePath"] = rdm.getRDMProperty(id,"value");
                
                break;
            case "partner_another_site_link" : 
                data["partner_another_site_link"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_extra_resource_version" : 
                data["partner_extra_resource_version"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_extra_resource_path" : 
                data["partner_extra_resource_path"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_default_author" : 
                data["author"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_display_name" : 
                data["partnerName"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_copyright_name" : 
                data["partnerCopyrightName"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_logo" : 
                data["partnerLogo"] = rdm.getRDMProperty(id,"value");
                break;
            case "partner_home_name" : 
                data["partnerHomeName"] = rdm.getRDMProperty(id,"value");
                break;
            
            case "GACODE" : 
                data["GACODE"] = rdm.getRDMProperty(id,"value");
                break;
            case "FBCODE" : 
                data["FBCODE"] = rdm.getRDMProperty(id,"value");
                break;
            case "GTMCODE" : 
                data["GTMCODE"] = rdm.getRDMProperty(id,"value");
                break;
            case "theme" : 
                data["theme"] = rdm.getRDMProperty(id,"value");
                break;
            case "default_language" : 
                data["defaultLang"] = rdm.getRDMProperty(id,"value");
                break;
            case "social_urls_links" : 
                socialUrls = rdm.getRDMProperty(id,"value");
                break;
            case "social_urls_display_name" : 
                socialUrlsDisplay = rdm.getRDMProperty(id,"value");
                break;
            case "website_current_tags" : 
                currentTags = rdm.getRDMProperty(id,"value");
                break;
            case "website_current_tags_display" : 
                currentTagsDisplay = rdm.getRDMProperty(id,"value");
                break;
            case "photo_gallery_category" : 
                data["photoGalleryNewsCategory"] = rdm.getRDMProperty(id,"value");
                break;
            case "epaper_category" :
                data["epaperCategoryId"] = rdm.getRDMProperty(id,"value");
                break;
            case "epaper_locations" :
                data["epaperLocations"] = rdm.getRDMProperty(id,"value") || "";
                if(data["epaperLocations"])
                    data["epaperLocations"] = data["epaperLocations"].split(',');
                break;
            case "epaper_locations_urls" :
                data["epaperLocationsUrls"] = rdm.getRDMProperty(id,"value") || "";
                if(data["epaperLocationsUrls"])
                    data["epaperLocationsUrls"] = data["epaperLocationsUrls"].split(',');
                else 
                    data["epaperLocationsUrls"]="";
                break;
            case "epaper_root" :
                data["ePaperRootUrl"] = rdm.getRDMProperty(id,"value") || "";
                if(data["ePaperRootUrl"].indexOf(",")>-1){
                    data["ePaperRootUrl"] = data["ePaperRootUrl"].split(",");
                    data['ePaperRootUrlMuiltiple']=true;
                } else {
                    data['ePaperRootUrlMuiltiple']=false;
                }
                
                break;
            case "subscription_page_url" :
                data["subscriptionPageUrl"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "subscription_details_page_url" :
                data["subscriptionDetailsPageUrl"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "epaper_custom_dates" :
                data["ePaperCustomDates"] = rdm.getRDMProperty(id,"value") || "";
                data["ePaperCustomDates"] = data["ePaperCustomDates"].split(",");
                break;
            case "home_link_url" :
                data["partnerHomeLinkUrl"] = rdm.getRDMProperty(id,"value") || "";
                
                break;
            case "disqus_root_url" :
                data["disqus_root_url"] = rdm.getRDMProperty(id,"value") || "";
                
                break;
            case "enable_logging" :
                data["enable_logging"] = rdm.getRDMProperty(id,"value") || "";
                
                break;
            case "no_of_ads_inside_post" :
                data["no_of_ads_inside_post"] = rdm.getRDMProperty(id,"value") || "";
                
                break;
            case "rss_feed_url" :
                data["rssFeedUrl"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "gplus_publisher_link" :
                data["gplus_publisher_link"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "home_page_h1_tag_description" :
                data["home_page_h1_tag_description"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "goto_next_page_message" :
                data["goto_next_page_message"] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "list_sub_partners" :
                var subPartners = rdm.getRDMProperty(id,"value");
                if(subPartners){
                    data["subPartners"] = subPartners.split(",");
                }
                break;
            case "list_pages_require_login" :
                var requireLoginPages = rdm.getRDMProperty(id,"value");
                if(requireLoginPages){
                    data["requireLoginPages"] = requireLoginPages.split(",");
                }
                break;
            case "twitter_handle" :
                data["twitter_handle"] = rdm.getRDMProperty(id,"value") || "";
                break;  
            case "listing_mixin" :
                data["listing_mixin"] = rdm.getRDMProperty(id,"value") || "";
                break; 
            case "create_category_rss_feed" :
                data["create_category_rss_feed"] = rdm.getRDMProperty(id,"value") || "";
                break;   
            case "searchable_content_types" :
                data["searchable_content_types"] = rdm.getRDMProperty(id,"value") || "";
                break;   
            case "admin_page_url" :
                data["admin_page_url"] = rdm.getRDMProperty(id,"value") || "";
                break;  
            case "category_templates" :
                var o = {};
                //data["categoryTemplates"]
                var d = rdm.getRDMProperty(id,"value") || "";
                var a = d.split(",");
                for(var i=0;i<a.length;i++){
                    var aa = a[i].split("#");
                    o[aa[0]] = aa[1];
                }
                data["categoryTemplates"] = o;
                break; 
            case "similar_news_count" :
                data["similar_news_count"] = rdm.getRDMProperty(id,"value") || "";
                break; 
            case "create_custom_feed_with_all_data" :
                data["create_custom_feed_with_all_data"] = rdm.getRDMProperty(id,"value") || "";
                break;     
            
            
             // case "static_mixin_props" :
             //    console.log("\n\n11111111\n\n");
             //    var dt = rdm.getRDMProperty(id,"value") || "";
             //    if(dt){
             //        data["staticMixins"]={};
             //        console.log(dt);
             //        var xx = dt.split("$$");
             //        console.log(xx);
             //        for(var i=0;i<xx.length;i++){
             //            console.log("inside loop");
             //            var xxx = xx[i].split("#");
             //            console.log(xxx);
             //            data.staticMixins[xxx[0]] = data.staticMixins[xxx[0]] || {};
             //            console.log("2");
             //            data.staticMixins[xxx[0]][xxx[1]] = data.staticMixins[xxx[0]][xxx[1]] || {};
             //            console.log("3");
             //            data.staticMixins[xxx[0]][xxx[1]][xxx[2]] = true;
             //            console.log("4");
             //        }
             //    } else {
             //        data["staticMixins"] = null;    
             //    }
             //    console.log("\n\n22222222\n\n");
             //    console.log(data.staticMixins);
             //    break;
            
           
        }
    }
    
    data['externalResourcesVersion'] = data.partner_extra_resource_version ? data.partner_extra_resource_version:1;
    if(data.partner_extra_resource_path){
        var a = data.partner_extra_resource_path ? data.partner_extra_resource_path.split(",") : null;
        data['externalResources'] = a;
    }
    if(data.partner_another_site_link){
        a = data.partner_another_site_link.split("##$$");
        var  o = {"name":a[0],"url":a[1]};
        data.externalSite = o;
    }
    if(socialUrls && socialUrls!="null"){
        var urlsA = socialUrls.split(",");
        var urlsDisplayA = socialUrlsDisplay.split(",");
        var o = [];
        for(var i=0;i<urlsA.length;i++){
            
            var oo = {};
            oo["url"] = urlsA[i];
            oo["name"] = urlsDisplayA[i].trim();
            if(oo['name']=="facebook"){
                data["facebookUrl"] = oo["url"];
            }
            if(oo['name']=="twitter"){
                data["twitterUrl"] = oo["url"];
            }
            
            o.push(oo);
        }
        data["socialLinks"] = o;
            
    } else {
        data["socialLinks"] = [];
    }
    if(currentTags){
     
        var urlsA = currentTags.split(",");
        var urlsDisplayA = currentTagsDisplay ? currentTagsDisplay.split(",") : [];
        var o = [];
        for(var i=0;i<urlsA.length;i++){
            
            var oo = {};
            oo["value"] = urlsA[i];
            if(oo.value.indexOf("#")==0){
                oo.value=oo.value.substring(1,oo.value.length);
            }
            oo["name"] = urlsDisplayA[i] ? urlsDisplayA[i].trim() : urlsA[i];
            
            o.push(oo);
        }
        data["trendingTags"] = o;
     
    } else {
        data["trendingTags"] = [];
    }
    return data;
    
   
    

};

function processHeaderCategoryUrls(rdm,data){
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        switch(key) {
            case "header_links_category" : 
                data["top_header_categories"] = rdm.getRDMProperty(id,"value");
                console.log("got header link cateogries \n\n---");
                break;
            case "top_header_sub_categories" : 
                data["top_header_sub_categories"] = rdm.getRDMProperty(id,"value");
                
                break;
            
            case "footer_links_category" : 
                data["bottom_footer_categories"] = rdm.getRDMProperty(id,"value");
                break;
        }
    }
     
    return data;
}

function processHomePageUrlsData(rdm,data){
     var homePageUrls,homePageUrlsLangs,homePageUrlsSeoTitle,homePageUrlsSeoDescription,homePageUrlsSeoKeywords;
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        
        switch(key) {
            case "homepage_urls" : 
                homePageUrls = rdm.getRDMProperty(id,"value");
                // if(!homePageUrls) {
                //     homePageUrls = "/";
                // }
                break;
            case "homepage_urls_langs" : 
                homePageUrlsLangs = rdm.getRDMProperty(id,"value");
                break;
            case "homepage_urls_seo_title" : 
                homePageUrlsSeoTitle = rdm.getRDMProperty(id,"value");
                break;
            case "homepage_urls_seo_description" : 
                homePageUrlsSeoDescription = rdm.getRDMProperty(id,"value");
                break;
            case "homepage_urls_seo_keywords" : 
                homePageUrlsSeoKeywords = rdm.getRDMProperty(id,"value");
                break;
        }
    }
    if(!homePageUrls || homePageUrls=="null"){
        var partner = rdm.getRDMAttribute("partner");
        data["homePageUrls"] = {};
        var oo = {};
        oo.url = "/";
        oo.lang = partnerConfig[partner].langs[0];
        oo["title"] = partner;
        oo["description"] = partner;
        oo['keywords'] = partner;
        data["homePageUrls"]["/"] = oo;
        data["homePageRoot"] = "/";
        
        return data;
    }
    var urlsA = homePageUrls.split(",");
    var urlsLangsA = homePageUrlsLangs ? homePageUrlsLangs.split(",") : [];
    var urlsTitlesA = homePageUrlsSeoTitle ? homePageUrlsSeoTitle.split("##$$") : [];
    var urlsDescA = homePageUrlsSeoDescription ? homePageUrlsSeoDescription.split("##$$") : [];
    var urlsKeywordsA = homePageUrlsSeoKeywords ? homePageUrlsSeoKeywords.split("##$$") : [];
    var o = {};
    var partner = rdm.getRDMAttribute("partner");
    for(var i=0;i<urlsA.length;i++){
        var oo = {};

        oo["url"] = urlsA[i];

        if(urlsLangsA.length >i) {
            oo["lang"] = urlsLangsA[i];
        } else {
            oo["lang"] = partnerConfig[partner].langs[0];;
        }

        if(urlsTitlesA.length >i) {
            oo["title"] = urlsTitlesA[i];
        } else {
            oo["title"] = '';
        }

        if(urlsDescA.length >i) {
            oo["description"] = urlsDescA[i];
        } else {
            oo["description"] = '';
        }

        if(urlsKeywordsA.length >i) {
            oo["keywords"] = urlsKeywordsA[i];
        } else {
            oo["keywords"] = '';
        }

        o[urlsA[i]] = oo;
        if(!data["homePageRoot"]){
            data["homePageRoot"] = urlsA[i];
        }
    }
    data["homePageUrls"] = o || [];
    return data;
     
};
function processHeaderUrls(rdm,data){
    var headerUrls,headersUrlsDisplay;
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        switch(key) {
            case "header_urls_links" : 
                headerUrls = rdm.getRDMProperty(id,"value");
                break;
            case "header_urls_display_name" : 
                headersUrlsDisplay = rdm.getRDMProperty(id,"value").trim();
                break;
            
        }
    }
    if(headerUrls && headerUrls!="null"){
        var urlsA = headerUrls.split(",");
        var urlsDisplayA = headersUrlsDisplay.split(",");
        
        var o = [];
        for(var i=0;i<urlsA.length;i++){
            
            var oo = {};
            oo["url"] = urlsA[i];
            oo["name"] = urlsDisplayA[i];
            
            o.push(oo);
        }
        data["headerLinks"] = o;
    } else {
        data["headerLinks"]  = [];
    }
    
    return data;
};
function processStaticPageUrlsData(rdm,data){
    var homePageUrls,homePageUrlsLangs,homePageUrlsSeoTitle,homePageUrlsSeoDescription,homePageUrlsSeoKeywords,templates,dataPromisses;
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        switch(key) {
            case "static_urls" : 
                homePageUrls = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_langs" : 
                homePageUrlsLangs = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_seo_title" : 
                homePageUrlsSeoTitle = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_seo_description" : 
                homePageUrlsSeoDescription = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_seo_keywords" : 
                homePageUrlsSeoKeywords = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_template" : 
                templates = rdm.getRDMProperty(id,"value");
                break;
            case "static_urls_data_promises" : 
                dataPromisses = rdm.getRDMProperty(id,"value");
                break;
        }
    }
    if(!homePageUrls || homePageUrls=="null"){
        return data;
    }
    var urlsA = homePageUrls.split(",");
    var urlsLangsA = homePageUrlsLangs ? homePageUrlsLangs.split(",") : [];
    var urlsTitlesA = homePageUrlsSeoTitle ? homePageUrlsSeoTitle.split("##$$") : [];
    var urlsDescA = homePageUrlsSeoDescription ? homePageUrlsSeoDescription.split("##$$") : [];
    var urlsKeywordsA = homePageUrlsSeoKeywords ? homePageUrlsSeoKeywords.split("##$$") : [];
    var templatesA = templates ? templates.split(",") : [];
    var promissesArray  = dataPromisses ? dataPromisses.split(",") : [];

   

    
    var o = {};

    var partner = rdm.getRDMAttribute("partner");
    for(var i=0;i<urlsA.length;i++){
        var oo = {};
        oo["url"] = urlsA[i];
  
        if(urlsLangsA.length >i) {
            oo["lang"] = urlsLangsA[i];
        } else {
            oo["lang"] = partnerConfig[partner].langs[0];;
        }

        if(urlsTitlesA.length >i) {
            oo["title"] = urlsTitlesA[i];
        } else {
            oo["title"] = '';
        }

        if(urlsDescA.length >i) {
            oo["description"] = urlsDescA[i];
        } else {
            oo["description"] = '';
        }

        if(urlsKeywordsA.length >i) {
            oo["keywords"] = urlsKeywordsA[i];
        } else {
            oo["keywords"] = '';
        }

        if(templatesA.length >i) {
            oo["template"] = templatesA[i];
        } else {
            oo["template"] = '';
        }
        if(promissesArray.length >i) {
            oo["dataPromise"] = promissesArray[i];
        } else {
            oo["dataPromise"] ="";
        }


        o[urlsA[i]] = oo;
    }
    data["staticUrls"] = o;
    return data;
};

function getPartnerPropsApi(partner){

    if(!partner){
        return;
    }
    var options = {
        rdm: apiHelper.getURL(Constants.getPartnerConfig,partner)
    };
    options.rdm.setRDMProperty("1","sendSync","true");
    if(partner){
        options.rdm.setRDMAttribute("partner",partner);
    }
    return apiHelper.get(options);
};
PartnerNotificationModel.getPartnerPropsData = function(req){
    return PartnerNotificationModel.data[req.environment.partner];
};
PartnerNotificationModel.getPartnerPropsDataByPartner = function(partner){
    return PartnerNotificationModel.data[partner];
};
PartnerNotificationModel.isHomePage = function(req){
    var env =req.environment;
    var props = PartnerNotificationModel.data[env.partner];
    var urls = props['homePageUrls'];
    
    for(var k in urls){
        if(urls[k].url.trim()==env.pathname || urls[k].url.trim()==env.pathname+"/" || urls[k].url.trim()+"/"==env.pathname){
            return true;
        }
    }
    return false;
};
PartnerNotificationModel.getHomePageUrlProps = function(req){
    var env =req.environment;
    var props = PartnerNotificationModel.data[env.partner];
    var urls = props['homePageUrls'];
    var urlProps = {};
    for(var k in urls){
        if(urls[k].url==env.pathname){
            urlProps = urls[k];
            urlProps['theme'] = props['theme'];
            break;
        }
    }
    return urlProps;
};
PartnerNotificationModel.isStaticUrl = function(req){
    var env =req.environment;
    var props = PartnerNotificationModel.data[env.partner];
    var urls = props['staticUrls'];
    
    for(var k in urls){
        if(urls[k].url==env.pathname || urls[k].url+"/"==env.pathname || urls[k].url==env.pathname+"/"){
            return true;
        }
    }
    return false;
};
PartnerNotificationModel.getStaticUrlProps = function(req){
    var env =req.environment;
    var props = PartnerNotificationModel.data[env.partner];
    var urls = props['staticUrls'];
    var urlProps = {};
    for(var k in urls){
        if(urls[k].url==env.pathname || urls[k].url+"/"==env.pathname || urls[k].url==env.pathname+"/"){
            urlProps = urls[k];
            urlProps['theme'] = props['theme'];
            break;
        }
    }
    return urlProps;
};
module.exports = PartnerNotificationModel;

