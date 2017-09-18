(function() {
    "use strict";

    var PageLoader = {};
    var CURRENT_ACTIVE_PAGE = '';
    
    PageLoader.init = function(options) {
        options = options || {};
        var $currentPage = $('[data-role="page"]').eq(0);
        CURRENT_ACTIVE_PAGE = options.pageType || $currentPage.data('pagetype');

        
        window.ga('set', 'dimension2', CURRENT_ACTIVE_PAGE.toUpperCase());
        window.ga('require', 'displayfeatures');
        window.ga('set', 'location', window.location.href);
        window.ga('send', 'pageview');


        
        // check if app supports this device, otherwise hide app download buttons
        if (!deviceSupportsApp()) {
            hideAppDownloadButtons();
        } else {
            changeButtonTextAndIcons();
        }
    };

    PageLoader.getCurrentActivePage = function() {
        return CURRENT_ACTIVE_PAGE;
    };

    
    function deviceSupportsApp() {
    return isAndroidGB() || isIOS7OrGreater();
    }

    function hideAppDownloadButtons() {
        $('.js-app-download').hide();
    }

    
    function isAndroidGB() { // Is app supported >= 2.3
        try {
            var androidVersion = Hocalwire.MOBILE_DETAILS.Android;
            var versionFloatValue;

            if (androidVersion) {

                if (!isNaN(parseInt(androidVersion))) {
                    versionFloatValue = parseFloat(androidVersion.split('.').slice(0,2).join('.'));
                } else {
                    // just to ensure, this function returns true
                    versionFloatValue = 2.3;
                }
            }

            return (androidVersion && versionFloatValue >= 2.3);
        } catch(e) {
            return false;
        }
    }

    function isIOS7OrGreater() {
        try {
            var iOSVersion = Hocalwire.MOBILE_DETAILS.iOS;
            var versionFloatValue;

            if (iOSVersion) {
                versionFloatValue = parseFloat(iOSVersion.split('.').slice(0,2).join('.'));
            }

            return (iOSVersion && versionFloatValue >= 7.0);
        } catch(e) {
            return false;
        }
    }

    function changeButtonTextAndIcons() {
        var $buttons = $('.js-app-download');

        $buttons.each(function() {
            var $buttonLink = $(this).is('a') ? $(this) : $(this).find('a');

            if (Hocalwire.MOBILE_DETAILS.iOS) {
                $buttonLink.html('<i class="icon-logo-apple"></i> DOWNLOAD OUR iOS APP');
            } else {
                $buttonLink.html('<i class="icon-logo-android"></i> DOWNLOAD OUR ANDROID APP');
            }
        });

        // explicitly check for android icons and replace to iphone
        if (Hocalwire.MOBILE_DETAILS.iOS) {
            $('.icon-logo-android').removeClass('icon-logo-android').addClass('icon-apple');
            // handle menu drawer buttons individually
            $('#drawer .gora').text('App Store');
        } else {
            $('.icon-logo-apple').removeClass('icon-logo-apple').addClass('icon-logo-android');
            $('#drawer .gora').text('Play Store');
        }
    }

    function onPageLoad(fn) {
        if ($.onPageLoad) {
            $.onPageLoad(fn);
        } else {
            window.addEventListener('load', fn);
        }
    }

    

    Hocalwire.PageLoader = PageLoader;

})();
