
'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var partnerConfig = require('src/config/PartnerConfig');
var PartnerPropsModel = {};
var cacheExpireDuration = 24*60*60*1000;

PartnerPropsModel.fetch = function(partner) {
    
    return fetchPartnersProps(partner);
};
PartnerPropsModel.promises = {};
PartnerPropsModel.data = {};
PartnerPropsModel.lastFetchedTime = {};



function fetchPartnersProps(partner) {
    var currentTime = new Date().getTime();

    PartnerPropsModel.lastFetchedTime[partner] = PartnerPropsModel.lastFetchedTime[partner] || currentTime;
   
    // re-fetch in every 24 hours
    if ((currentTime - PartnerPropsModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerPropsModel.promises[partner]) {
        return PartnerPropsModel.promises[partner];
    }

    logger.info('fetching partner props'+partner);

    // change last fetch time to now
    PartnerPropsModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    PartnerPropsModel.promises[partner] = getPartnerPropsApi(partner);

        PartnerPropsModel.promises[partner].then(
            function(response){
                PartnerPropsModel.data[partner] = getPartnerPropsData(response);
                // console.log(PartnerPropsModel.data[partner]);
            },
            function(err){
                PartnerPropsModel.promises[partner] = null;
                PartnerPropsModel.data[partner] = null;
            });

    
    return PartnerPropsModel.promises[partner];
}
function getPartnerPropsData(rdm){
    var data = {};
    // console.log(data);
    data = processHomePageUrlsData(rdm,data);
    // console.log(data);
    data = processStaticPageUrlsData(rdm,data);
    // console.log(data);
    data = processOtherProps(rdm,data);
    // console.log(data);
    data = processHeaderUrls(rdm,data);
    // console.log(data);
    data = processHeaderCategoryUrls(rdm,data);
    // console.log(data);
    return data;
};
function processOtherProps(rdm,data){
    var socialUrls,socialUrlsDisplay,currentTags,currentTagsDisplay;
    
    for(var k in rdm.rdRows){
        var id = rdm.rdRows[k].id;
        var key = rdm.rdRows[k].key;
        // logger.error(key);
        key= key.trim();
        var value = rdm.getRDMProperty(id,"value") || "";
        // console.log(key);
        // console.log(key=="news_cache_millis");
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
                logger.error("232323232323232323232");
                data["extraStylePath"] = rdm.getRDMProperty(id,"value");
                logger.error("3232323232323");
                logger.error("=================\n\n\n\n\n=========================\n\n\n\n===============");
                logger.error("====================================found extra style path for partner==========="+data["extraStylePath"]);
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
            case "category_home_page_v2" : 
                data["homePageV2NewsCategory"] = rdm.getRDMProperty(id,"value");
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
                // console.log("goto next page props ========================================================\n\n\n\n===================");
                data["goto_next_page_message"] = rdm.getRDMProperty(id,"value") || "";
                if(!data["goto_next_page_message"]) {
                    data["goto_next_page_message"] = "View On Next Page";
                }
                // console.log("\n\n\n\n\n\n\n\n\n=================data['goto_next_page_message'] \n\n\n\n"+data["goto_next_page_message"]);
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
            case "cms_url" :
                console.log("================================admin page url");
                data["admin_page_url"] = rdm.getRDMProperty(id,"value") || "";
                console.log(data["admin_page_url"]);
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
            case "partner_static_data_map":
                var value = rdm.getRDMProperty(id,"value") || "";
                if(value) {
                    var a = value.split("##");
                    for(var i=0;i<a.length;i++){
                        var xx = a[i].split("=");
                        if(!data['partner_static_data_map']) {
                            data['partner_static_data_map']={};
                        }
                        data['partner_static_data_map'][xx[0]] = xx[1];
                    }
                    
                }
                break; 
            case "send_query_params_in_validate_url":
                var value = rdm.getRDMProperty(id,"value") || "";
                if(value && value=="true") {
                    data['sendQueryParamsInValidate'] = value;
                }
                break;
            case "static_redirect_urls":
                var value = rdm.getRDMProperty(id,"value") || "";
                var redirects = {};
                if(value) {
                    var a = value.split("##$$");
                    for(var i=0;i<a.length;i++){
                        var x = a[i].split("##");
                        redirects[x[0]] = x[1];
                        var endsWithSlash = false;
                        if(x[0].lastIndexOf("/")==x[0].length-1){
                            endsWithSlash = true;
                        }
                        if(endsWithSlash){
                            redirects[x[0].substring(0,x[0].length-1)] = x[1];
                        } else {
                            redirects[x[0]+"/"]=x[1];
                        }
                    }
                }
                data['static_redirect_urls'] = redirects;
                break;
            case "global_static_pages":
                var value = rdm.getRDMProperty(id,"value") || "";
                var globalPages = {};
                if(value) {
                    var a = value.split("##$$");
                    for(var i=0;i<a.length;i++){
                        var x = a[i].split("##");
                        globalPages[x[0]] = x[1];
                        var endsWithSlash = false;
                        if(x[0].lastIndexOf("/")==x[0].length-1){
                            endsWithSlash = true;
                        }
                        if(endsWithSlash){
                            globalPages[x[0].substring(0,x[0].length-1)] = x[1];
                        } else {
                            globalPages[x[0]+"/"]=x[1];
                        }
                    }
                }
                data['global_static_pages'] = globalPages;
                break;
            case "supported_urls":
                var value = rdm.getRDMProperty(id,"value") || "";
                
                if(value) {
                    data['supported_urls'] = value.split(",");
                }
                
                break;
            case "category_show_filter":
                var value = rdm.getRDMProperty(id,"value") || "";
                
                if(value) {
                    data['category_show_filter'] = value.split(",");
                }
                
                break;
            case "redirect_domain_for_unsupported_urls":
                var value = rdm.getRDMProperty(id,"value") || "";
                
                if(value) {
                    data['redirect_domain_for_unsupported_urls'] = value;
                }
                
                break;
                
            case "has_amp_page":
                var value = rdm.getRDMProperty(id,"value") || "";
                
                if(value) {
                    data['hasAMPPage'] = true;
                } else {
                    data['hasAMPPage'] = false;
                }
                
                break;
            case "do_not_show_time_in_listing":
                var value = rdm.getRDMProperty(id,"value") || "";
                
                if(value && value=="true") {
                    data['do_not_show_time_in_listing'] = true;
                } else {
                    data['do_not_show_time_in_listing'] = false;
                }
                
                break;
            case "has_web_tv":
                data['has_web_tv'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "ignore_heading_on_image_in_post_gallery":
                if(value && value=="true") {
                    data['ignore_heading_on_image_in_post_gallery'] = true;
                } else {
                    data['ignore_heading_on_image_in_post_gallery'] = false;
                }
                // console.log("=====================\n\n\n\n\n"+data['ignore_heading_on_image_in_post_gallery']+"=============\n\n\n\n");
                break;
            case "category_no_image_on_post_page":
                data['category_no_image_on_post_page'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "hide_about_author":
                data['hide_about_author'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "is_boxed_theme":
                // console.log("==================\n\n\n is bokxed theme");
                if(value && value=="true") {
                    data['is_boxed_theme'] = true;
                } else {
                    data['is_boxed_theme'] = false;
                }
                // console.log("\n\n\n\n value:"+value+" setup: "+data['is_boxed_theme']);
                break;
            case "hide_home_in_menu":
                if(value && value=="true") {
                    data['hide_home_in_menu'] = true;
                } else {
                    data['hide_home_in_menu'] = false;
                }
                break;
            case "social_share_old":
                data['social_share_old'] = rdm.getRDMProperty(id,"value") || "";
                if(value && value=="true") {
                    data['social_share_old'] = true;
                } else {
                    data['social_share_old'] = false;
                }
                break;
            case "image_page_prefix":
                data['image_page_prefix'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "image_page_query_param":
                data['image_page_query_param'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "supported_search_types" :
                data['supported_search_types'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "check_for_ad_blokers":
                data['check_for_ad_blokers'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "disable_copy_paste":
                data['disable_copy_paste'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "insert_message_in_copy_text":
                data['insert_message_in_copy_text'] = rdm.getRDMProperty(id,"value") || "";
                break;
            case "before_content_meta" : 
                data["before_content_meta"] = rdm.getRDMProperty(id,"value");
                break;
            case "after_content_meta" : 
                data["before_content_meta"] = rdm.getRDMProperty(id,"value");
                break;
            case "body_top_meta" : 
                data["body_top_meta"] = rdm.getRDMProperty(id,"value");
                break;
            case "body_bottom_meta" : 
                data["body_bottom_meta"] = rdm.getRDMProperty(id,"value");
                break;
            case "in_google_news" : 
                data["in_google_news"] = rdm.getRDMProperty(id,"value");
                break;
            case "enable_push_notification" :
                data["hasPushNoti"] = rdm.getRDMProperty(id,"value");
                break;
            case "display_user_groups" : 
                data["display_user_groups"] = rdm.getRDMProperty(id,"value");
                break;
            case "use_header_v2":
                data["use_header_v2"] = rdm.getRDMProperty(id,"value");
                break;
            case "header_align_left":
                data["header_align_left"] = rdm.getRDMProperty(id,"value");
                break;
            case "head_top_version_two":
                data["head_top_version_two"] = rdm.getRDMProperty(id,"value");
                break;
            case "enable_transliteration" : 
                data["enable_transliteration"] = rdm.getRDMProperty(id,"value");
                break;
            case "enable_page_print_option" :
                data["enable_page_print_option"] = rdm.getRDMProperty(id,"value");
                break;
            case "logo_different_url" :
                data["logo_different_url"] = rdm.getRDMProperty(id,"value");
                break;
            case "register_us_content_name" :
                data["register_us_content_name"] = rdm.getRDMProperty(id,"value");
                break;
            case "display_user_groups":
                data["display_user_groups"] = rdm.getRDMProperty(id,"value");
                if(data["display_user_groups"] && data["display_user_groups"].indexOf(",")>-1){
                    data["display_user_groups"] = data["display_user_groups"].split(",");
                } else {
                    data["display_user_groups"] = [rdm.getRDMProperty(id,"value")];
                }
                break;
            case "header_social_icon_position" :
                data["header_social_icon_position"] = rdm.getRDMProperty(id,"value");
                if(!data["header_social_icon_position"]){
                    data["header_social_icon_position"] ="right";
                }
                break;
            case "no_pretty_photo" : 
                data["no_pretty_photo"] = rdm.getRDMProperty(id,"value");
                break;
            case "use_pretty_photo" : 
                data["use_pretty_photo"] = rdm.getRDMProperty(id,"value");
                break;
            case "ignoreInsertLinkInCopy" : 
                    data["ignoreInsertLinkInCopy"] = rdm.getRDMProperty(id,"value");

                break;
            case "disable_location_settings_website":
                data["disable_location_settings_website"] = rdm.getRDMProperty(id,"value");
                break;
            case "use_common_logged_in_profile_button":
                data["use_common_logged_in_profile_button"] = rdm.getRDMProperty(id,"value");

                break;
            case "remove_location_btn":
                data["remove_location_btn"] = rdm.getRDMProperty(id,"value");

                break;
            case "user_validation_type":
                data["registration_verification_mode"] = rdm.getRDMProperty(id,"value");
                if(!data['registration_verification_mode']){
                    data['registration_verification_mode']="email";
                }
                break;   
            case "multi_font_block" : 
                data["multi_font_block"] = rdm.getRDMProperty(id,"value");
                break; 

            case "has_no_subscription_details" : 
                data["has_no_subscription_details"] = rdm.getRDMProperty(id,"value");
                break; 
                     
            case "has_pay_by_collect_cash":
                data["has_pay_by_collect_cash"] = rdm.getRDMProperty(id,"value");
                
                break;   
            case "has_pay_by_cash":
                data["has_pay_by_cash"] = rdm.getRDMProperty(id,"value");
                
                break;   
            case "has_pay_by_cheque":
                data["has_pay_by_cheque"] = rdm.getRDMProperty(id,"value");
                
                break;   
            case "has_pay_by_neft":
                data["has_pay_by_neft"] = rdm.getRDMProperty(id,"value");
                break;  
            case "has_epaper_smart_tools" : 
                data["hasEPaperSmartTools"] = rdm.getRDMProperty(id,"value");
                break;   
            case "hide_volunteer_code" : 
                data["hide_volunteer_code"] = rdm.getRDMProperty(id,"value");
                break;   
            case "insert_copy_max_count" : 
                data["insert_copy_max_count"] = rdm.getRDMProperty(id,"value");
                break;  
            case "insertPublishRightsMessage" : 
                data["insertPublishRightsMessage"] = rdm.getRDMProperty(id,"value");
                break;  
            case "use_logo_for_home" :
                data["use_logo_for_home"] = rdm.getRDMProperty(id,"value");
                break;  
            case "has_smart_share":
                data["has_smart_share"] = rdm.getRDMProperty(id,"value");
                break;  

            case "show_other_social_share" :
                data["show_other_social_share"] = rdm.getRDMProperty(id,"value");
                break;
            case "ignore_news_cache" :
                data["ignore_news_cache"] = rdm.getRDMProperty(id,"value");
                break;
            case "push_notification_logo" :
                data["pushNotificationLogo"] = rdm.getRDMProperty(id,"value");
                break;
            case "custom_rss_feed_path" :
                data["custom_rss_feed_path"] = rdm.getRDMProperty(id,"value");
                break;
            case "profileExtraInformation" :
                data["profileExtraInformation"] = rdm.getRDMProperty(id,"value");
                break;
            case "news_cache_millis" :
            case "news_cache_millis " :
                data["news_cache_millis"] = rdm.getRDMProperty(id,"value");
                break;
            case "merge_async_from_cache_templates" :
                data["merge_async_from_cache_templates"] = rdm.getRDMProperty(id,"value");
                break;
            case "allowed_social_share_handles" :
                data["allowed_social_share_handles"] = rdm.getRDMProperty(id,"value");
                data["allowed_social_share_handles"] = data["allowed_social_share_handles"].split(",");
                break;
            case "rss_prepend_image_in_story" :
                data["rss_prepend_image_in_story"] = rdm.getRDMProperty(id,"value");
                break;
            case "validate_login_redirect_page" :
                data["validate_login_redirect_page"] = rdm.getRDMProperty(id,"value");
                break;
            case "support_live" :
                data["support_live"] = rdm.getRDMProperty(id,"value");
                break;
            case "support_coupon_in_plan" :
                data["support_coupon_in_plan"] = rdm.getRDMProperty(id,"value");
                break;
            case "file_ad_units":
                console.log("================================");
                var a = rdm.getRDMProperty(id,"value").split(",");
                console.log("1111111");
                if(!data['ad_units_to_load']){
                    data['ad_units_to_load']={};
                }
                console.log("22222");
                for(var i=0;i<a.length;i++){
                    console.log("3333");
                    var aa = a[i].split("##");
                    console.log(aa);
                    console.log("444");
                    if(!data['ad_units_to_load'][aa[0]]){
                        data['ad_units_to_load'][aa[0]] = {};
                    }
                    console.log("5555");
                    if(!data['ad_units_to_load'][aa[0]][aa[1]]){
                        data['ad_units_to_load'][aa[0]][aa[1]] = {};
                    }
                    console.log("6666");
                    data['ad_units_to_load'][aa[0]][aa[1]] = aa[2];
                }
                break;
            case "enableSocialSubscribe":
                console.log("================================");
                data['enableSocialSubscribe']= rdm.getRDMProperty(id,"value");
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
    if(data["news_cache_millis"]=="0" || data["news_cache_millis"]=="false"){
        data["news_cache_millis"]=0;
    } 
    else if(!data["news_cache_millis"] || data["news_cache_millis"]=="null"){
        data["news_cache_millis"]="12000";
    }
    data['externalResourcesVersion'] = data.partner_extra_resource_version ? data.partner_extra_resource_version:1;
    if(data.partner_extra_resource_path){
        var a = data.partner_extra_resource_path ? data.partner_extra_resource_path.split(",") : null;
        data['externalResources'] = a;
    }
    if(data.partner_another_site_link){
        var hasMultipleLinks = data.partner_another_site_link.indexOf("$$$$") > -1;
        if(hasMultipleLinks){
            var arr = data.partner_another_site_link.split("$$$$");
            for(var i=0;i<arr.length;i++){
                var a = arr[i].split("##$$");
                var  o = {"name":a[0],"url":a[1]};
                if(!data.other_external_links){
                    data.other_external_links = [];
                }
                data.other_external_links.push(o);

            }
        } else {
            var a = data.partner_another_site_link.split("##$$");
            var  o = {"name":a[0],"url":a[1]};    
            data.externalSite = o;
        }
        
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
                break;
            case "header_links_category_mobile" : 
                data["top_header_categories_mobile"] = rdm.getRDMProperty(id,"value");
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
     var homePageUrls,homePageUrlsLangs,homePageUrlsSeoTitle,homePageUrlsSeoDescription,homePageUrlsSeoKeywords,homePageUrlSeoImage;
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
            case "homepage_url_seo_image" :
                homePageUrlSeoImage = rdm.getRDMProperty(id,"value");
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
    var urlsImageA = homePageUrlSeoImage ? homePageUrlSeoImage.split("##$$") : [];
    console.log("============urlsImageA");
    console.log(urlsImageA);
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
        if(urlsImageA.length >i) {
            oo["image"] = urlsImageA[i];
        } else {
            oo["image"] = '';
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
    var homePageUrls,homePageUrlsLangs,homePageUrlsSeoTitle,homePageUrlsSeoDescription,homePageUrlsSeoKeywords,homePageUrlSeoImage,templates,dataPromisses;
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
            case "static_urls_seo_image" :
                homePageUrlSeoImage = rdm.getRDMProperty(id,"value");
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
    console.log(templates);
    var urlsA = homePageUrls.split(",");
    var urlsLangsA = homePageUrlsLangs ? homePageUrlsLangs.split(",") : [];
    var urlsTitlesA = homePageUrlsSeoTitle ? homePageUrlsSeoTitle.split("##$$") : [];
    var urlsDescA = homePageUrlsSeoDescription ? homePageUrlsSeoDescription.split("##$$") : [];
    var urlsKeywordsA = homePageUrlsSeoKeywords ? homePageUrlsSeoKeywords.split("##$$") : [];
    var urlsImageA = homePageUrlSeoImage ? homePageUrlSeoImage.split("##$$") : [];
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
        console.log(urlsImageA[i]);
        if(urlsImageA.length >i) {
            oo["image"] = urlsImageA[i];
        } else {
            oo["image"] = '';
        }
        console.log(templatesA[i]);
        if(templatesA.length >i) {
            oo["template"] = templatesA[i];
        } else {
            oo["template"] = '';
        }
        console.log(3);
        if(promissesArray.length >i) {
            oo["dataPromise"] = promissesArray[i];
        } else {
            oo["dataPromise"] ="";
        }
        console.log(oo);

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

PartnerPropsModel.getPartnerPropsData = function(req){
    return PartnerPropsModel.data[req.environment.partner];
};
PartnerPropsModel.getPartnerPropsDataByPartner = function(partner){
    return PartnerPropsModel.data[partner];
};
PartnerPropsModel.isHomePage = function(req){
    var env =req.environment;
    var props = PartnerPropsModel.data[env.partner];
    var urls = props['homePageUrls'];
    
    for(var k in urls){
        if(urls[k].url.trim()==env.pathname || urls[k].url.trim()==env.pathname+"/" || urls[k].url.trim()+"/"==env.pathname){
            return true;
        }
    }
    return false;
};
PartnerPropsModel.getHomePageUrlProps = function(req){
    var env =req.environment;
    var props = PartnerPropsModel.data[env.partner];
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
PartnerPropsModel.isStaticUrl = function(req){
    var env =req.environment;
    var props = PartnerPropsModel.data[env.partner];
    var urls = props['staticUrls'];
    
    for(var k in urls){
        if(urls[k].url==env.pathname || urls[k].url+"/"==env.pathname || urls[k].url==env.pathname+"/"){
            return true;
        }
    }
    return false;
};
PartnerPropsModel.getStaticUrlProps = function(req){
    var env =req.environment;
    var props = PartnerPropsModel.data[env.partner];
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
module.exports = PartnerPropsModel;

