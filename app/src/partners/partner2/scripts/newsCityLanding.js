'use strict';
(function() {
    var $el;
    var city;
    $.addPageInit("#news-landing-page", function() {
            $el = $("#news-landing-page");
            city = $el.attr("data-city");
            Hocalwire.Services.AnalyticsService.sendGAEvent("download-app-landing-"+city,"load","page");
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            $.addPageLoad(Utils.convertTimeToLocalTime,true);
            bindTrackingEvents();
            $(".js-sing-up-btn").addClass("hide");
            
        }
    );
    
    
    function bindTrackingEvents(){

        $el.find(".js-navbar").on("click",function(){
            var subheading = "Download Hocalwire App to explore power of crowd source journalism";
            var heading = "Download Hocalwire App";
            openPopup(heading,subheading,"navbar","download","header");
        });
        $el.find(".js-brand-img").on("click",function(){
            var subheading = "Download Hocalwire App to explore power of crowd source journalism";
            var heading = "Download Hocalwire App";
            openPopup(heading,subheading,"navbar","download","brand-img");
        });
        $el.find(".js-page-heading").on("click",function(){
            var subheading = "Download Hocalwire App to explore power of crowd source journalism";
            var heading = "Download Hocalwire App";
            openPopup(heading,subheading,"navbar","download","heading");
        });
        
        $el.find(".js-android-app-btn").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("download-app-landing-"+city,"clicked","download-android-features");
        });
        $el.find(".js-ios-app-btn").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("download-app-landing-"+city,"clicked","download-ios-features");
        });


        $el.find(".js-download-app-top-listing").on("click",function(){
            var subheading = "Download Hocalwire App to read full news";
            var heading = "Read Full News";
            openPopup(heading,subheading,"top-story","full-news","button");
        });
        $el.find(".top-article-img").on("click",function(){
            var subheading = "Download Hocalwire App to read full news";
            var heading = "Read Full News";
            openPopup(heading,subheading,"top-story","full-news","img");
        });
        $el.find(".js-read-all-more-news").on("click",function(){
            var subheading = "Download Hocalwire App to read "+$(this).attr("data-count")+" more news";
            var heading = "Read "+ $(this).attr("data-count")+" More News"
            openPopup(heading,subheading,"top-story","all-news","btn");
        });
        $el.find(".js-feature-bookmark").on("click",function(){
            var subheading = "Download Hocalwire App to bookmark news for followup";
            var heading = "Bookmark & Followup News";
            openPopup(heading,subheading,"features","app","bookmark");
        });
        $el.find(".js-feature-comment").on("click",function(){
            var subheading = "Download Hocalwire App to comment on news";
            var heading = "Comment on News";
            openPopup(heading,subheading,"features","app","comment");
        });
        $el.find(".js-feature-add-more").on("click",function(){
            var subheading = "Download Hocalwire App to get news updated";
            var heading = "Update News";
            openPopup(heading,subheading,"features","app","add-more");
        });
        $el.find(".js-feature-report").on("click",function(){
            var subheading = "Download Hocalwire App to report news around you";
            var heading = "Report News";
            openPopup(heading,subheading,"features","app","report-news");
        });
        $el.find(".js-feature-earn").on("click",function(){
            var subheading = "Download Hocalwire App earn by publishing news";
            var heading = "Earn by Reporting";
            openPopup(heading,subheading,"features","app","earn");
        });
        $el.find(".js-feature-view-map").on("click",function(){
            var subheading = "Download Hocalwire App to view news on map";
            var heading = "View News on Map";
            openPopup(heading,subheading,"features","app","view-on-map");
        });
        $el.find(".js-feature-interstitial").on("click",function(){
            var subheading = "Download Hocalwire App to explore power of crowd source journalism";
            var heading = "Download Hocalwire App";
            openPopup(heading,subheading,"features","app","interstitial");
        });

        $el.find(".js-download-app-bottom-listing").on("click",function(){
            var subheading = "Download Hocalwire App to read this news";
            var heading = "Read News";
            openPopup(heading,subheading,"bottom-story","read-news","grid");
        }); 
        $el.find(".js-read-all-bottom-news").on("click",function(){
            var subheading = "Download Hocalwire App to read all news";
            var heading = "Read All News";
            openPopup(heading,subheading,"bottom-story","read-news","all");
        });  
        $("#download-now").on("click",function(){
            downloadApp();
        }); 
    }
    function openPopup(heading,subheading,location,purpose,label){
        Hocalwire.Services.AnalyticsService.sendGAEvent("download-app-landing-"+city,"open-popup",location+"-"+purpose+"-"+label);
        var $popup = $("#download-app");
        $popup.find(".popup-heading").html(subheading);
        $popup.find(".popup-heading-top-span").html(heading);
        $.openPopup("#download-app");
    }
    function downloadApp(){
        var downloadurl = $el.attr("data-downloadurl");
        Hocalwire.Services.AnalyticsService.sendGAEvent("download-app-landing-"+city,"clicked","download-app-popup");
        window.open(downloadurl);
    }

})();