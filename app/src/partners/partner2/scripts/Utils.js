/* global jwplayer */
"use strict";
var Utils = {
    loadOnVisible : [],
    loadScript : {"loadCount":0,callback:null,loaded:null},
    loadScriptAdvanced: {},
    firstTimeLoad : true,
    timeDiffWithServerInMillis : 0,
    
    playerScriptLoaded : false,
    lazyLoadImage :  function(selector) {

        var element = $(selector);
        if(element.length > 0 && (!element.attr("src") || element.attr("src")==="")) {
            element.attr("src",element.attr("data-src"));
        }

    },


    lazyLoadScript : function(scriptsArray,callback){

        Utils.loadScript.loaded  = function () {
            Utils.loadScript.loadCount++;
            if(Utils.loadScript.loadCount === totalRequired && typeof Utils.loadScript.callback === "function") {
                Utils.loadScript.callback.call();
            }
        };
        Utils.loadScript.loadCount=0;
        var totalRequired = scriptsArray.length;
        Utils.loadScript.callback=callback;
        var require = function (scriptsArray) {
            for (var i = 0; i < scriptsArray.length; i++) {
                    writeScript(scriptsArray[i]);
            }
        };

        var writeScript =  function (src) {

            var type = "js";
            if(src.lastIndexOf(".css")===src.length-4){
                type="css";
            }
            var s;
            if(type==="js"){
                s = document.createElement("script");
                s.type = "text/javascript";
                s.async = true;
                s.src = (src.indexOf('http://') ===0 || src.indexOf('https://') ===0 || src.indexOf('www.') ===0) ? src : "/scripts/"+src;
            } else {
                s=document.createElement("link");
                s.setAttribute("rel", "stylesheet");
                s.setAttribute("type", "text/css");
                s.setAttribute("href", "/styles/"+src);
                s.async = true;
            }
            s.addEventListener("load", function (e) {
                if(Utils.loadScript.loaded){
                        Utils.loadScript.loaded(e);
                }
            }, false);
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(s);
      };
      require(scriptsArray);
    },
    
    loadScripts : function(scriptsArray,options){
        var uniqueKey = new Date().getTime().toString();
        var initialOptions = {loadCount: 0, errorOccurred: false};
        Utils.loadScriptAdvanced._loaded  = function (e, key) {
            Utils.loadScriptAdvanced[key].loadCount++;
            Utils.loadScriptAdvanced._callCallback(key);
        };
        Utils.loadScriptAdvanced._callCallback = function(key){
            if(Utils.loadScriptAdvanced[key] && Utils.loadScriptAdvanced[key].loadCount === Utils.loadScriptAdvanced[key].totalRequired && typeof Utils.loadScriptAdvanced[key].callback === "function" && !Utils.loadScriptAdvanced[key].errorOccurred) {
                Utils.loadScriptAdvanced[key].callback.call();
                delete Utils.loadScriptAdvanced[key];
            }
        };
        Utils.loadScriptAdvanced._error  = function (key) {
            if(Utils.loadScriptAdvanced[key]){
                if(!Utils.loadScriptAdvanced[key].errorOccurred){
                    Utils.loadScriptAdvanced[key].errorOccurred = true;
                    if(typeof Utils.loadScriptAdvanced[key].callback === "function"){
                        Utils.loadScriptAdvanced[key].callback.call(this,"Error Occurred");
                    }
                    delete Utils.loadScriptAdvanced[key];
                }
            }
        };
        Utils.loadScriptAdvanced[uniqueKey] = initialOptions;
        Utils.loadScriptAdvanced[uniqueKey].totalRequired = scriptsArray.length;
        Utils.loadScriptAdvanced[uniqueKey].callback=options.callback;
        var require = function (scriptsArray, uniqueKey) {
            for (var i = 0; i < scriptsArray.length; i++) {
                writeScript(scriptsArray[i], uniqueKey);
            }
        };

        var writeScript =  function (src, key) {
            var type = "js";
            if(src.lastIndexOf(".css")===src.length-4){
                type="css";
            }
            var s;
            if(type==="js"){
                s = document.createElement("script");
                s.type = "text/javascript";
                s.async = true;
                s.src = (src.indexOf('http://') ===0 || src.indexOf('https://') ===0 || src.indexOf('www.') ===0) ? src : "/scripts/"+src;
                s.setAttribute("data-key", key);
            } else {
                s=document.createElement("link");
                s.setAttribute("rel", "stylesheet");
                s.setAttribute("type", "text/css");
                s.setAttribute("href", "/styles/"+src);
                s.setAttribute("data-key", key);
                s.async = true;
            }
            s.onerror = function(){
                Utils.loadScriptAdvanced._error(this.getAttribute('data-key'));
            };
            s.addEventListener("load", function (e) {
                Utils.loadScriptAdvanced._loaded(e, s.getAttribute('data-key'));
            }, false);
            var head = document.getElementsByTagName("head")[0];
            head.appendChild(s);
        };
        require(scriptsArray, uniqueKey);
    },
    redirectToUrl : function(redirectUrl) {
       window.location = redirectUrl;
    },
    
    loadJWPlayer : function(callback) {
        if (!Utils.playerScriptLoaded) {
            Utils.lazyLoadScript(["js/jwPlayer.min.js", "jwPlayer/jwPlayerWrapper.js"],
                function(){
                    Utils.playerScriptLoaded = true;
                    // jwplayer.jwpsrv.setSampleFrequency(0.001);
                    callback();
                }, true);
        } else {
            callback();
        }
    },
    playVideo: function(source, imageUrl){
        $.openPopup('#news-video', function(){
            var wheight = $(window).height();
            var setupObj = {
                file: source,
                height: wheight,
                width: '100%',
                autostart:true
            };
            if(imageUrl){
                setupObj.image = imageUrl;
            }
            jwplayer.key="cAr98kB89aA0ZhpVmJqMLQGxXGRUXKjW3Z9DlufTILI=";
            var playerObj = jwplayer('jwplayerDiv').setup(setupObj);
            EventsManager.addListener(EventsManager.events.POPUP_HIDE, function(params){
                if(params.selector === "#news-video"){
                    playerObj.stop();
                    EventsManager.removeListener(EventsManager.events.POPUP_HIDE, 'videoPopup');
                }
            },"videoPopup");
        });
    },
    elementInViewport : function($el) {
        if(!$el || $el.length === 0) { //element not found
            return false;
        }
        var offset = $el.offset(),
        top = offset.top,
        left = offset.left,
        width = offset.width || $el.width(),
        height = offset.height || $el.height();

        if(width===0 || height===0){ //work around for hidden divs
          width=10; height=10;
        }

        return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
        );
    },
    getDeviceCoordinates : function(successCallback, errorCallback, geolocationNotSupportedCallback, options) {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition (function(point) {
                successCallback(point, options); }, errorCallback);
        } else {
            geolocationNotSupportedCallback();
        }
    },
    /**
     * [getReverseGeocode Get the locality of the device. City can be extracted from it.]
     * @param  {float} latitude                 [Latitude of the device]
     * @param  {float} longitude                [Longitude of the device]
     * @param  {function} successCallback       [Success callback function, this already has the
     *                                           `latitude`, `longitude` and `results`
     *                                           fetched from the geocodeResponse.]
     * @param  {function} errorCallback         [Error callback function]
     * @return {void}                           [void]
     */
    getReverseGeocode : function(latitude, longitude, successCallback, errorCallback, options) {
        var _reverseGeocodeCallback = function (){
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(latitude,longitude);
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    successCallback(latitude, longitude, results, options);
                } else {
                    errorCallback();
                }
            });
        };
        _reverseGeocodeCallback();
    },
    /**
     * [findProjectsNearMe Logic for finding nearby projects]
     * @param  {Object} options [Contains the selected city and list of cities]
     * @return {void}           [void]
     */
    getMyLocation : function(options){
        var _getMyLocationFail = function () {
                _hideLoaders();
                Utils.dialog({message:"We were unable to locate you as we do not have permission to access your location. Please enable your location and try again.", title : "Location detection disabled."});
            },

            _geoLocationNotSupported = function() {
                _hideLoaders();
                Utils.dialog({message: "You browser doesn't support location detection.", title : "Location detection not supported."});
            },
            _getMyLocationSuccess = function(point, options) {
                    Utils.dialog({message: "you location is:lat"+point.coords.latitude+"lng:"+point.coords.longitude, title : "Your cordinates"});      
                    _hideLoaders();
            },
            
            _timeout = function () {
                _hideLoaders();
                Utils.dialog({message: "It's taking too long to find out your location.", title : "Request timed out." });
            },
            _hideLoaders = function () {
                clearTimeout(Utils.timeoutId);
                Utils.timeoutId = 0;
                
            },
            _showLoaders = function () {
                console.log("show loaders for location fetch")
            };

        _showLoaders();
        clearTimeout(Utils.timeoutId);
        Utils.timeoutId = setTimeout(_timeout, 10000);
        Utils.getDeviceCoordinates(_getMyLocationSuccess, _getMyLocationFail, _geoLocationNotSupported, options);
    },
    timeoutId : 0,
    /*
    * Param contains the following :
    * 1. `type` of dialog - `alert`, `confirm`. If not provided default taken is `alert`.
    * 2. `message` - to be displayed.
    * 3. `actionOneLabel` - Label on action one button. Default label is 'Ok'.
    * 4. `actionOneCallback` - Method for action one button.
    * 5. `actionTwoLabel` - Label on action two button. Default label is 'Cancel'.
    * 6. `actionTwoCallback` - Method for action two button.
    * 7. `title` - Sets dialog title.
    */
    dialog : function(param) {
        var _initializeDialog = function(param){
                var selector = '.dialog';
                $(selector + ' .title').html(param.title);
                $(selector + ' .message').html(param.message);
                $(selector + ' .action').each(function() {
                    $(this).off('click');
                });

                // show title if passed
                if (param.title) {
                  $(selector + ' .title').removeClass('hide');
                } else {
                  $(selector + ' .title').addClass('hide');
                }
                $(selector).removeClass('hide');
            },
            _initializeDialogButton = function(buttonClass, label, callback) {
                $('.dialog .' + buttonClass).html(label).on('click', function() {
                    $('.dialog').addClass('hide');
                    if(callback) {
                        callback();
                    }
                    $('.dialog .action').each(function(){
                        $(this).off('click');
                    });
                    $('.dialog .'+buttonClass).addClass('hide');
                    return false;
                });
                $('.dialog .'+buttonClass).removeClass('hide');
            },
            _hideButtons = function() {
                $('.dialog button').addClass('hide');
            };

        _initializeDialog(param);
        if(!param.actionOneLabel){
            param.actionOneLabel = 'OK';
        }
        _hideButtons();
        _initializeDialogButton('one', param.actionOneLabel, param.actionOneCallback);
        if(param.type === 'confirm') {
            if(!param.actionTwoLabel){
            param.actionTwoLabel = 'Cancel';
            }
            _initializeDialogButton('two', param.actionTwoLabel, param.actionTwoCallback);
        }
    },

    /**
     * parse URL query string and gets the value of the parameter
     * @param  {String} name querystring parameter
     * @return {String} querystring parameter value
     */
    getQueryParameterByName: function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    /**
     * update URL query string
     * @param  {String} uri   valid url, valid querystring parameter
     * @param  {String} key   querystring parameter
     * @param  {String} value querystring value
     * @return {String} updated uri
     */
    updateQueryStringParameter: function(uri, keys, values) {
        var re, separator;
        var i;
        var key, value;

        if (!(keys instanceof Array)) {
            keys = [keys];
            values = [values];
        }

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            value = values[i];
            re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            separator = uri.indexOf('?') !== -1 ? "&" : "?";

            if (uri.match(re)) {
                uri = uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                uri = uri + separator + key + "=" + value;
            }
        }

        return uri;
    },

    publishScrollToBottomEvent: function(){
        var isEventAlreadyTriggered =false;
        if ($.addPageHide) {
            $.addPageHide("body", function() {
                Utils.loadOnVisible=[];
            });
        }
        for(var k=0; k<Utils.loadOnVisible.length;k++){
                if(Utils.elementInViewport(Utils.loadOnVisible[k].element) && !Utils.loadOnVisible[k].loaded){
                    Utils.loadOnVisible[k].callback(Utils.loadOnVisible[k].element);
                    Utils.loadOnVisible[k].loaded=true;
                }
        }
        $(document).on('scroll', function(e){
            var scrollHeight = $(document).height() - $(window).height();
            var currentScroll = $(window).scrollTop();
            if(!isEventAlreadyTriggered && (currentScroll >= scrollHeight *0.9)){
                isEventAlreadyTriggered = true;
                $(document).trigger('scrolledToBottom',e);
                EventsManager.dispatchEvent(EventsManager.events.SCROLLED_BOTTOM);
                setTimeout(function(){
                    isEventAlreadyTriggered = false;
                }, 2000);
            }
            for(var k=0;k<Utils.loadOnVisible.length;k++){
                if(Utils.elementInViewport(Utils.loadOnVisible[k].element) && !Utils.loadOnVisible[k].loaded){
                    Utils.loadOnVisible[k].callback(Utils.loadOnVisible[k].element);
                    Utils.loadOnVisible[k].loaded=true;

                }
            }

        });
    },
    init : function(){
        Utils.publishScrollToBottomEvent();
        if($.addPageLoad){
            $.addPageLoad(Utils.lazyloadPageItemsOnLoad);
        } else {
            window.addEventListener('load', Utils.lazyloadPageItemsOnLoad);
        }
    },

    /**
     * getLocationPathname
     */
    getLocation: function() {
        // search
        var href = History.getLocationHref(),
            search = '';
        if(href.indexOf('?') !==-1) {
            search = href.slice(href.indexOf('?'));
        }
        // pathname
        var pathname = History.getShortUrl(History.getState().url);
        if(pathname.indexOf('?') !== -1) {
            pathname = pathname.slice(0, pathname.indexOf('?'));
        }

        return {
            hash: '#'+History.getHash(),
            pathname: pathname,
            search: search
        };
    },

    
    /**
     * capitalize first letter and then followed by lower letters
     * @param  {String} str
     * @return {String} modified word
     */
    capitalize: function(str) {
        if (!str) { return ''; }

        str = str.toString();

        return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();

    },

    
    /**
     * Change dash separated string to camelCase string
     * @param {String} input
     * @return {String} camelcase string
     */
    toCamelCase: function(input) {
        return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    },

    registerLoadOnVisible: function(elements,callback,forceClear){
        if(!callback){
            return;
        }
        if(forceClear) {
            Utils.loadOnVisible.splice(0);
        }
        for(var i=0;i<elements.length;i++){
            var element = $(elements[i]);
            if(Utils.elementInViewport(element)) {
                callback(element);
            }
            else {
                Utils.loadOnVisible.push({'element':element,'callback' : callback});
            }
        }

    },
    lazyloadPageItemsOnLoad : function(){
        //lazy load resources with data-lazyValue and data-lazyAttr
        if(typeof EventsManager!="undefined"){
            EventsManager.dispatchEvent(EventsManager.events.PAGE_LOADED); //dispatch common lead submit success
        }
        var items = $("body .load-after-page");
        for(var i=0;i<items.length;i++){
            var $e = $(items[i]);
            var dataValue = $e.attr("data-lazyValue");
            var attrValue = $e.attr("data-lazyAttr");
            if(attrValue && dataValue && $e.attr(attrValue)!=dataValue) {
                $e.attr(attrValue,dataValue);
            }
            if($e.attr("data-lazyClass")){
                $e.addClass($e.attr("data-lazyClass"));
            }
            if($e.attr("data-lazyClassRemove")){
                $e.removeClass($e.attr("data-lazyClassRemove"));
            }
            if($e.attr("data-lazyRemoveElement")){
                $e.find($e.attr("data-lazyRemoveElement")).remove();
            }

        }
       

    },

    
    addPageLoadListener: function(callback){
        if($.addPageLoad){
            $.addPageLoad(callback);
        } else {
            window.addEventListener('load', callback);
        }
    },
    loadPage : function(url, statetype){
        if(typeof $.loadPage === 'function'){
            if(statetype){
                $.loadPage(url, {stateType: statetype});
            }else{
                $.loadPage(url);
            }
        }else{
            showLoading();
            window.location = url;
        }
    },
    setTimeOffset : function(millis)
    {
        
        var currMillis = new Date().getTime();
        
        var serverMillis = parseInt(millis);
        
        var serverMillisCurrent = this.getCurrTimeMillisFromGMT(serverMillis);
        
        this.timeDiffWithServerInMillis = currMillis - serverMillisCurrent;
        
    },
    parseInt : function(input) { 
        try {
            return parseInt(input);
        }catch(err){ 
            return null;
        }
    },
    
    convertDateToGMTDate : function(date,considerTimeDiff){
            // change updated date to IST format.
            var offset=new Date().getTimezoneOffset() * 60000;
            var d;
            if(considerTimeDiff)
                d=new Date(date.getTime()+offset - this.timeDiffWithServerInMillis);
            else 
                d=new Date(date.getTime()+offset);
            return d;
    
    },
    convertDateFromGMTDate : function(date,considerTimeDiff){
            // change updated date to IST format.
            var offset=new Date().getTimezoneOffset() * 60000;
            var d;
            if(considerTimeDiff)
                d=new Date(date.getTime()-offset + this.timeDiffWithServerInMillis);
            else 
                d=new Date(date.getTime()-offset);
            return d;
    
    },getStringFromDate :  function(d) { 
        if(!(d.getTime() > 0)) d = new Date(); //default to current date
        var hh = d.getHours(); if(hh<10 && (""+hh).indexOf('0')!=0) hh = "0"+hh;
        var mm = d.getMinutes(); if(mm<10 && (""+mm).indexOf('0')!=0) mm = "0"+mm;
        var ss = d.getSeconds(); if(ss<10 && (""+ss).indexOf('0')!=0) ss = "0"+ss;
        if(mm=='0') mm='00';
        if(ss=='0') ss='00';
        if(hh=='0') hh='00';
        var month = this.parseInt(d.getMonth()+1);
        if(month <10 && (""+month).indexOf('0')!=0) month = "0"+month;
        var year = d.getFullYear();
        var date = d.getDate(); if(date<10 && (""+date).indexOf('0')!=0) date = "0"+date;
        return (year+"/"+month+"/"+date+" " +hh+":"+mm+":"+ss);

    },
    
    getDateFromString : function(dateString) { 
        var s = dateString.split("-").join("/");
        return new Date(s);
    },
    getCurrTimeStringFromGMTString : function(gmtString,considerTimeDiff) { 
        var gmtTime = this.getDateFromString(gmtString);
        var curr = this.convertDateFromGMTDate(gmtTime,considerTimeDiff);
        return this.getStringFromDate(curr);
    },
    getGMTStringFromCurrTimeString : function(currTimeString,considerTimeDiff) { 
        var currTime = this.getDateFromString(currTimeString);
        var gmtTime = this.convertDateToGMTDate(currTime,considerTimeDiff);
        return this.getStringFromDate(gmtTime);
    },
    getCurrTimeMillisFromGMT : function(millis,considerTimeDiff) { 
        return this.convertDateFromGMTDate(new Date(this.parseInt(millis)),considerTimeDiff).getTime();
    },
    getGMTTimeMillisFromCurrent : function(millis,considerTimeDiff) { 
        return this.convertDateToGMTDate(new Date(this.parseInt(millis)),considerTimeDiff).getTime();
    },
    getLocalTimeZoneDisplay : function(){
            var hour=(new Date().getTimezoneOffset() * -1)/60;
            if (hour<0)
            return "GMT "+hour;
            else
            return "GMT +"+hour;
    },

    getFormatedDateTime : function(dateString,excludeTime,excludeYear) { 
        var time = "";
        if(dateString.indexOf(" ") > -1){
            time = dateString.split(" ")[1];
            dateString = dateString.split(" ")[0];
        }
        dateString = this.getDateFromString(dateString);
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        var month = {"1":"Jan","2":"Feb","3":"Mar","4":"Apr","5":"May","6":"Jun","7":"Jul","8":"Aug","9":"Sept","10":"Oct","11":"Nov","12":"Dec"};
        var dt =  (days[dateString.getDay()] +" "+month[dateString.getMonth()+1]+" "+dateString.getDate());
        if(!excludeYear) {
            dt +=", "+dateString.getFullYear();
        }
        if(!excludeTime) {
            dt +=" : "+time;
        }
        return dt;
    },
    getFormatedDate : function(dateString,excludeTime,excludeYear) { 
        var time = "";
        if(dateString.indexOf(" ") > -1){
            time = dateString.split(" ")[1];
            dateString = dateString.split(" ")[0];
        }
        dateString = this.getDateFromString(dateString);
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        var month = {"1":"Jan","2":"Feb","3":"Mar","4":"Apr","5":"May","6":"Jun","7":"Jul","8":"Aug","9":"Sept","10":"Oct","11":"Nov","12":"Dec"};
        var dt =  (month[dateString.getMonth()+1]+" "+dateString.getDate());
        if(!excludeYear) {
            dt += ", "+dateString.getFullYear();
        }
        return dt;

    
    },
    getFormattedTime :  function(durationInMins) { 
        var timeDiff;
            var difference = (this.parseInt(durationInMins)*60*1000);
        
        var daysDifference = Math.floor(difference/1000/60/60/24);
        difference -= daysDifference*1000*60*60*24;
        
        var hoursDifference = Math.floor(difference/1000/60/60);
        difference -= hoursDifference*1000*60*60;
        
        var minutesDifference = Math.floor(difference/1000/60);
        difference -= minutesDifference*1000*60;
        
        var secondsDifference = Math.floor(difference/1000);
        timeDiff =  daysDifference + 'day/s ' + (daysDifference < 2 ? (hoursDifference + 'hr/s ' + minutesDifference + 'min/s ' + secondsDifference + ' second/s ') : '');
        
        var days = this.timeStringCheck(daysDifference, 'day');
        var hours =  this.timeStringCheck(hoursDifference, 'hr');
        var minutes =  this.timeStringCheck(minutesDifference, 'min');
        
        return (days + hours + minutes);

    },
    getFutureTime : function(offset) {
        var now = new Date();
        var gmtTime = this.convertDateToGMTDate(now,true);
        gmtTime.setTime(gmtTime.getTime() + (offset*1000)); 
        return gmtTime;
    },
    getFutureLocalTime : function(offset) {
        var now = new Date();
        if(offset) {
            now.setTime(now.getTime() + (offset*1000)); 
        }
        return this.getFormattedDateTime(now);
    },
    getFormattedDateTime :  function(d) { 
        if(!(d.getTime() > 0)) d = new Date(); //default to current date
        var hh = d.getHours(); if(hh<10 && (""+hh).indexOf('0')!=0) hh = "0"+hh;
        var mm = d.getMinutes(); if(mm<10 && (""+mm).indexOf('0')!=0) mm = "0"+mm;
        var ss = d.getSeconds(); if(ss<10 && (""+ss).indexOf('0')!=0) ss = "0"+ss;
        if(mm=='0') mm='00';
        if(ss=='0') ss='00';
        if(hh=='0') hh='00';
        var month = this.parseInt(d.getMonth()+1);
        if(month <10 && (""+month).indexOf('0')!=0) month = "0"+month;
        var year = d.getFullYear();
        var date = d.getDate(); if(date<10 && (""+date).indexOf('0')!=0) date = "0"+date;
        return (year+"-"+month+"-"+date+" " +hh+":"+mm);

    },
    getFormattedTimeFromMillis : function(millis) { 
        var mins = millis/(60*1000);
        return this.getFormattedTime(mins);
    },
    timeStringCheck : function(diff, str){
        var val = this.parseInt(diff);
        if(val > 1){
            str = val +' ' + str+'s'+' ';
        }else if(val == 1){
            str = val +' '+ str + ' ';
        }else   {
            str = '';
        }
        return str;
    },
    getDisplayDateLong : function(datetime) {
        return datetime;
    },
    distanceBetween2Points : function ( point1, point2 ) {
     
            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.sqrt( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) );
     },
    angleBetween2Points: function ( point1, point2 ) {
     
            var dx = point2.x - point1.x;
            var dy = point2.y - point1.y;
            return Math.atan2( dx, dy );
    },
    getFormatedTimeForIM : function(dateObj) { 
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        var month = {"1":"Jan","2":"Feb","3":"Mar","4":"Apr","5":"May","6":"Jun","7":"Jul","8":"Aug","9":"Sep","10":"Oct","11":"Nov","12":"Dec"};
        var nowDate = new Date();
        var strDisplay="";  
        var day = dateObj.getDay();
        var date = dateObj.getDate();
        var todayDate = nowDate.getDate();
        var todayDay = nowDate.getDay();
        if(dateObj.getMonth() == nowDate.getMonth() && dateObj.getFullYear() == nowDate.getFullYear()) {  //for same day and year
            if(date == todayDate) 
                strDisplay = "";
            else if(date == (todayDate+1)) 
                strDisplay = "";//"Tomorrow,";
            else if(date == (todayDate-1))
                strDisplay = "Yest,";
            else if( date >= (todayDate-todayDay) && date < todayDate){
                strDisplay = days[day]; 
            } else 
                strDisplay = date +" "+month[dateObj.getMonth()+1];
        } else { 
            if(dateObj.getFullYear() == nowDate.getFullYear()) {
                strDisplay = date +" "+month[dateObj.getMonth()+1];
            } else {
                strDisplay = date +" "+month[dateObj.getMonth()+1] +" "+dateObj.getFullYear();
            }
                
        }
        return strDisplay;
            
    },
    getFormatedDateString : function(dateObj) { 
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        var month = {"1":"Jan","2":"Feb","3":"March","4":"April","5":"May","6":"Jun","7":"July","8":"Aug","9":"Sep","10":"Oct","11":"Nov","12":"Dec"};
        var nowDate = new Date();
        var strDisplay="";  
        var day = dateObj.getDay();
        var date = dateObj.getDate();
        var todayDate = nowDate.getDate();
        var todayDay = nowDate.getDay();
            
        strDisplay = date +" "+month[dateObj.getMonth()+1] +" "+dateObj.getFullYear();
        return strDisplay;
            
    },
    getFormatedTodaysDate : function() { 
        var dateObj = new Date();
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        var month = {"1":"Jan","2":"Feb","3":"March","4":"April","5":"May","6":"Jun","7":"July","8":"Aug","9":"Sep","10":"Oct","11":"Nov","12":"Dec"};
        var nowDate = new Date();
        var strDisplay="";  
        var day = dateObj.getDay();
        var date = dateObj.getDate();
        var todayDate = nowDate.getDate();
        var todayDay = nowDate.getDay();
        strDisplay = date +" "+month[dateObj.getMonth()+1] +", "+dateObj.getFullYear();
        return strDisplay;
            
    },
    isInCurrentYear : function(dateObj) {
        var today = new Date();
        var ss = (today.getFullYear() == dateObj.getFullYear());
        return ss;
    },
    isToday : function(dateObj) {
        var today = new Date();
        if(dateObj.getDate() == today.getDate()) {
            return true;
        }
        return false;
    },
    isSameDay : function(dateObj1,dateObj2) {
        
        if(dateObj1.getDate() == dateObj2.getDate()) {
            return true;
        }
        return false;
    },
    isDateInPast : function(dateString) {
        var dateObj = this.getDateFromString(dateString);
        var now = new Date();
        return (dateObj < now);
    },
    checkCurrentWeek : function(dateObj) {
        var today = new Date();
        if(dateObj.getDate() == (today.getDate()-1)) {
            return "Yesterday";
        } else if(dateObj.getDate() == (today.getDate()+1)) {
            return "Tomorrow";
        }
        
        //checking monday as we want week to start on Monday
        var thisWeekMonday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+1);
        var passedDateMonday = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() - dateObj.getDay()+1);
        
        return (passedDateMonday - thisWeekMonday);
    },
    
    _getFormattedTime : function(time,excludeSec) { 
            var timeA = time.split(":");
            var sec = this.parseInt(timeA[2]);
            if(sec < 10) sec = "0"+sec;
            var am_pm = " AM";
            var hour = this.parseInt(timeA[0]);
            var min = this.parseInt(timeA[1]);
            if(hour >11) am_pm = " PM";
            if(hour > 12)  {hour = hour-12; }
            if(hour==0) hour =12;
            if(min < 10) min = "0"+min;
            if(excludeSec) 
                return (hour +":"+ min+ am_pm);
            else 
                return (hour +":"+ min+ ":"+sec+ am_pm);
    },
    getFormatedTimeFromString : function(dateString,excludeSec) { 
        var time = "";
        if(dateString.indexOf(" ") > -1){
            time = dateString.split(" ")[1];
            dateString = dateString.split(" ")[0];
        }
        if(time!="")
            time = this._getFormattedTime(time,excludeSec);
        return time;
    },
    getFormatedIMDateTimeFromString : function(dateString,excludeSec,excludeTime) { 
            var time = "";
            if(dateString.indexOf(" ") > -1){
                time = dateString.split(" ")[1];
                dateString = dateString.split(" ")[0];
            }
            dateString = this.getDateFromString(dateString);
            var strDisplay = this.getFormatedTimeForIM(dateString);
            
            if(time!="")
                time = this._getFormattedTime(time,excludeSec);
            return (strDisplay+(excludeTime ? '' : " "+ time));
    },
    getFormatedFullDateTimeFromString : function(dateString,excludeTime) { 
        var time = "";
        if(dateString.indexOf(" ") > -1){
            time = dateString.split(" ")[1];
            dateString = dateString.split(" ")[0];
        }
        dateString = this.getDateFromString(dateString);
        var strDisplay = this.getFormatedDateString(dateString);
        
        if(time!="") {
            time = this._getFormattedTime(time,true);
        }
        return (strDisplay+(excludeTime ? '' : " "+ time));
    },
    getFormatedListRowTimeFromMillis : function(millis) { 
        if(!millis || millis == 0 || millis == "0") return "";
        var time = "";
        var dateString =  this.getStringFromDate(new Date(millis));
        if(dateString.indexOf(" ") > -1){
            time = dateString.split(" ")[1];
            dateString = dateString.split(" ")[0];
        }
        dateString = this.getDateFromString(dateString);
        var strDisplay = this.getFormatedTimeForIM(dateString);
        if(time != "") 
            time =  this._getFormattedTime(time,true);
        if(this.isToday(dateString)) {
            return time
        }
        if(this.checkCurrentWeek(dateString) == 0) {
            //Its current week so just pass Should be Mon, 14:20
            var ret = this.getFormatedWeekDate(dateString);
            return ret;
        }
        if(this.isInCurrentYear(dateString)) {
            var ret = this.getFormatedCurrentYearDate(dateString);
            return ret;
        }
        return this.getFormatedDate(dateString) +": "+time;
    },
    getFormatedRangeDateTimeFromString : function(dateFrom, dateTo) {
        var timeFrom = "";
        if(dateFrom.indexOf(" ") > -1){
            timeFrom = dateFrom.split(" ")[1];
            dateFrom = dateFrom.split(" ")[0];
        }
        if(timeFrom != "") 
            timeFrom =  this._getFormattedTime(timeFrom,true);
        var timeTo = "";
        if(dateTo.indexOf(" ") > -1){
            timeTo = dateTo.split(" ")[1];
            dateTo = dateTo.split(" ")[0];
        }
        if(timeTo != "") 
            timeTo =  this._getFormattedTime(timeTo,true);
        //dateFrom = this.getDateFromString(dateFrom);
        //dateTo = this.getDateFromString(dateTo);
        if(this.isSameDay(this.getDateFromString(dateFrom),this.getDateFromString(dateTo))) {
            return this.getFormatedDate(dateFrom,false,true) +", "+timeFrom+" to "+timeTo;
        } else {
            return this.getFormatedDate(dateFrom,false,true) +", "+timeFrom +" to "+this.getFormatedDate(dateTo,false,true) +", "+ timeTo;
        }
        
    },
    //Changed by Suresh
    getFormatedIMDateTimeFromMillis : function(millis,excludeSec) { 
                if(!millis || millis == 0 || millis == "0") return "";
                var time = "";
                var dateString =  this.getStringFromDate(new Date(millis));
                var oldDateString = dateString;
                if(dateString.indexOf(" ") > -1){
                    time = dateString.split(" ")[1];
                    dateString = dateString.split(" ")[0];
                }
                dateString = this.getDateFromString(dateString);
                var strDisplay = this.getFormatedTimeForIM(dateString);
                if(time != "") 
                    time =  this._getFormattedTime(time,excludeSec);
                // if(this.checkCurrentWeek(dateString) == 0) {
                //     //Its current week so just pass Should be Mon, 14:20
                //     var ret = this.getFormatedWeekDate(dateString) +", "+time;
                //     return ret;
                // }
                // if(this.isInCurrentYear(dateString)) {
                //     var ret = this.getFormatedCurrentYearDate(dateString)+", "+time;
                //     return ret;
                // }
                
                return this.getFormatedDateString(new Date(millis)) +" "+time;
    },
    
    getFormatedWeekDate : function(date) {
        var days = { "0":"Sun", "1":"Mon", "2":"Tue", "3":"Wed", "4":"Thu", "5":"Fri", "6":"Sat"};
        return days[date.getDay()]
    },
    getFormatedCurrentYearDate : function(date) {
        var month = {"1":"Jan","2":"Feb","3":"Mar","4":"Apr","5":"May","6":"Jun","7":"July","8":"Aug","9":"Sep","10":"Oct","11":"Nov","12":"Dec"};
        return month[date.getMonth()+1] +" "+date.getDate();
    },
    getParamFromUrl : function(url,name) {
            var val = decodeURI(
                (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1]
            );
            if(!val || val=="null")
            return null;
            else return val;
    },
    isHigherTime : function(s1,s2){
        
        if(!s1 || s1=="") return false;
        else if(!s2 || s2=="") return true;
        else if(s1==s2) return true;
        
        var d1=Utils.getDateFromString(s1);
        var d2 = Utils.getDateFromString(s2);
        if(d1.getTime() >= d2.getTime())
            return true;
        else return false;
    },
    encodeString :  function(s){
        s = encodeURIComponent(s);
        s = s.replace(/'/g, "%27");
        return s;
    },
    removeSpecialChars : function(s){
        var str="";
        str = s.replace(/[^a-zA-Z0-9!#$&()*+\-./:;@_\s]/g,''); //str = strV.replace(/[^a-zA-Z0-9-_,.@\s]/g,'');
        RDAdapter.log("returning after removing special chars ********************"+str);
        return str;
    },
    convertTimeStirngToServerFormat : function(s){
        var dt = s;
        if(dt.indexOf("/") >0) {
            dt = s.split("/").join("-");
        }
        return dt;
    },
    getDistanceFromLocation : function(lat1,lon1,lat2,lon2,maxDist) {
        if(!(lat1 && lon1 && lat2 && lon2)) {
            return "";
        }
        try {
            lat1 = parseFloat(lat1);
            lat2 = parseFloat(lat2);
            lon1 = parseFloat(lon1);
            lon2 = parseFloat(lon2);
            var R = 6371000; // metres
          var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
          var dLon = this.deg2rad(lon2 - lon1);
          var a = 
             Math.sin(dLat/2) * Math.sin(dLat/2) + 
             Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
             Math.sin(dLon/2) * Math.sin(dLon/2);

          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          var d = R * c; // Distance in km
            d= Math.round(d);
            if(d > 100000 && d <maxDist) {
                d = d/1000;
                d= Math.round(d);
                return d+" Km"
            } else if(d >1000 && d< maxDist) {
                d = d/100;
                d= Math.round(d);
                d = d/10;
                return d+" Km"
            } else if(d<maxDist){
                return d +" m";
            } else {
                return  "";
            }
        } catch(err) {
            top.RDAdapter.log(err);
            return "";
        }

    },
    deg2rad : function(deg) {
          return deg * Math.PI / 180
    },
    convertTimeToLocalTime : function(){
        var items = $(".convert-to-localtime");
        for(var i=0;i<items.length;i++){
            var $e = $(items[i]);
            var str = $e.attr("data-datestring");

            if(str){
                var dateObj = Utils.getDateFromString(str);

                var d = Utils.getFormatedIMDateTimeFromMillis(Utils.getCurrTimeMillisFromGMT(dateObj.getTime()),true);
                if(d){
                    $e.html(d);    
                }
                
            }
        }
    },
    shareUrlOnFacebook : function(url){
        if(FB)
        FB.ui({
          method: 'share',
          href: url,
        }, function(response){
            console.log("share response");
        });
    },
    bindForReportStoryDialog : function(){
        var eventClose=false;
        var scrollUp = false;
        var currentH=0;
        var scrolledOnce=false;
        // var options = {
        //     "title" : "Report video news or article",
        //     "message":"Liked what you read? Publish your own story on Hocalwire as its 100% citizen platform.",
        //     "actionOneLabel" : "Close",
        //     "actionTwoLabel" : "Publish Now",
        //     "type" : "confirm",
        //     "actionTwoCallback" : function(){
                
        //         window.open("http://user.hocalwire.com","_blank");
        //         }
        // };
        var showJoinNowDialog = function(){
            var showedDialog = Hocalwire.Services.GlobalService.getCookie("showed_join_dialog");
            if(showedDialog && showedDialog=="1"){ //show it only once in a week
                return;

            }
            var now = new Date();
            var time = now.getTime();
            time += 7*24*3600 * 1000;
            now.setTime(time);
            Hocalwire.Services.GlobalService.setCookie("showed_join_dialog","1",{"path":"/","expires":now.toUTCString()});
            var $el = $("#join-hocalwire-selector");
            $el.off("click",".js-close-cross");
            $el.on("click",".js-close-cross",function(){
                $.hidePopup();
            });
            $el.off("click",".js-register-now");
            $el.on("click",".js-register-now",function(){
                $.hidePopup();
                window.open("http://user.hocalwire.com","_blank");
                Hocalwire.Services.AnalyticsService.sendGAEvent("register","click","dialog");
            });
            $.openPopup("#join-hocalwire-selector");
        };
            var addEvent = function(obj, evt, fn) {
                if (obj.addEventListener) {
                    obj.addEventListener(evt, fn, false);
                }
                else if (obj.attachEvent) {
                    obj.attachEvent("on" + evt, fn);
                }
            };

            addEvent(document, "mouseout", function(event) {
                event = event ? event : window.event;
                var from = event.relatedTarget || event.toElement;
                if ( (!from || from.nodeName == "HTML") && event.clientY <= 2 ) {
                    if(!eventClose){
                        showJoinNowDialog();
                        eventClose=true;
                        scrollUp=true;
                    } 
                
                }
            });
            $(document).on("scroll",function(event){
                var currentScroll = $(window).scrollTop();
                if(!scrolledOnce){
                    scrolledOnce=true;
                    Hocalwire.Services.AnalyticsService.sendGAEvent("document","scroll","page");
                }
                if(currentScroll < currentH && !scrollUp){ //scroll up is used
                    showJoinNowDialog();
                    scrollUp=true;
                    eventClose=true;
                }
                currentH  = currentScroll;
            });
        
    },
    convertDistancePoint : function(){
        var success = function(point_lat,point_long){
            var items = $(".distance-point");
            for(var i=0;i<items.length;i++){
                var $e = $(items[i]);
                var lat = $e.attr("data-point_lat");
                var lng = $e.attr("data-point_long");

                var distance = Utils.getDistanceFromLocation(point_lat,point_long,lat,lng,(20*1000));
                if(distance){
                    $e.removeClass("hide");
                    $e.html(distance);
                }
            }
        }
        Utils.getMyLocationSilent(success);

    },
    getMyLocationSilent : function(success){
        var _getMyLocationFail = function () {
                _hideLoaders();
                // Utils.dialog({message:"We were unable to locate you as we do not have permission to access your location. Please enable your location and try again.", title : "Location detection disabled."});
            },

            _geoLocationNotSupported = function() {
                _hideLoaders();
                // Utils.dialog({message: "You browser doesn't support location detection.", title : "Location detection not supported."});
            },
            _getMyLocationSuccess = function(point, options) {
                    // Utils.dialog({message: "you location is:lat"+point.coords.latitude+"lng:"+point.coords.longitude, title : "Your cordinates"});      
                    _hideLoaders();
                    success(point.coords.latitude,point.coords.longitude);
            },
            
            _timeout = function () {
                _hideLoaders();
                // Utils.dialog({message: "It's taking too long to find out your location.", title : "Request timed out." });
            },
            _hideLoaders = function () {
                clearTimeout(Utils.timeoutId);
                Utils.timeoutId = 0;
                
            },
            _showLoaders = function () {
                // console.log("show loaders for location fetch")
            };

        _showLoaders();
        clearTimeout(Utils.timeoutId);
        Utils.timeoutId = setTimeout(_timeout, 10000);
        Utils.getDeviceCoordinates(_getMyLocationSuccess, _getMyLocationFail, _geoLocationNotSupported, {});
    },

};

Utils.init();
