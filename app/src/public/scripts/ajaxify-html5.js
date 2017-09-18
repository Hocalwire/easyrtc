// Ajaxify
// v1.0.1 - 30 September, 2012
// https://github.com/browserstate/ajaxify
(function(window,undefined){

    // Prepare our Variables
    var
        
        $ = window.jQuery,
        document = window.document;

    // Check to see if History.js is enabled for our Browser
    // if ( !History.enabled ) {
    //  return false;
    // }

    var isDocumentReady = false;
    var firePageInitOnLoad = false;
    var selfStateChange = false;
    var pageLoaded = false;
    var pageLoadFnQueue = [];
    var pageOnLoadFnStack = [];

    $.onPageLoad = function(fn) {
        if (pageLoaded && typeof fn === "function") {
            fn();
        } else {
            pageLoadFnQueue.push(fn);
        }
    };

    $.addPageInit = function(pageId, fn) {
        if ($(pageId).length) {
            fn();
        }
        // $(document).on("pageinit", pageId, fn);

        if (isDocumentReady) {
            firePageInitOnLoad = true;
        }
    };

    $.addPageLoad = function(fn,oneTimeTrigger) {
        if(pageLoaded){
            fn();
            if(!oneTimeTrigger){
                var  o = {};
                o['fn'] = fn;
                o['oneTimeTrigger'] = oneTimeTrigger;
                pageOnLoadFnStack.push(o);
            }
        } else {
            var  o = {};
            o['fn'] = fn;
            o['oneTimeTrigger'] = oneTimeTrigger;
            pageOnLoadFnStack.push(o);
        }
    };

    $.addPageHide = function(pageId, fn) {
        $(document).on("pagehide", pageId, fn);
    };

    $.pushState = function(url, title) {
        title = title || document.title;
        selfStateChange = true;
        History.pushState(null, title, url);
    }

    // Wait for Document
    $(function(){
        // Prepare Variables
        var
            /* Application Specific Variables */
            contentSelector = '#content',
            $content = $(contentSelector).eq(0),
            contentNode = $content.get(0),
            completedEventName = 'pageinit',
            hidePageEventName = 'pagehide',
            pageSelector = "[data-role='page']",
            popupSelector = "#page-popup-container [data-role='popup']",
            pageInitCaptured = false,
            /* Application Generic Variables */
            $window = $(window),
            $body,
            
            scrollOptions = {
                duration: 800,
                easing:'swing'
            },
            scriptToLoadCount,
            globalTokenId = 0;



        function checkAndFirePageInit(t) {
            --scriptToLoadCount;
            if (scriptToLoadCount <= 0) {
                firePageInit();
                firePageLoadStackFn();
            }
        }

        function firePageInit() {
            $content.find(pageSelector).eq(0).trigger(completedEventName);
        }

        function firePageHide() {
            $content.find(pageSelector).eq(0).trigger(hidePageEventName);
        }

       
        function firePageLoadStackFn(){
            if(pageOnLoadFnStack.length > 0){
                var nonRemovalFnStack = [];
                while(pageOnLoadFnStack.length > 0){
                    var o = pageOnLoadFnStack.pop();
                    o.fn();
                    if(!o.oneTimeTrigger){ //if not a one time trigger, push in queue again
                        nonRemovalFnStack.push(o);
                    }
                }
                for(var i=0;i<nonRemovalFnStack.length;i++){ //copy back all function which needs to be executed all the time page loads (mainly from client utils)
                    pageOnLoadFnStack.push(nonRemovalFnStack[i]);
                }
                nonRemovalFnStack = null;//clear array
            } else {
                return;
            }
        }
      
       
 

        if(window.addEventListener){
            window.addEventListener('load', function() {
                var i;
                pageLoaded = true;

                if (firePageInitOnLoad) {
                    firePageInit();
                }

                for (i = 0; i < pageLoadFnQueue.length; i++) {
                    if (typeof pageLoadFnQueue[i] === "function") {
                        pageLoadFnQueue[i]();
                    }
                }
                firePageLoadStackFn();
            });
        } else {
            window.attachEvent('load', function() {
                var i;
                pageLoaded = true;

                if (firePageInitOnLoad) {
                    firePageInit();
                }

                for (i = 0; i < pageLoadFnQueue.length; i++) {
                    if (typeof pageLoadFnQueue[i] === "function") {
                        pageLoadFnQueue[i]();
                    }
                }
                firePageLoadStackFn();
            });
            
        }
        

        isDocumentReady = true;
    }); // end onDomLoad

})(window); // end closure
