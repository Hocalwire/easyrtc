'use strict';
(function() {
    var $el;
    $.addPageInit("#blog-detail-page", function() {
            $el = $("#blog-detail-page");
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            $.addPageLoad(Utils.convertTimeToLocalTime,true);
            
        }
    );
   
})();