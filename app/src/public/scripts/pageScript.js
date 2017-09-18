(function() {
    "use strict";

    var PageLoader = {};
    var CURRENT_ACTIVE_PAGE = '';
    
    PageLoader.init = function(options) {
        if(!window.ga){ //return if GA is not supported
            return;
        }
        options = options || {};
        var $currentPage = $('[data-role="page"]').eq(0);
        CURRENT_ACTIVE_PAGE = options.pageType || $currentPage.data('pagetype');

        
        window.ga('set', 'dimension2', CURRENT_ACTIVE_PAGE.toUpperCase());
        window.ga('require', 'displayfeatures');
        window.ga('set', 'location', window.location.href);
        window.ga('send', 'pageview');

    };

    PageLoader.getCurrentActivePage = function() {
        return CURRENT_ACTIVE_PAGE;
    };

    Hocalwire.PageLoader = PageLoader;

})();
