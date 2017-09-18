// Ajaxify
// v1.0.1 - 30 September, 2012
// https://github.com/browserstate/ajaxify
(function(window,undefined){

    // Prepare our Variables
    var
        History = window.History,
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
            activeClass = 'active selected current youarehere',
            activeSelector = '.active,.selected,.current,.youarehere',
            menuChildrenSelector = '> li,> ul > li',
            completedEventName = 'pageinit',
            hidePageEventName = 'pagehide',
            pageSelector = "[data-role='page']",
            popupSelector = "#page-popup-container [data-role='popup']",
            pageInitCaptured = false,
            /* Application Generic Variables */
            $window = $(window),
            $body,
            rootUrl = History.getRootUrl(),
            scrollOptions = {
                duration: 800,
                easing:'swing'
            },
            scriptToLoadCount,
            globalTokenId = 0;


        function getLoadToken() {
            return ++globalTokenId;
        }

        function currentTokenId() {
            return globalTokenId;
        }

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

        function setScriptLoadCount(count) {
            scriptToLoadCount = count;
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
        // Internal Helper
        // $.expr[':'].internal = function(obj, index, meta, stack){
        //  // Prepare
        //  var
        //      $this = $(obj),
        //      url = $this.attr('href')||'',
        //      isInternalLink;

        //  // Check link
        //  isInternalLink = url.substring(0,rootUrl.length) === rootUrl || url.indexOf(':') === -1;

        //  // Ignore or Keep
        //  return isInternalLink;
        // };

        // HTML Helper
        var documentHtml = function(html){
            // Prepare
            var result = String(html)
                .replace(/<\!DOCTYPE[^>]*>/i, '')
                .replace(/<(html|head|body|title|meta|script)([\s\>])/gi,'<div class="document-$1"$2')
                .replace(/<\/(html|head|body|title|meta|script)\>/gi,'</div>')
            ;

            // Return
            return $.trim(result);
        };

        // Ajaxify Helper
        $.fn.ajaxify = function(){
            // Prepare
            var $this = $(this);

            // Ajaxify
            $this.find('a:not(.no-ajaxy)').filter(function() {
                // Prepare
                var
                    $this = $(this),
                    url = $this.attr('href')||'',
                    isInternalLink;

                // Check link
                isInternalLink = url.substring(0,rootUrl.length) === rootUrl || url.indexOf(':') === -1;

                // Ignore or Keep
                return isInternalLink;
            }).click(function(event){
                // Prepare
                var
                    $this = $(this),
                    url = $this.attr('href'),
                    title = $this.attr('title')||null;

                // Continue as normal for cmd clicks etc
                if ( event.which == 2 || event.metaKey ) { return true; }

                // save scroll position in current state in history
                var currentState = History.getState();

                var stateData = {
                  scrollTopPosition: $(window).scrollTop()
                };

                selfStateChange = true;
                History.replaceState(stateData, currentState.title, currentState.url);

                // Ajaxify this link
                loadPage(History.getFullUrl(url));
                event.preventDefault();
                return false;
            });

            // Chain
            return $this;
        };

        $.loadPage = function(url, options) {
            // save scroll position in current state in history
            var currentState = History.getState();

            var stateData = {
              scrollTopPosition: $(window).scrollTop()
            };

            selfStateChange = true;
            History.replaceState(stateData, currentState.title, currentState.url);

            loadPage(url, options);
        };

        // $.loadPageContent = loadPageContent;
        // Ajaxify our Internal Links
        if(!$body){

             $body= $("body");
        }
        // Ensure Content
        if ( $content.length === 0 ) {
            $content = $body;
        }
        $body.ajaxify();

        // Hook into State Changes
        $window.bind('statechange anchorchange', function(e) {
            // Fix for Hash Change in URL (pop-up implementation)
            if (e.type === "anchorchange") {
                var currentStateUrl = History.getShortUrl(History.getState().url).replace(/\/?#[^#]+$/, '').replace(/\/$/, '');
                var currentPageUrl = window.location.pathname.replace(/\/$/, '') + window.location.search;
                if (decodeURIComponent(currentStateUrl) === decodeURIComponent(currentPageUrl)) {
                    // only hash gets change
                    // no need to refresh
                    return;
                }
            }

            // if state changed by ajaxify itself, don't do anything
            if (selfStateChange) {
                selfStateChange = false;
                return;
            }

            // load the current url state
            var State = History.getState();
            var url = State.url;
            var options = State.data || {};
            options.selfStateChange = false;
            loadPage(url, options);
        }); // end onStateChange

        function loadPage(url, options) {
            var $contentStyles = $('#content-styles'),
                $contentScripts = $('#content-scripts');

            // Prepare Variables
            // var State = History.getState();
            // var url = State.url;
            var relativeUrl = url.replace(rootUrl,'');
            var $content = $('#content');

            // Set Loading
            $body.addClass('loading');

            // Start Fade Out
            // Animating to opacity to 0 still keeps the element's height intact
            // Which prevents that annoying pop bang issue when loading in new content
            // $content.animate({opacity:0},800);

            showLoading();

            var requestTokenId = getLoadToken();

            // Ajax Request the Traditional Page

            $.ajax({
                url: url,
                // cache:false,
                success: function(data, textStatus, jqXHR){
                    if (requestTokenId !== currentTokenId()) return;
                    // Prepare
                    var
                        $data = $(documentHtml(data)),
                        $dataBody = $data.find('.document-body').eq(0),
                        $drawer,
                        $header,
                        $dataContent,
                        contentHtml, $scripts, $styles,scriptsFilesCount=0;

                    $drawer = $data.find('#drawer');
                    $header = $data.find('#main-header');

                    $dataContent = $data.find('#content').eq(0);

                    if (!$dataContent.length) {
                        $dataContent = $data;
                    }

                    // Fetch the styles
                    $styles = $data.find('#content-styles style');
                    if ( $styles.length ) {
                        $styles.detach();
                    }


                    $scripts = [];

                    $.each($data, function(d, e) {
                        if ($(e).is('.document-script') && $(e).attr('pagescript') === "true") {
                            $scripts.push(e);
                            if(!($(e).attr('pagescript-inline')==="true")){
                                scriptsFilesCount++;
                            }
                        };
                    })

                    if ( $scripts.length ) {
                        for(var i=0;i<$scripts.length;i++){
                            $($scripts[i]).detach();
                        }
                        // $scripts.detach();
                    }

                    // Fetch the content
                    // contentHtml = $dataContent[0].outerHTML;
                    if ( !$dataContent.length ) {
                        document.location.href = url;
                        return false;
                    }

                    // Update the content
                    if ($.fn.stop) {
                        $content.stop(true,true);
                    }

                    // $content.animate({opacity: 0}, 100, function() {
                        firePageHide();
                        hideLoading();

                        $content.empty();
                        $contentStyles.empty();
                        $contentScripts.empty();

                        // Add the styles
                        $styles.each(function(){
                            var $style = $(this), styleText = $style.text(), styleNode = $('<style>').attr('type', 'text/css')[0];
                                styleNode.appendChild(document.createTextNode(styleText));
                              $contentStyles.append(styleNode);
                        });

                        var $popup = $data.find(popupSelector);
                        if($header.length){
                            if ($header.html()) {
                                $('#main-header').empty().append($header.html()).removeClass('hide').ajaxify();
                               
                            } else {
                                $('#main-header').addClass('hide');
                               
                            }    
                        }
                        

                        $('#content').append($dataContent.html()).ajaxify(); /* you could fade in here if you'd like */
                        var $popupOverlay = $('#page-popup-container').find('.popup-overlay');
                        $('#page-popup-container').empty().append($popupOverlay).append($popup).ajaxify();
                        $('title').text($dataContent.attr('data-title'));
                        $.closeAllPopups();
                        

                        setScriptLoadCount(scriptsFilesCount);//scriptsFilesCount
                        // Add the scripts
                        for(var i=0;i<$scripts.length;i++){
                            var $script = $($scripts[i]), scriptText = $script.text(), scriptNode = document.createElement('script');
                            if ( $script.attr('src') ) {
                                if ( !$script[0].async ) { scriptNode.async = false; }
                                scriptNode.src = $script.attr('src');
                            }
                            scriptNode.onload = checkAndFirePageInit;
                            scriptNode.appendChild(document.createTextNode(scriptText));
                            $contentScripts.append(scriptNode);
                            document.getElementsByTagName('head')[0].appendChild(scriptNode);
                        }



                        if (!$scripts.length) {
                            firePageInit();
                            firePageLoadStackFn();
                        }

                    // });

                    // Update the title
                    var title = $data.find('.document-title').first().text() || document.title;
                   
                    if (options && typeof options.selfStateChange !== "undefined") {
                        selfStateChange = options.selfStateChange;

                        var stateData = History.getState().data;
                        setTimeout(function() {
                            if (stateData && stateData.scrollTopPosition) {
                                window.scrollTo(0, stateData.scrollTopPosition);
                            } else {
                                scrollToTop();
                            }
                        }, 100);

                    } else {
                        selfStateChange = true;
                        if (options && options.stateType === 'replace') {
                          History.replaceState(null,title,url);
                        } else {
                          History.pushState(null,title,url);
                        }

                        setTimeout(function() {
                            scrollToTop();
                        }, 100);
                    }


                    $body.removeClass('loading');



                    // Inform ReInvigorate of a state change
                    if ( typeof window.reinvigorate !== 'undefined' && typeof window.reinvigorate.ajax_track !== 'undefined' ) {
                        reinvigorate.ajax_track(url);
                        // ^ we use the full url here as that is what reinvigorate supports
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    // Update the content
                    if ($.fn.stop) {
                        $content.stop(true,true);
                    }
                    $content.css('opacity',100).show(); /* you could fade in here if you'd like */
                    $body.removeClass('loading');
                    showAjaxLoadingError();
                    // document.location.href = url;
                    return false;
                }
            }); // end ajax

        }

        if (History.getState().url.indexOf('#./') !== -1) {
            // $window.trigger('statechange');
            loadPage(History.getHash());
        } else {
            firePageInit();
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
