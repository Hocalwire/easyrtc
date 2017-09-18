(function() {
    window.insertLoadTriggered = false;
    var $content = $("#content");
    window.loadOnVisibleElements = {};
    var newsId = $content.attr("data-newsid");
    var logEnabled = $content.attr("data-logging-enabled");
    var path = $content.attr("data-path");
    var id = $content.attr("request-id");
    var scrolledOnce=false;
    var scrolledDistance=200;
    window.isScrolledIntoView = function (elem,ignoreVisibility,headsUpHeight)
    {
        if(!ignoreVisibility && !elem.is(":visible")){
            return false;
        }
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();

        var elemTop = $(elem).offset().top;
        if(headsUpHeight){
            elemTop = elemTop-headsUpHeight;
        }
        var elemBottom = elemTop + $(elem).height();
        if(((elemBottom <= docViewBottom) && (elemTop >= docViewTop))){
            var result = {"top":(elemTop-docViewTop),"bottom":(docViewBottom-elemBottom)};
        } else {
            result=false
        }
        
        return result;
    }

    function runCurrentTimeTimer(){
        var now = new Date().getTime();
        
        var isDateTime=false;
        if($(".todays-date-time").hasClass("date-and-time")){
            isDateTime=true;
        }
        var c  = Utils.getFormatedIMDateTimeFromMillis(now,false,(isDateTime ? false : true));
        $(".todays-date-time").html(c);
        setTimeout(function(){runCurrentTimeTimer();},1000);
    }
    function addGAEvents(){
        var initTime = new Date().getTime();
        $(document).on("scroll",function(event){
                var currentScroll = $(window).scrollTop();
                var t = new Date().getTime();
                if(!scrolledOnce && currentScroll > scrolledDistance && (t-initTime)>(20*1000)){ //scrolling page and spent 20 secs atleast
                    scrolledOnce=true;
                    Hocalwire.Services.AnalyticsService.sendGAEvent("document","scroll","page");
                }
            });
        
        $("body").on("click",'a[target="_blank"]',function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("external","click","link");
        });
    };
    runCurrentTimeTimer();
    addGAEvents();
    if(logEnabled && newsId){
        logDetails("sentGA",path,id);
    }
    function logDetails(type,path,id){
        return;
        var data = {"url":path,"type":type,"requestId":id};
        var referer = $("#content").attr("data-referer");
        if(referer){
            data.referer=referer
        }    else {
            data.referer="";
        }
        if(window.navigator && window.navigator.userAgent){
            data["user agent"] = window.navigator.userAgent;
        }
        var success = function(){
            console.log("logged");
        }
        var fail = function(){
           console.log("failed logging");
        }
               
        Hocalwire.Services.post("/xhr/admin/logDetails",data)
            .then(function() {
                success();
            },
            function() { 
                fail();
            }
        );
        
    }
    function loadCodes(){
        var loadGTMCode = function(w,d,s,l,i){
             w[l]=w[l]||[];
            w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
            j.async=true;
            j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        };
        var loadFBCode = function(d, s, id,key){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5&appId="+key;
            fjs.parentNode.insertBefore(js, fjs);
        };
        var loadTwitter = function(){
            window.twitterWidgetLoaded=false;
            window.twttr = (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0],
                t = window.twttr || {};
              if (d.getElementById(id)) return;
              js = d.createElement(s);
              t._e = [];
              t.ready = function(f) {
                t._e.push(f);
                var event = new CustomEvent("TWITTER_LOADED", { "detail": "ALL TWITTER DEPENDENCIES LOADED" });
                document.dispatchEvent(event);
                window.twitterWidgetLoaded=true;
                
              };
              js.id = id;
              js.src = "https://platform.twitter.com/widgets.js";
              fjs.parentNode.insertBefore(js, fjs);

              

              return t;
            }(document, "script", "twitter-wjs"));
            loadTimelineForTwitter();
        };
        var loadPiwik = function(d){
            var _paq = _paq || [];
            _paq.push(["setDocumentTitle", d.domain + "/" + d.title]);
            _paq.push(["setCookieDomain", window.PIWIKCOOKIEDOMAIN]);
            _paq.push(["setDomains", window.PIWIKDOMAINS]);
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
                var u="/analytics/";
                _paq.push(['setTrackerUrl', u+'piwik.php']);
                _paq.push(['setSiteId', window.PIWIKCODE]);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
            })();
        };
        if(window.GTMCODE){
            loadGTMCode(window,document,'script','dataLayer',window.GTMCODE);
        }
        if(window.FBCODE){
            loadFBCode(document, 'script', 'facebook-jssdk',window.FBCODE);
        }
        if(window.PIWIKCODE){
            loadPiwik(document);
        }
        loadTwitter();

    };
    function loadTimelineForTwitter(){
        if(window.twttr && window.twttr.widgets){
            if(typeof loadTimeline !="undefined" && typeof loadTimeline=="function"){
                loadTimeline();
            }
        } else {
            setTimeout(loadTimelineForTwitter,1000);
        }
    }
    function loadPageCSS(callbackfn){

        if(window.pagecss && window.pagecss.length){
            for(var i=0;i<window.pagecss.length;i++){
                if(!window.pagecss[i]){
                    window.pagecss.splice(i, 1);
                    i--;
                }
            }
            Utils.loadScripts(window.pagecss,{version : 1, callback: function(){
                
                callbackfn();
            }});
        } else {
            
            callbackfn();
        }  
    }
    function loadExternalScripts(){
        if(window.externalResources){
            if(typeof window.externalResources==="string"){
                window.externalResources = window.externalResources.split(",");
            }
            var version = window.externalResourcesVersion ? window.externalResourcesVersion : 1;
            Utils.loadScripts(window.externalResources,{version : version, callback: function(){
                // console.log("scripts loaded");
            }});
        }
    }
    function executeBinding(totalCount,count){
        if(totalCount==count){
            $("#content img").unveil();
            try {
                setupScreenSizeVars();
            }catch(e){

            }
            if(window.initialiseScriptsBinding){
                window.initialiseScriptsBinding();
            }
            if(window.initScriptArray){
                for(var i=0;i<window.initScriptArray.length;i++){
                    window.initScriptArray[i]();
                }
            }
            loadCodes();
            Utils.convertTimeToLocalTime();
            if(window.loadBulletin){
                window.loadBulletin();
            }
            loadExternalScripts();
            if(window.loadHocalwireAds){
                window.loadHocalwireAds();
            }
            try {
                sendNewsRead();
                resetIframeSizes();
                // setTimeout(function(){
                //     resetIframeSizes();
                // },2000);
            } catch(e){

            }
            if(window.enableNotifications){
                window.enableNotifications();
            }
            loadFAB();
            try{
                var event = new CustomEvent("RESOURCES_INITIALIZED", { "detail": "ALL DEPENDENCIES LOADED" });
                document.dispatchEvent(event);

            } catch(e){

            }
            
            initializeStickySides();
            handleScrollTop();
            disableCutCopyPaste();
            insertLinkInCopy();
            initTransliterationOnSearch();
            // bindTakeSnapFromPage();
            sendEmailBind();
            configMyLocation();
            setupUserStateButtons();
            
            setupScrollSave();
            insideContentAdBehaviorSetup();
            initSocialWire();
            Utils.init();
            subscribeForMailUpdates();
            setupUserSocialSubscription();
            setupFixedStoryScrollHeader();
        }
    }

    function insertTemplateOnLoad(){
        try{
            var $el = $(".sb-search");
            for(var i=0;i<$el.length;i++){
                var search = new UISearch( $el[i] );
            }
            
        }catch(e){
            
        }
        
        var partner = $("#content").attr("data-partner");
        
        var count =0;
        var totalCount=0;
        var templates = window.allScriptsTemplate;

        var newsTemplates = templates.filter(function(item){
            return ( (item.content_type=="CATEGORY_NEWS" || item.content_type=="LOCATION_DATA" || item.content_type=="CATEGORY_LISTING" || item.content_type=="AUTHOR_LISTING" || item.content_type=="COMMENT_WIDGET" || item.content_type=="OTHER" || item.content_type=="FILE" || item.content_type=="CONTENT_DATA" || item.content_type=="CONTENT_PARAM_DATA" || item.content_type=="GENERIC") && item.is_visible=='true');
        });
        var dataTemplate  = templates.filter(function(item){
            return (item.content && item.is_visible=='true' && (item.content_type=="HTML" || item.content_type=="AD" ));
        });

        for(var i=0;i<dataTemplate.length;i++){

            var $e = $("#"+dataTemplate[i].element_id);
            if($e.length){

                var content = decodeURIComponent(dataTemplate[i].content);
                try {
                    var htmlCode = $(content);
                    if(!htmlCode || !htmlCode.length){
                        htmlCode = content;
                    }
                    if(htmlCode!="null") {
                        try {
                            if(dataTemplate[i].mixinName && dataTemplate[i].mixinName=="loadOnVisible"){
                                window.loadOnVisibleElements[dataTemplate[i].element_id] = {"data":htmlCode,"loaded":false};
                                $e.removeClass("hide").html("loading....");
                            } else {
                                if(dataTemplate[i].element_id=="filler_ad" && $(".filler-ad-unit-inside-post").length){
                                    $(".filler-ad-unit-inside-post").removeClass("hide").html(htmlCode);    
                                } else {
                                    $e.removeClass("hide").html(htmlCode);        
                                }    
                            }
                            
                            
                        } catch(e){
                            
                        }
                        
                    } else {
                        $e.removeClass("hide");
                    }
                } catch(e){
                    console.log("can not create jquerey object f rom html html element"+content);
                }
                
            }
        }
        bindForLoadOnVisible();
        for(var i=0;i<newsTemplates.length;i++){
            var index = i;
            var elementId = newsTemplates[index].element_id;
            var $e = $("#"+elementId);
            if(newsTemplates[index]["only_desktop"]){
                var isDesktop = $("#hidden_element_for_desktop").is(":visible");
                if(!isDesktop){
                    newsTemplates.splice(index, 1);
                    i--;
                    continue;
                }
            }
            

            if($e.length){
                totalCount++;
            } else {
                newsTemplates.splice(index, 1);
                i--;
            }
        }
        
        Utils.bindForFullScreenElement();
        
        // totalCount = newsTemplates.length;
        $("#content img").unveil();
        executeBinding(totalCount,count);
        // loadNewsAsGroup(newsTemplates);
        // return;
        for(var i=0;i<newsTemplates.length;i++){
            var index = i;
            var elementId = newsTemplates[index].element_id;
            var $e = $("#"+elementId);
            if($e.length){
                // var  includeAsItemsInResponse = newsTemplates[i]["includeAsItemsInResponse"];
                // if(includeAsItemsInResponse) {
                //     includeAsItemsInResponse = includeAsItemsInResponse.split(",");
                // } else {
                //     includeAsItemsInResponse = [];
                // }
                var success = function(data){
                    var templateData = data.templateData;
                    var view = data.viewData;
                    var itemData = data.itemData;
                    if(itemData){
                         for(var k in itemData){
                             var hh = '<span class="read-this-also"> Read This - </span><a href="'+itemData[k].newsUrl+'">'+itemData[k].title+'</a>';
                             $("#"+k).removeClass("hide").html($(hh));
                         }
                     }
                    var $e = $("#"+templateData.element_id);
                    try{
                        $e.removeClass("hide").html(view);
                    }catch(e){
                        
                    }
                    
                    executeBinding(totalCount,count);
                }
                var fail = function(){
                    executeBinding(totalCount,count);
                    // alert("failed in fetching data");
                }
                var viewProps = [];
                for(var k in newsTemplates[i]){
                    if(k=="heading" || "request_params" || "description") {
                        var heading = newsTemplates[i][k];
                        var encoded = encodeURIComponent(heading);
                        viewProps.push(k+"="+encoded);
                    } else {
                        viewProps.push(k+"="+newsTemplates[i][k]);    
                    }
                    

                }
                viewProps.push("partner="+partner);
                if(newsTemplates[index].content_type=="CONTENT_DATA" || newsTemplates[index].content_type=="GENERIC") {
                    var filterDataElement = $("#filter-variable-data");
                    if(filterDataElement.length){
                        viewProps.push("group_id="+filterDataElement.data("id"));
                        viewProps.push("group_content_type="+filterDataElement.data("content-type"));
                    }
                    var filterDataElement = $("#filter-params-data");
                    if(filterDataElement.length){
                        viewProps.push("extra_param_key="+filterDataElement.data("key"));
                        viewProps.push("extra_param_value="+filterDataElement.data("value"));
                    }
                }
                viewProps = viewProps.join("&");
                var url = "/xhr/getNewsMixin?"+viewProps;
                Hocalwire.Services.get(url)
                    .then(function(data) {
                        count++;
                        success(data);
                        
                    },
                    function() { 
                        count++;
                        fail();

                    }
                );
               
            }
            
        }
       
    }

    if(window.addEventListener){
            window.addEventListener('load', function() {
                window.insertLoadTriggered=true;
                insertTemplateOnLoad();
                // setTimeout(function(){
                //     loadPageCSS(insertTemplateOnLoad);    
                // },10);
                $("body").trigger("WINDOW_LOADED");
            });
        } else {
            window.attachEvent('load', function() {
                window.insertLoadTriggered=true;
                insertTemplateOnLoad();
               // setTimeout(function(){
               //      loadPageCSS(insertTemplateOnLoad);    
               //  },10);
               $("body").trigger("WINDOW_LOADED");
            });
            
        }
    function loadNewsAsGroup(newsTemplates){
        var partner = $("#content").attr("data-partner");
        
        for(var i=0;i<newsTemplates.length;i++){
            var index = i;
            var elementId = newsTemplates[index].element_id;
            var $e = $("#"+elementId);
            if(!$e.length){
                newsTemplates.splice(i,1);
                i--;
                continue;
            } 
            for(var k in newsTemplates[i]){
                if(k=="heading" || k=="request_params" || k=="description") {
                    var heading = newsTemplates[i][k];
                    var encoded = encodeURIComponent(heading);
                    newsTemplates[i][k]=encoded;

                } 
            }
            newsTemplates[i]['partner']=partner;
            if(newsTemplates[i].content_type=="CONTENT_DATA" || newsTemplates[i].content_type=="GENERIC") {
                var filterDataElement = $("#filter-variable-data");
                if(filterDataElement.length){
                    newsTemplates[i]["group_id"] =filterDataElement.data("id");
                    newsTemplates[i]["group_content_type"]=filterDataElement.data("content-type");
                }
                var filterDataElement = $("#filter-params-data");
                if(filterDataElement.length){
                    newsTemplates[i]["extra_param_key"]=filterDataElement.data("key");
                    newsTemplates[i]["extra_param_value"]=filterDataElement.data("value");
                }
            }
        }

        
        var success = function(data){
            for(var i=0;i<data.length;i++){
                var templateData = data[i].templateData;
                var view = data[i].viewData;
                var $e = $("#"+templateData.element_id);
                try{
                    $e.removeClass("hide").html(view);
                }catch(e){
                    
                }
                
                
            }
            executeBinding(data.length,data.length);    
            
        }
        var fail = function(){
            executeBinding(1,1);
            // alert("failed in fetching data");
        }
        var url = "/xhr/getNewsMixinAll"
        Hocalwire.Services.post(url,{"items":newsTemplates})
            .then(function(data) {
                success(data);
            },
            function() { 
                fail();
            }
        );
       
    }
     
    function bindForLoadOnVisible(){
        var counts = 0;
        var selectors = "";
        var o = window.loadOnVisibleElements;
        for(var k in o){
            var $el = getElement("#"+k)();
            if(window.isScrolledIntoView($el,true,200)){
                try {
                    $el.html(o[k].data);
                    delete o[k];
                }catch(ex){

                }
                
            }
        }
        $(document).on("scroll",function(event){
            for(var k in o){
                var $el = getElement("#"+k)();
                if(window.isScrolledIntoView($el,true,200)){
                    $el.removeClass("hide").html(o[k].data);
                    delete o[k];
                }
            }
        });
        
     }  
    
    function sendNewsRead(){
        var $e = $("#content");
        var newsId = $e.attr("data-newsid");
        if(!newsId){
            return; //not a news page
        }
        var hasStore = $e.attr("has-ga-store-key");

        if(!hasStore){
            var code = new Date().getTime();
            var data = {"code":code,"id":newsId};
            Hocalwire.Services.post("/xhr/admin/send-read-info",data);
        } else {
            var data = {"code":"","id":newsId};
            Hocalwire.Services.post("/xhr/admin/send-read-info",data);
        }
    }    
    function resetIframeSizes() {
        var f = $("iframe");
        for(var i=0;i<f.length;i++){
            var ff = $(f[i]);
            var src = ff.attr("src");
            if(!src || !(src.indexOf("www.youtube.com")>-1)){
                // alert("no iframe of youtube");
                continue;
            }
            var width = ff.width();
            var height = parseInt(width * (9/16));
            // alert(height);
            ff.attr("style","height:"+height+"px;");
            
        }
    }
    window.triggerInsertLoad = function(){
        window.insertLoadTriggered=true;
        insertTemplateOnLoad();
    }

    /////

function loadFAB(){
    if(!$(".fab,.backdrop").length){
        return;
    }
    $(".fab,.backdrop").click(function(){
        if($(".backdrop").is(":visible")){
            $(".backdrop").fadeOut(125);
            $(".fab.child")
                .stop()
                .animate({
                    bottom  : $("#masterfab").css("bottom"),
                    opacity : 0
                },125,function(){
                    $(this).hide();
                });
        }else{
            $(".backdrop").fadeIn(125);
            $(".fab.child").each(function(){
                $(this)
                    .stop()
                    .show()
                    .animate({
                        bottom  : (parseInt($("#masterfab").css("bottom")) + parseInt($("#masterfab").outerHeight()) + 40 * $(this).data("subitem") - $(".fab.child").outerHeight()) + "px",
                        opacity : 1
                    },125);
            });
        }
    });
    
    // $(".fab-menu-btn,.backdrop.menu").click(function(){
    //     if($(".backdrop.menu").is(":visible")){
    //         $(".backdrop.menu").fadeOut(125);
    //         $(".fab-menu.child")
    //             .stop()
    //             .animate({
    //                 bottom  : $("#masterfab-profile").css("bottom"),
    //                 opacity : 0
    //             },125,function(){
    //                 $(this).hide();
    //             });
    //     }else{
    //         $(".backdrop.menu").fadeIn(125);
    //         $(".fab-menu.child").each(function(){
    //             $(this)
    //                 .stop()
    //                 .show()
    //                 .animate({
    //                     bottom  : (parseInt($("#masterfab-profile").css("bottom")) + parseInt($("#masterfab-profile").outerHeight()) + 40 * $(this).data("subitem") - $(".fab-menu.child").outerHeight()) + "px",
    //                     opacity : 1
    //                 },125);
    //         });
    //     }
    // });
}
function getElement(el){
    return function(){
        return $(el);
    }
}
function initializeStickySides(){
    var isVisible = $("#hidden_element_for_width").is(":visible");
    if(isVisible){
        var hasStickyElements = $(".sticky_elements_scroll");
        if(hasStickyElements.length>0){
            var scriptToLoad = ["/scripts/theia-sticky-sidebar-final.js"];
            var callback = function(){
                // var $es = $('.sticky_elements_scroll .theiaStickySidebar');
                // for(var i=0;i<$es.length;i++){
                //     var $ee = getElement($es[i])();
                //     $ee.stickySidebar({
                //         bottomSpacing: 20,
                //         containerSelector: '.sticky_elements_scroll',
                //         innerWrapperClass: 'wrapper_inner'
                //     });
                // }
                // $('.sticky_elements_scroll')
                var timeout = $("#comments").length ? 5000 : 1000;
                setTimeout(function(){
                    var $es = $(".sticky_elements_scroll");
                    var fixedOnes = [];
                    var max=0;
                    var maxe;
                    for(var i=0;i<$es.length;i++){
                        var ee = getElement($es[i])();
                        var h = ee.height();
                        if(h>max){
                            max=h;
                            maxe=ee;
                        }
                    }
                    try {
                        if($es.length==1){
                            $es.theiaStickySidebar();
                        } else {
                            if(maxe){
                                for(var i=0;i<$es.length;i++){
                                    var ee = getElement($es[i])();
                                    if(ee[0]==maxe[0]){
                                        ee.find(".theiaStickySidebar").removeClass("theiaStickySidebar");
                                        continue;
                                    }
                                    ee.theiaStickySidebar({"updateSidebarHeight":false});
                                }
                            } else {
                                for(var i=0;i<$es.length;i++){
                                    var ee = getElement($es[i])();
                                    ee.theiaStickySidebar({"updateSidebarHeight":false});
                                }       
                            }
                        }
                    } catch(e){

                    }
                },timeout);
                // setTimeout(function(){$(".sticky_elements_scroll").theiaStickySidebar({"updateSidebarHeight":false});},100);
            };
            Utils.loadScripts(scriptToLoad,{"callback":callback})
        }
    }
}
function initSocialWire(){
    $(".sshare").on("click",function(){
        var url = $(this).attr("data-href");
        Utils.showModalForIframe(url);
        Utils.sendGaEvent("smart-share-"+$("#content").attr("data-partner"),"click","button");

    });
    
}
function handleScrollTop(){
    // browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
        //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
        offset_opacity = 1200,
        //duration of the top scrolling animation (in ms)
        scroll_top_duration = 700,
        //grab the "back to top" link
        $back_to_top = $('.cd-top');
    if(!$back_to_top.length){
        return;
    }
    //hide or show the "back to top" link
    $(window).scroll(function(){
        ( $(this).scrollTop() > offset ) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if( $(this).scrollTop() > offset_opacity ) { 
            $back_to_top.addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $back_to_top.on('click', function(event){
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0 ,
            }, scroll_top_duration
        );
    });
}
function setupScreenSizeVars(){
    
    if($("#hidden_element_for_desktop").is(":visible")){
        Hocalwire.isDesktopSize=true;
        Hocalwire.isTabletSize=false;
        Hocalwire.isMobileSize=false; 
    } else if($("#hidden_element_for_tablet").is(":visible")){
        Hocalwire.isDesktopSize=false;
        Hocalwire.isTabletSize=true;
        Hocalwire.isMobileSize=false; 
    } else {
        Hocalwire.isDesktopSize=false;
        Hocalwire.isTabletSize=false;
        Hocalwire.isMobileSize=true; 
    }
}
function disableCutCopyPaste(){
    if(!window.disableCopyPaste){
        return;
     //Disable cut copy paste
    }
    $('body').bind('cut copy paste', function (e) {
        e.preventDefault();
    });
   
    //Disable mouse right click
    $("body").on("contextmenu",function(e){
        return false;
    });
}
function insertLinkInCopy(){
    if(!window.insetLinkInCopy){
        return;
     //Disable cut copy paste
    }
    var intValue=-1;
    try{
        intValue = parseInt(window.insetLinkInCopy);
    }catch(e){
        intValue=300;
    }
    window.addLink = function() {
        //Get the selected text and append the extra info
        var selection = window.getSelection(),
            pagelink = '<br /><br /> Read more at: <b><a href="'+document.location.href+'">'+document.location.href+' </a></b>' ;
            var testLink = "";
            var copytext = selection + testLink;
            if(intValue>-1){
                copytext = copytext.substring(0,intValue)+pagelink;
            } else {
                copytext = copytext+pagelink;
            }
            if(window.insertPublishRightsMessage){
                var extmsg = '<br />'+window.insertPublishRightsMessage+', contact <b><a href="http://hocalwire.com/contact-us">http://hocalwire.com/</a></b>' ;
                copytext = copytext+extmsg;
            
            }
            var newdiv = document.createElement('div');

        //hide the newly created container
        newdiv.style.position = 'absolute';
        newdiv.style.left = '-99999px';

        //insert the container, fill it with the extended text, and define the new selection
        document.body.appendChild(newdiv);
        newdiv.innerHTML = copytext;
        selection.selectAllChildren(newdiv);

        window.setTimeout(function () {
            document.body.removeChild(newdiv);
        }, 100);
    }

    document.addEventListener('copy', addLink)
}

function initTransliterationOnSearch(){
        if(!window.enableTransliteration){
            return;
        }
        window.HocalwireTranslitration =  window.HocalwireTranslitration || {};
        var lang = window.enableTransliteration;
        var selector = ".use-google-translate"; 
        var ids = [];
        var items = $(selector);

        for(var i=0;i<items.length;i++){
            var $this = $(items[i]);
            if($this.attr("id")){
                ids.push($this.attr("id"));

            }
        }        
        
        
        window.HocalwireTranslitration[selector] = function(){
            var options = {
                sourceLanguage:
                    google.elements.transliteration.LanguageCode.ENGLISH,
                destinationLanguage:
                    [lang],
                shortcutKey: 'ctrl+g',
                transliterationEnabled: true
            };
            var control = new google.elements.transliteration.TransliterationControl(options);
            var arr = ids;
            
            
            control.makeTransliteratable(arr);
        };
        
        google.load('elements', '1', 
            {'callback':window.HocalwireTranslitration[selector], 
                'packages':'transliteration'
            }
        ); 
    
    
}
function subscribeForMailUpdates(){
    var btn = $("#subscribe_to_mail_btn_wrap");
    var $form;
    if(btn && btn.length){
        btn.on("click",function(){
            $form = $("#subscribe_to_mail");
            sendPost($form);
        });
    }
    var sendPost = function($form){
        var url ="/xhr/admin/login/subscribe-for-updates"; // the script where you handle the form input. // the script where you handle the form input.
        var options = {
            'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
        };
        Utils.showLoader(5000);
        Hocalwire.Services.post(url,$form.serialize(),options).then(
            function(data){
                Utils.hideLoader();
                if(data.errorCode == 0 || !data.errorCode) {
                        $('#subscribe-error').removeClass("hide").html("Subscribed Successfully...");
                    
                } else {
                    $('#subscribe-error').removeClass("hide").html("Unable to subscribe. Please try again later.");
                
                }
            },

            function(e) {
                Utils.hideLoader();
                $('#subscribe-error').removeClass("hide").html("Unable to subscribe. Please try again later.");
            }
        );
    }
}
function sendEmailBind(){
    var $sendEmail = $(".js-share-article-by-email");
    if(!$sendEmail || !$sendEmail.length){
        return;
    }
    $sendEmail.on("click",function(){
        var $e = $(this);
        var url = $e.data("url");

        var domain = $e.data("domain");
        if(url.indexOf(domain)==0){
            url = url.substring(url.indexOf(domain)+domain.length,url.length);    
        }
        var finalUrl = domain+"/share/send-article-by-email?url="+url;
        var height = 500;
        var width = 800;
        if(Hocalwire.isTabletSize){
            height=400;
            width=600;
        } else if(Hocalwire.isMobileSize){
            height=300;
            width=300;
        }
        
        if(url){
            window.open(finalUrl,"Share By Email","height="+height+",width="+width);
        }
    });
}
function sendLogout(){
    var url = window.Constants.url.xhrLogout ? window.Constants.url.xhrLogout :  "/xhr/admin/logout"; // the script where you handle the form input. // the script where you handle the form input.
    var options = {
        'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
    };
    Hocalwire.Services.post(url,{},options).then(
        function(data){
            Utils.hideLoader();
           if(data.redirectURL){
            window.location = data.redirectURL;
           } else {
            window.location = "/";
           }
        },

        function(e) {
           alert("could not logout");
        }
    );
}
function setupScrollSave(){
    if(window.saveScroll){
        $(document).on( 'scroll', function(){
                window.localStorage.scrollPosition = $(window).scrollTop();
        });
        if(window.localStorage.scrollPosition) {
            $(window).scrollTop(window.localStorage.scrollPosition);
            window.localStorage.scrollPosition=0;
        }    
    } 
        
}
function insideContentAdBehaviorSetup(){
    return;
    if(!$(".details-content-story").length){
        return;
    }
    var ignoreScroll=false;
    var elemCheckTimoeut=0;
    $(window).scroll(function() {
        if(!ignoreScroll){

        }
        $("#inside_post_content_ad_1").css("opacity",0);
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(function() {
            $("#inside_post_content_ad_1").css("opacity",1);
            checkMyAdElement();
            ignoreScroll=true;
            if(elemCheckTimoeut){
                clearTimeout(elemCheckTimoeut);
            }
            elemCheckTimoeut=setTimeout(function(){
                ignoreScroll=false;
            },1000);
        }, 250));
    });
    var getElement  = function(e){
        return function(){
            return $(e);
        }
    }
    var t1=0,t2=0;
    var checkMyAdElement = function(){
        console.log("called for add position");
        var adsParent = $(".inside-post-ad")
        var a1 = $(".details-content-story p:not(.inside-post-ad)");
        var a2 = $(".details-content-story div:not(.inside-post-ad)");
        var lastElement1,lastElement2;

        var adElement = $("#inside_post_content_ad_1");
        if(!adElement.html()){
            return;
        }
        var resultElementPos,resultElementPos1,resultElementPos2;
        var clone = adElement.clone();
        for(var i=0;i<a1.length;i++){
            if($(a1[i]).parents(".inside-post-ad").length){
                continue;
            }
            var result = isScrolledIntoView($(a1[i]));
            if(result && result.top>100 && result.bottom>100){
                resultElementPos1 = result;
                lastElement1 = getElement(a1[i])();     
            }
        }
        for(var i=0;i<a2.length;i++){
            if($(a2[i]).parents(".inside-post-ad").length){
                continue;
            }
            var result = isScrolledIntoView($(a2[i]));
            if(result && result.top>100 && result.bottom>100){
                lastElement2 = getElement(a2[i])();
                resultElementPos2 = result;
            }
        }
        if(lastElement1 || lastElement2){
            var e;
            if(lastElement1 && lastElement2 && lastElement1.length && lastElement2.length){
                var h1 = lastElement1.offset().top;
                var h2 = lastElement2.offset().top;
                if(h1>h2){
                    e = lastElement2;
                    resultElementPos=resultElementPos2;
                } else {
                    e=lastElement1;
                    resultElementPos=resultElementPos1;
                }
            } else {
                e= lastElement1 || lastElement2;
                resultElementPos= lastElement1?resultElementPos1:resultElementPos2;
            }
            if(e.length){
                console.log(e[0]);
                console.log(resultElementPos);
                // adElement.remove();
                // adElement.attr("style","position:fixed;top:"+(resultElementPos.top-10)+"px;");
                $(".temp_inside_content_ad_placeholder").remove();
                $('<div class="temp_inside_content_ad_placeholder" id="temp_inside_content_ad_placeholder" style="display:block;height:'+(adElement.height()+20)+'px;"></div>').insertBefore(e);    
                setAddPosition(resultElementPos);
                
                // $(clone).insertBefore(e);    
            } else {
                console.log("No element found for insert******************");
                setAddPosition();
            }
            
        } else {
            setAddPosition();
        }
    }
    var setAddPosition = function(resultElementPos){

        var adElement = $("#inside_post_content_ad_1");
        console.log(isScrolledIntoView($(".temp_inside_content_ad_placeholder")));
        if(!resultElementPos || !$(".temp_inside_content_ad_placeholder").length || !isScrolledIntoView($(".temp_inside_content_ad_placeholder"))){
           adElement.addClass("hide");
           return;
        } 
        adElement.removeClass("hide");
        
        var elem = ".temp_inside_content_ad_placeholder";
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        if(!$(elem).offset()){
            adElement.attr("style","width:100%;left:0px;background:#fff;border:1px solid #ccc;position:fixed;bottom:"+(resultElementPos.top)+"px;");
        }
        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();
        var top = (elemTop-docViewTop);
        console.log(top);
        if(!isNaN(top)){
            adElement.attr("style","position:fixed;top:"+(top-10)+"px;");
        } else {
            adElement.attr("style","width:100%;left:0px;background:#fff;border:1px solid #ccc;position:fixed;bottom:"+(resultElementPos.top)+"px;");
        }
        var bottom = (docViewBottom-elemBottom)
        
    }
   
}
function setupFixedStoryScrollHeader(){
    if(!window.customScrollData){
        return;
    }
    var isDown=true,scrolledDistance=0;
    var stateChanged=false;
    $(document).on("scroll",function(event){
        var currentScroll = $(window).scrollTop();
        var t = new Date().getTime();
        if(currentScroll > scrolledDistance){ //scrolling down
            if(!isDown){
                stateChanged=true;
            } else {
                stateChanged=false;
            }
            isDown=true;
        } else {
            if(!isDown){
                stateChanged=false;
            } else {
                stateChanged=true;
            }
            isDown=false;
        }
        scrolledDistance=currentScroll;
        if(stateChanged){
            var elementToOriginal = $("#"+customScrollData.themeElement);
            var elementToTemp = $("#"+customScrollData.commonElement);
            if(isDown){
                elementToOriginal.addClass("animate-hide");
                elementToOriginal.removeClass("animate-show");
                elementToTemp.addClass("animate-show");
                elementToTemp.removeClass("animate-hide");
            } else {
                elementToOriginal.addClass("animate-show");
                elementToOriginal.removeClass("animate-hide");
                elementToTemp.addClass("animate-hide");
                elementToTemp.removeClass("animate-show");
            }    
        }
        
    });
}
function setupUserSocialSubscription(){
    if(!window.USER_SOCIAL_SUBSCRIPTION_ENABLED || !$("#fixed-subscribe-social").length){
        return;
    }
    var url= "/xhr/admin/login/get-user-status";
    var data = {"trackingId":localStorage.hocal_client_tracker_id_,"type":"SOCIAL"};
    Hocalwire.Services.post(url,data)
        .then(function(dataReturned) {
            var dataV = dataReturned.data;
            if(dataV.length){
                $("#masterfab-ssubscribe").removeClass("hide");
                var errorCode = dataReturned.errorCode;
                var type = dataV[0].type;
                var state = dataV[0].state;
                var $btn = $("#fixed-subscribe-social");
                if(state=="NOT_FOUND"){
                    var urlh = $btn.find(".not-logged-in a").attr("href");
                    urlh = urlh+localStorage.hocal_client_tracker_id_;
                    $btn.find(".not-logged-in a").attr("href",urlh);
                    $btn.find(".not-logged-in").removeClass("hide");
                } else {
                    var urlh = $btn.find(".not-logged-in a").attr("href");
                    urlh = urlh+localStorage.hocal_client_tracker_id_;
                    $btn.find(".logged-in a").attr("href",urlh);
                    $btn.find(".logged-in").removeClass("hide");
                }
            }
            
        },
        function() { 
            
        }
    );
}
function setupUserStateButtons(){
    $(".js-logout-button").on("click",function () {
            sendLogout();
            Utils.showLoader(5000);
        });
    $('.float-nav').click(function() {
      $('.main-nav, .menu-btn').toggleClass('active');
    });
}
var configLocation=false;
function configMyLocation(){
    var isSubmiting = false;
    $(".nadi-ad-submit-btn").on("click",function(){
        if(!isSubmiting){
            
            var $parent = $(this).closest(".ad-form-wrapper");
            if($parent.length){
                isSubmiting=true;
            }
            var mobile = $parent.find(".ad-mobile");
            var name = $parent.find(".ad-name");
            var unitname = $parent.find(".unitname");
            var isMobile=$("#content").data("ismobile");

            var value = mobile.val();
            name = name.val();
            var partner = $("#content").data("partner");
            
            if(value){
                var data = {"name":name,"partner_value":partner+(isMobile?"-mobile":""),"mobile":value,"unitname":unitname.val()};
                $(this).addClass("hide");
                Hocalwire.Services.post("/xhr/admin/login/submit-ad-lead",data)
                    .then(function() {
                        isSubmiting=false;
                        $parent.find(".success-msg").removeClass("hide");
                    },
                    function() { 
                        isSubmiting=false;
                    }
                );
            }    
        }
        
        
    });
    if($(".nadi-ad-submit-btn").length){
        setTimeout(function(){Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_LOADED_","1",{"path":"/","expires":new Date(new Date().getTime())+(5*60*60*1000)});},20000);    
    }
    
    if(configLocation){
        return;
    }
    var partner = $("#content").attr("data-partner");
    configLocation=true;
    var isLocationSetPage = $("#notification-settings-page");
    var lat = isLocationSetPage.length ? isLocationSetPage.attr("data-lat") : 0;
    var lng = isLocationSetPage.length ? isLocationSetPage.attr("data-lng") : 0;
    if((lat && lng)||(isLocationSetPage.length)) {
        var ld = {"latitude":lat,"longitude":lng};
        var jd = JSON.stringify(ld);
        var cookieValue = jd;
        Hocalwire.Services.GlobalService.setCookie("my_hocal_location",cookieValue,{"path":"/","expires":new Date(new Date().getTime())+(24*365*60*60*1000)});
        var locationCookie = Hocalwire.Services.GlobalService.getCookie("my_hocal_location");
        Hocalwire.Services.GlobalService.setCookie("my_hocal_location_check","1",{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
        window.ga('common.send', 'event', partner+"-set-location", "set", lat+"##"+lng);
        if(locationCookie) {
            //send location to server
            var ld;
            try {
                ld = JSON.parse(locationCookie);
                var url = "/xhr/admin/save-user-location?lat="+ld.latitude+"&lng="+ld.longitude
                Hocalwire.Services.get(url)
                    .then(function(data) {
                        console.log("success");
                    },
                    function() { 
                        console.log("failed saving");
                    }

                );
                // setTimeout(function(){window.location="/";},3000);
            } catch(e){

            }
        }
        return;
    } 
    var checkLocation = Hocalwire.Services.GlobalService.getCookie("my_hocal_location_check");
    var locationCookie = Hocalwire.Services.GlobalService.getCookie("my_hocal_location");
    if(locationCookie) {
        //send location to server
        var ld;
        try {
            ld = JSON.parse(locationCookie);
            var url = "/xhr/admin/save-user-location?lat="+ld.latitude+"&lng="+ld.longitude;
            window.ga('common.send', 'event', partner+"-save-location", "send", ld.latitude+"##"+ld.longitude);
            Hocalwire.Services.get(url)
                .then(function(data) {
                    
                },
                function() { 
                    
                }
            );
        } catch(e){

        }
    }
    var isLocMandatory=true;
    var locationContainer = $("#floating-location-container");
    if(locationContainer.hasClass("no-manatory-loc")){
        isLocMandatory=false;
    }
    if(checkLocation && locationCookie){
        return;
    }
    if(checkLocation && !locationCookie && !isLocMandatory){
        return;
    }
    
    
    
    if(locationContainer.hasClass("hide")){
        window.ga('common.send', 'event', partner+"-show-location", "show", "loc-btn");
        locationContainer.removeClass("hide");
        locationContainer.find("a").on("click",function(){
            window.ga('common.send', 'event', "location-btn", "click", partner);
        });
    }
    
    Hocalwire.Services.GlobalService.setCookie("my_hocal_location_check","1",{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});

    return;
   
}
if(!configLocation)
    configMyLocation();

})();

