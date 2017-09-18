'use strict';
(function() {
  var $el;
  var initializedFilter=false;
    $.addPageInit("#home-page", function() {
            $el = $("#home-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
           
            bindGATrackingElements();
            // $.addPageLoad(initSliders,true);
            $.addPageLoad(newsSliders,true);
            $el.find(".js-select-filter").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("select-location","click","location-filter");
                showLocationFilter();    
            });
            $.addPageLoad(initSliders,true);
            $.addPageLoad(showLocationFilterOnLoad,true);
            $.addPageLoad(Utils.convertTimeToLocalTime,true);
            $.addPageLoad(Utils.bindForReportStoryDialog,true);
           
        }
    );
function newsSliders(){


       // for hover dropdown menu
      $('ul.nav li.dropdown').hover(function() {
          $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn(200);
        }, function() {
          $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut(200);
        });
      // slick slider call 
        $('.slick_slider').slick({
          dots: true,
          infinite: true,      
          speed: 800,      
          slidesToShow: 1,
          slide: 'div',
          autoplay: true,
          autoplaySpeed: 5000,
          cssEase: 'linear'
        });  

        // latest post slider call 
        $('.news_sticker').removeClass("hide");
        // $('.latest_postnav').newsTicker({
        //     row_height: 64,
        //     speed: 800,
        //     prevButton:  $('#prev-button'),
        //     nextButton:  $('#next-button')   
        // });
    $(".fancybox-buttons").fancybox({
        prevEffect    : 'none',    
        nextEffect    : 'none',
        closeBtn    : true,
        helpers   : {
          title : { type : 'inside' },
          buttons : {}
        }
      });
       // jQuery('a.gallery').colorbox();
      //Check to see if the window is top if not then display button
      $(window).scroll(function(){
        if ($(this).scrollTop() > 300) {
          $('.scrollToTop').fadeIn();
        } else {
          $('.scrollToTop').fadeOut();
        }
      });
       
     //Click event to scroll to top
      $('.scrollToTop').click(function(){
        $('html, body').animate({scrollTop : 0},800);
        return false;
      });

      // $('.tootlip').tooltip(); 
      $("ul#ticker01").liScroll(); 

      var wow = new WOW(
      {
        animateClass: 'animated',
        offset:       100
      }
    );
    $(".nav-tabs li a.tab-achor").on("click",function(){
        $(".tab-content .tab-pane").removeClass("active");
        $(".tab-content #"+$(this).attr("data-id")).addClass("active");

    });
    wow.init();
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(100).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(100).css({'overflow':'visible'});
    
}

       
    function bindGATrackingElements() {
            var $newsSection = $("#sliderSection");
            $newsSection.find(".slick_slider a").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("news-current-"+"carousel","click","news");
            });
            $newsSection.find(".more-cat-news.news-more a").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("news-current-"+"open","click","news");
            });
            $newsSection.find(".more-cat-news.pagination a").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("news-pagination","click","news");
            });

            $("#contentSection .left_content ul li a").on("click",function(){
                Hocalwire.Services.AnalyticsService.sendGAEvent("news-extra-","click","news");
            });
            
    }
      function showLocationFilterOnLoad(){
        // setTimeout(function(){
        //     var url = window.location.href;
        //     if($("body").hasClass("partner-site") || url.indexOf("point_lat")>-1){ //dont automatically load if url already has lat param
        //         return;
        //     }
        //     // Hocalwire.Services.AnalyticsService.sendGAEvent("select-location","load","page-load");
        //     // showLocationFilter();
        // },500);
        
    }
    function showLocationFilter(){
        $.openPopup("#location-selector");
        if(!initializedFilter){
            initPopupForLocationSelect();
            initializedFilter=true;
        }
          var getMyLocation = function(options){
              var _getMyLocationFail = function () {
                  _hideLoaders();
                  Utils.dialog({message:"We were unable to locate you as we do not have permission to access your location. Please enable your location and try again.", title : "Location detection disabled."});
              },

              _geoLocationNotSupported = function() {
                  _hideLoaders();
                  Utils.dialog({message: "You browser doesn't support location detection.", title : "Location detection not supported."});
              },
              _getMyLocationSuccess = function(point, options) {
                      MyMap.setMapLocation(point.coords.latitude,point.coords.longitude);
                      _hideLoaders();
              },
              
              _timeout = function () {
                  _hideLoaders();
                  Utils.dialog({message: "It's taking too long to find out your location.", title : "Request timed out." });
              },
              _hideLoaders = function () {
                  clearTimeout(Utils.timeoutId);
                  Utils.timeoutId = 0;
                  
              },
              _showLoaders = function () {
                  console.log("show loaders for location fetch")
              };

          _showLoaders();
          clearTimeout(Utils.timeoutId);
          Utils.timeoutId = setTimeout(_timeout, 10000);
          Utils.getDeviceCoordinates(_getMyLocationSuccess, _getMyLocationFail, _geoLocationNotSupported, options);
      }
      getMyLocation();
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
                      if(loc.pathname=="/"){
                        window.location.href = loc.pathname+"all-news?"+locationSection  
                      } else {
                        window.location.href = loc.pathname+"?"+locationSection
                      }
                        
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
