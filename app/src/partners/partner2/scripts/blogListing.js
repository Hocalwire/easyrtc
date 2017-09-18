'use strict';
(function() {
    var $el;
    var initializedFilter=false;
    $.addPageInit("#blog-listing-page", function() {
            $el = $("#blog-listing-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            $el.find(".continue-reading").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("read-full-news","click","full-news"+$(this).attr("href"));
            });
            $.addPageLoad(initSliders,true);
            // $.addPageLoad(initPopupForLocationSelect,true);
        }
    );
    function initSliders(){
           //Initialize header slider.
        var images = $el.find(".listing-image");
        Utils.registerLoadOnVisible(images,function(elem){
            Utils.lazyLoadImage(elem);
        },true);
        Utils.convertTimeToLocalTime();

        
    };
    
})();