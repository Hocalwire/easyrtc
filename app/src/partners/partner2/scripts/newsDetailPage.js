'use strict';
(function() {
    var $el;
    $.addPageInit("#news-detail-page", function() {
            $el = $("#news-detail-page");
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            bindInView();
            bindOtherEvents();
            $.addPageLoad(Utils.convertTimeToLocalTime,true);
            
        }
    );
    function bindOtherEvents(){
        $el.find(".js-full-story").on("click",function(){
            var $this = $(this);
            if($this.attr("data-userstory")=="true"){
                $this.addClass("hide");
                $el.find(".js-short-story-detail").addClass("hide");
                $el.find(".js-full-story-detail").removeClass("hide"); 
                $el.find(".js-read-more-collapse").removeClass("hide");
                Hocalwire.Services.AnalyticsService.sendGAEvent("full-story","click","view-user-story");
            } else {
                var source = $this.attr("data-source");
                Hocalwire.Services.AnalyticsService.sendGAEvent("full-story","click","view-admin-story");
                window.open(source,"_blank");
            }
        });
        $el.find(".js-read-more-collapse").on("click",function(){
            var $this = $(this);
                $this.addClass("hide");
                $el.find(".js-short-story-detail").removeClass("hide");
                $el.find(".js-full-story-detail").addClass("hide"); 
                $el.find(".js-full-story").removeClass("hide");
                Hocalwire.Services.AnalyticsService.sendGAEvent("full-story","click","collapse-user-story");
        });
    };
    function bindInView(){
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
        $.addPageLoad(function(){  // run only after page load
           checkForOwlCarouselLoad();
            
        },true);
        
    };
    function checkForOwlCarouselLoad(){
        setTimeout(function(){
            if($("#news-detail-carousel").owlCarousel){
                initOwlCarousel();
            } else {
                checkForOwlCarouselLoad();
            }    
        },1000);
        
    }
    function initOwlCarousel(){
        $("#news-detail-carousel").owlCarousel({
            navigation : true,
            slideSpeed : 300,
            paginationSpeed : 400,
            autoPlay : true,
            singleItem:true,
            lazyLoad : true
        });
    }

})();