'use strict';
(function() {
    var $el;
    var initializedFilter=false;
    $.addPageInit("#news-listing-page", function() {
            $el = $("#news-listing-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            $el.find(".continue-reading").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("read-full-news","click","full-news"+$(this).attr("href"));
            });
            $el.find(".js-select-filter").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("select-location","click","location-filter");
                showLocationFilter();    
            });
            $.addPageLoad(initSliders,true);
            $.addPageLoad(showLocationFilterOnLoad,true);
        }
    );
    function showLocationFilterOnLoad(){
        setTimeout(function(){
            var url = window.location.href;
            if($("body").hasClass("partner-site") || url.indexOf("point_lat")>-1){ //dont automatically load if url already has lat param
                return;
            }
            Hocalwire.Services.AnalyticsService.sendGAEvent("select-location","load","page-load");
            showLocationFilter();
        },500);
        
    }
    function showLocationFilter(){
        $.openPopup("#location-selector");
        if(!initializedFilter){
            initPopupForLocationSelect();
            initializedFilter=true;
        }
    };
    
    function initSliders(){
           //Initialize header slider.
        var images = $el.find(".listing-image");
        Utils.registerLoadOnVisible(images,function(elem){
            Utils.lazyLoadImage(elem);
        },true);
        Utils.convertTimeToLocalTime();

        
    };
    function initPopupForLocationSelect(){
        var displayChange = function(index) {
            $(".distance-selected").html(index);
        }
        var slider = new MySlider();
        slider.createSlider("range_slider",displayChange);
        //init map
        var lat = $el.attr("data-point_lat");
        var lng = $el.attr("data-point_long");
        if(lat && lng){
            MyMap.loadMap($("#map-container"),lat,lng);
        } else {
            MyMap.loadMap($("#map-container"),null,null);
        }
        
        $(".js-fetch-news").on("click",function(){
            var lat = MyMap.lat;
            var lng = MyMap.lng;
            var address = MyMap.address;
            var radius = $(".distance-selected").html();
            if(lat && lng && radius){
                Hocalwire.Services.AnalyticsService.sendGAEvent("fetch-news","click","personalized"+MyMap.address);
                var callback = function(){
                    var loc = Utils.getLocation();
                    var locationSection = "point_lat="+lat+"&point_long="+lng+"&radius="+radius+"&address="+address;   
                    if(loc.pathname){
                        window.location.href = loc.pathname+"?"+locationSection
                    } else {
                        if(window.location.href.indexOf("?")>-1){
                            window.location.href = window.location.href+"&"+locationSection
                        } else {
                            window.location.href = window.location.href+"?"+locationSection
                        }
                    }
                };
                $.hidePopup(callback);

            } else {
                Utils.dialog({message: "Can not apply filter", title : "Error in Apply" });
            }
        });
    };
    
})();