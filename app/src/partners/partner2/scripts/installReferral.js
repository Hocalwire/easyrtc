'use strict';
(function() {
  var $el;
  var initializedFilter=false;
    $.addPageInit("#report-referral-page", function() {
            $el = $("#report-referral-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
           
            bindGATrackingElements();
            
           
        }
    );

    function bindGATrackingElements() {
            var referId = $el.attr("data-userid");
            Hocalwire.Services.AnalyticsService.sendGAEvent("referral-page","load","referrer-"+referId);
            $el.find("#reach-partners").on("click",function(){
              Hocalwire.Services.AnalyticsService.sendGAEvent("reach-partners","click","referrer-"+referId);
            });
            $el.find("#on-demand-report").on("click",function(){
              Hocalwire.Services.AnalyticsService.sendGAEvent("on-demand-report","click","referrer-"+referId);
            });
            $el.find("#earn-now").on("click",function(){
              Hocalwire.Services.AnalyticsService.sendGAEvent("earn-now","click","referrer-"+referId);
            });
            $el.find("#register-web").on("click",function(){
              Hocalwire.Services.AnalyticsService.sendGAEvent("register-web","click","referrer-"+referId);
            });
            $el.find("#download-app").on("click",function(){
              Hocalwire.Services.AnalyticsService.sendGAEvent("download-app","click","referrer-"+referId);
            });
            
            
            
    }
     

})();
