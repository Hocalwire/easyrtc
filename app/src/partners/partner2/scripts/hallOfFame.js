'use strict';
(function() {
    $.addPageInit("#hallf-of-fame-page", function() {
            var $el = $("#hallf-of-fame-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            // initSliders();
            bindInView();
            
            bindGATrackingElements();
            $.addPageLoad(initSliders,true);
        }
    );

    function bindInView(){
        $("#send-mail").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("contactus","submit","mail");
            sendMail();
        });
       
        $('.thumbnail').one('inview', function (event, visible) {
            if (visible == true) {
                $(this).addClass("animated fadeInDown");
            } else {
                $(this).removeClass("animated fadeInDown");
            }
        });

        //Animate triangles
        $('.triangle').bind('inview', function (event, visible) {
            if (visible == true) {
                $(this).addClass("animated fadeInDown");
            } else {
                $(this).removeClass("animated fadeInDown");
            }
        });
        
        
    };
       
    function initSliders(){
           //Initialize header slider.
        var images = $(".section img");
        Utils.registerLoadOnVisible(images,function(elem){
            Utils.lazyLoadImage(elem);
        },true);
        // $('#da-slider').cslider();

        
    };

    function bindGATrackingElements() {
        $("#send-mail").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("contactus","submit","send-message");
            sendMail();
        });

        /******* Navigation ******/
        $(".js-nav-home").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","home");
        });
        $(".js-nav-whyus").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","whyus");
        });
        
        $(".js-nav-reviews").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","reviews");
        });
        
    }

})();