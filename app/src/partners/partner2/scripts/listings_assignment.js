'use strict';
(function() {
    var $el;
    $.addPageInit("#assignment-listings-page", function() {
            $el = $("#assignment-listings-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
           
            bindGATrackingElements();
            // $.addPageLoad(initSliders,true);
            $.addPageLoad(newsSliders,true);
            $.addPageLoad(Utils.convertTimeToLocalTime,true);

            $.addPageLoad(function(){setTimeout(function(){Utils.convertDistancePoint();},1000)},true);
            
            // $.addPageLoad(Utils.bindForReportStoryDialog,true);
            
        }
    );
function newsSliders(){


    $(".nav-tabs li a.tab-achor").on("click",function(){
        $(".tab-content .tab-pane").removeClass("active");
        $(".tab-content #"+$(this).attr("data-id")).addClass("active");

    });
    
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(100).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(100).css({'overflow':'visible'});
    

}

       
    function bindGATrackingElements() {
            $(".js-complete-assignment").on("click",function(ev){
              ev.stopPropagation();
              var id = $(this).attr("data-row-id");
              Hocalwire.Services.AnalyticsService.sendGAEvent("assignment-complete","click","assignment-"+id);
              window.open("http://user.hocalwire.com/site/dashboard.jsp?assignmentId="+id+"&campaign=website");
            });
            $(".common_assignments_list").on("click",function(ev){
              var id = $(this).attr("data-row-id");
              Hocalwire.Services.AnalyticsService.sendGAEvent("assignment-open","click","assignment-"+id);
              window.open("/assignments/"+id,"_blank");              
            });
    }

})();