(function() {
    
    function insertTemplateOnLoad(){
        var pageType = window.trackingPageType;
        var hasLogin = window.hasLogin;
        var isLoggedIn = window.isLoggedIn;
        if(hasLogin =='true') {
            if(isLoggedIn =='false' && (pageType == 'home' || pageType == 'news_listing' || pageType == 'news_details')) {
                var $dialog = $('#headerSlider');
                if($dialog) {
                    $dialog.slideDown();
                    setTimeout(function(){
                        $dialog.slideUp();
                    },5000);
                }
            } 
            if(isLoggedIn == 'true') {
                $(".header_static_links").each(function() {
                    var href = $(this).attr('href');
                    if(href == '/login') {
                        $(this).attr('href',"");
                        $(this).html("Logged in as: "+window.loggedInAs);
                    }
                });
                
            }
        }
        

    }
    if(window.addEventListener){
            window.addEventListener('load', function() {
                insertTemplateOnLoad();
            });
        } else {
            window.attachEvent('load', function() {
               insertTemplateOnLoad();
            });
            
        }
})();

