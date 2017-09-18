'use strict';
(function() {
    var $el;
    $.addPageInit("#news-detail-page", function() {
            $el = $("#news-detail-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
           
            bindGATrackingElements();
            // $.addPageLoad(initSliders,true);
            $.addPageLoad(newsSliders,true);
            $.addPageLoad(Utils.convertTimeToLocalTime,true);
            $.addPageLoad(Utils.bindForReportStoryDialog,true);
            $.addPageLoad(function(){
              setTimeout(function(){submitNewsRead();},1000);
            },true);
        }
    );
function submitNewsRead(){
  var fingurePrintOptions = {
    swfContainerId : "swfFingerprintContainerId",
    swfPath:"/scripts/vendor/flash/compiled/FontList.swf",
    excludeUserAgent : true,
    excludeLanguage : true,
    excludeColorDepth: false,
    excludeScreenResolution: true,
    excludeAvailableScreenResolution:true,
    excludeTimezoneOffset : false,
    excludeSessionStorage : false,
    excludeIndexedDB : false,
    excludeAddBehavior :false,
    excludeOpenDatabase : false,
    excludeCpuClass : false,
    excludePlatform : false,
    excludeDoNotTrack : false,
    excludeCanvas :false,
    excludeWebGL : false,
    excludeAdBlock :true,
    excludeHasLiedLanguages : true,
    excludeHasLiedResolution : true,
    excludeHasLiedOs :true,
    excludeHasLiedBrowser :true,
    excludeJsFonts :true,
    excludeFlashFonts :true,
    excludePlugins : true,
    excludeIEPlugins : true,
    excludeTouchSupport :true
  };
  new Fingerprint2(fingurePrintOptions).get(function(result){
    console.log(result);
    var newsId = $el.attr("data-newsid");
    var code = result;
    var data = {"code":code,"id":newsId};
    Hocalwire.Services.post("/admin/xhr/send-info",data);
  });
};
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
    //     $('.latest_postnav').newsTicker({
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
            
    }

})();