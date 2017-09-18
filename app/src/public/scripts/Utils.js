/* global jwplayer */
"use strict";
var Utils = {
    loadOnVisible : [],
    loadScript : {"loadCount":0,callback:null,loaded:null},
    loadScriptAdvanced: {},
    firstTimeLoad : true,
    timeDiffWithServerInMillis : 0,
    
    
    playerScriptLoaded : false,
    
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
      
        for(var i=0;i<scriptsArray.length;i++){
            if(!scriptsArray[i]){
                scriptsArray.splice(i, 1);
                i--;
            }
        }
        Utils.loadScriptAdvanced[uniqueKey].totalRequired = scriptsArray.length;
        Utils.loadScriptAdvanced[uniqueKey].callback=options.callback;
        var require = function (scriptsArray, uniqueKey) {
            for (var i = 0; i < scriptsArray.length; i++) {
                if(scriptsArray[i]){
                    writeScript(scriptsArray[i], uniqueKey);
                }
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
                s.src = src+(options.version ? ((src.indexOf("?")>-1 ? "&" : "?")+"version="+options.version) : "");
                s.setAttribute("data-key", key);
            } else {
                src = src + (options.version ? ( (src.indexOf("?")>-1 ? "&" : "?")+"version="+options.version) : "");
                s=document.createElement("link");
                s.setAttribute("rel", "stylesheet");
                s.setAttribute("type", "text/css");
                s.setAttribute("href", src);
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
    
    },
    getStringFromDate :  function(d,excludeTime) { 
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
    getStringFromDateHiphen :  function(d,excludeTime) { 
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
        return (year+"-"+month+"-"+date+(excludeTime ? "" : " " +hh+":"+mm+":"+ss));

    },
    
    getDateFromString : function(dateString) { 
        var x = dateString.indexOf(".");
        if(x>-1){
            dateString = dateString.substring(0,x);
        }
        var s = dateString.split("-").join("/");
        return new Date(s);
    },
    
    getCurrTimeMillisFromGMT : function(millis,considerTimeDiff) { 
        return this.convertDateFromGMTDate(new Date(this.parseInt(millis)),considerTimeDiff).getTime();
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
    
    
    
    //Changed by Suresh
    getFormatedIMDateTimeFromMillis : function(millis,excludeSec,timeOnly,dateOnly) { 
                if(!millis || millis == 0 || millis == "0") return "";
                var time = "";
                var dateString =  this.getStringFromDate(new Date(millis));
                var oldDateString = dateString;
                if(dateString.indexOf(" ") > -1){
                    time = dateString.split(" ")[1];
                    dateString = dateString.split(" ")[0];
                }
                dateString = this.getDateFromString(dateString);
                if(time != "") 
                    time =  this._getFormattedTime(time,excludeSec);
                if(timeOnly){
                    return time;
                } else if(dateOnly){
                    return this.getFormatedDateString(new Date(millis));
                }else {
                    return this.getFormatedDateString(new Date(millis)) +" "+time;    
                }
                
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
   
    convertTimeToLocalTime : function(){
        var items = $(".convert-to-localtime");
        for(var i=0;i<items.length;i++){
            var $e = $(items[i]);
            var str = $e.attr("data-datestring");
            var timeOnly = $e.hasClass("time-only");
            var dateOnly = $e.hasClass("date-only");
            var useColon = $e.hasClass("use-colon");
            var timeAsDuration = $e.hasClass("time-as-duration");
            if(str){
                var dateObj = Utils.getDateFromString(str);
                var d;
                if(timeAsDuration){
                    var t1 = Utils.getCurrTimeMillisFromGMT(dateObj.getTime());
                    d = Utils.convertTimeAsDuration(new Date(t1));
                } else {
                    d = Utils.getFormatedIMDateTimeFromMillis(Utils.getCurrTimeMillisFromGMT(dateObj.getTime()),true,timeOnly,dateOnly);
                }
                 
                if(d){
                    if(useColon){
                        d = d+":";
                    }
                    $e.html(d);    
                }
                
            }
        }

        $(".shareTrigger").click(function(){
            var $ul = $(this).parent();
            $ul.toggleClass("width_full");
            $(this).nextAll().toggle();
        }); 
        
    },
    bindForFullScreenElement : function(){
        
        $("#go-full-screen").on("click",function(){
            $("#pdf").toggleClass('fullscreen'); 
            $(this).addClass("hide");
            $("#hide-full-screen").removeClass("hide");
        });
        $("#hide-full-screen").on("click",function(){
            $("#pdf").toggleClass('fullscreen'); 
            $(this).addClass("hide");
            $("#go-full-screen").removeClass("hide");
        });
    },
    getMyLocation : function(options){
        var _getMyLocationFail = function (e) {
                console.log("my location failed");
                console.log(e);
                _hideLoaders();
                if(options.error){
                    options.error({"message":"Location fetch failed.","code":-1});
                }        
            },

            _geoLocationNotSupported = function(e) {
                console.log("my location not supported ");
                console.log(e);
                _hideLoaders();
                if(options.error){
                    options.error({"message":"You browser doesn't support location detection.","code":-2});
                } 
            },
            _getMyLocationSuccess = function(point, options) {
                console.log("my location success");
                console.log(point);
                    if(options.success){
                        var cord={"latitude":point.coords.latitude,"longitude":point.coords.longitude};
                      options.success(cord);
                    } 
                    _hideLoaders();
            },
            
            _timeout = function (e) {
                console.log("my location timeout");
                console.log(e);
                _hideLoaders();
                if(options.error){
                    options.error({"message":"It's taking too long to find out your location.","code":-3});
                } 
            },
            _hideLoaders = function () {
                clearTimeout(Utils.timeoutId);
                Utils.timeoutId = 0;
                if(options.hideLoaders){
                    options.hideLoaders();
                } 
                
            },
            _showLoaders = function () {
                if(options.showLoders){
                    options.showLoders();
                } 
            };

        _showLoaders();
        clearTimeout(Utils.timeoutId);
        Utils.timeoutId = setTimeout(_timeout, 100000);
        options.timeout= 30000;
        options.enableHighAccuracy=true;
        options.maximumAge = 75000;
        Utils.getDeviceCoordinates(_getMyLocationSuccess, _getMyLocationFail, _geoLocationNotSupported, options);
    },
     getDeviceCoordinates : function(successCallback, errorCallback, geolocationNotSupportedCallback, options) {
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition (function(point) {
                successCallback(point, options); }, errorCallback);
        } else {
            geolocationNotSupportedCallback();
        }
    },
    timeoutId : 0,
    loadScriptAsyncAdWithDocumentWrite : (function(){            // by Frank Thuerigen
             // private 

             var dw = document.write,              // save document.write()
                      myCalls = [],                // contains all outstanding Scripts
                      t = '';                      // timeout
             
             function startnext(){                 // start next call in pipeline
              if ( myCalls.length > 0 ) {
               if ( Object.watch ) console.log( 'next is '+myCalls[0].f.toString() );
               myCalls[0].startCall();
               }
              }

             function evals( pCall ){            // eval embedded script tags in HTML code
              var scripts = [],
                  script,
                  regexp = /<script[^>]*>([\s\S]*?)<\/script>/gi;
              while ((script = regexp.exec(pCall.buf))) scripts.push(script[1]);
              scripts = scripts.join('\n');
              if (scripts) {
               eval(scripts);
               }
              }

             function finishCall( pCall ){
               pCall.e.innerHTML = pCall.buf;             // write output to element
               evals( pCall );
               document.write=dw;                        // restore document.write()
               myCalls.shift();
               window.setTimeout( startnext, 50 );
               }

             function testDone( pCall ){
               var myCall = pCall;
               return function(){
                if ( myCall.buf !== myCall.oldbuf ){
                 myCall.oldbuf = myCall.buf;
                 t=window.setTimeout( testDone( myCall ), myCall.ms );
                 }
                else {
                 finishCall( myCall );
                 }
                }
               }  
               
             function MyCall( pDiv, pSrc, pFunc ){                    // Class
              this.e = ( typeof pDiv == 'string' ? 
                         document.getElementById( pDiv ) :
                         pDiv ),                     // the div element
              this.f = pFunc || function(){},
              this.stat = 0,                         // 0=idle, 1=waiting, 2=running, 3=finished
              this.src = pSrc,                       // script source address
              this.buf = '',                         // output string buffer
              this.oldbuf = '',                      // compare buffer
              this.ms = 100,                         // milliseconds
              this.scripttag;                        // the script tag 
              }
             
             MyCall.prototype={
              startCall: function(){
               this.f.apply( window );                 // execute settings function
               this.stat=1;
               var that = this;                            // status = waiting
               document.write = (function(){
                var o=that,
                    cb=testDone( o ),
                    t;
                return function( pString ){            // overload document.write()
                 window.clearTimeout( t );
                 o.stat=2;                             // status = running
                 window.clearTimeout(t);
                 o.oldbuf = o.buf;
                 o.buf += pString;                     // add string to buffer
                 t=window.setTimeout( cb, o.ms );
                 };
                })();
               var s=document.createElement('script');
               s.setAttribute('language','javascript');
               s.setAttribute('type','text/javascript');
               s.setAttribute('src', this.src);
               document.getElementsByTagName('head')[0].appendChild(s);
               }
              }
              
             return function( pDiv, pSrc, pFunc ){  // public
              var c = new MyCall( pDiv, pSrc, pFunc );
              myCalls.push( c );
              if ( myCalls.length === 1 ){
               startnext();
               }
              }
    })(),
    initPopup : function(content,options,callback){
        options = options || {};
        if(options.desktopOnly && !Hocalwire.isDesktopSize){
            return;
        }
        $(".popup.js__popup #popup_content").html(content);
        $(".js__p_start").simplePopup();
        $(".js__p_start").trigger("click");
    },
    convertTimeAsDuration: function(then){
        var rightNow = new Date();
        var diff = rightNow - then;

        var second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;
        var z = Math.floor(diff / day);
        if(z< 30){
        if (isNaN(diff) || diff < 0) {
            return "";
        }

        if (diff < second * 2) {
            return "right now";

        }

        if (diff < minute) {
            return Math.floor(diff / second) + " seconds ago";
        }

        if (diff < minute * 2) {
            return "about 1 minute ago";
        }

        if (diff < hour) {
            return Math.floor(diff / minute) + " minutes ago";
        }

        if (diff < hour * 2) {
            return "about 1 hour ago";
        }

        if (diff < day) {             
            return  Math.floor(diff / hour) + " hours ago";         
        }           
        if (diff > day && diff < day * 2) {
            return "yesterday";
        }

        if (diff < day * 365) {
            return Math.floor(diff / day) + " days ago";
        }
        }
        else {
            return this.getFormatedDateString(new Date(then));

        }
        
    },
    distance : function(lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist
    },
    getCurrentLocation : function(callback){
        return new Hocalwire.Promise(function(resolve, reject){
            var ifr = document.createElement('iframe');
            ifr.style.opacity = '0';
            ifr.style.pointerEvents = 'none';
            ifr.src = "https://hocalwire.com/get-geo?v="+(new Date().getTime()); // the previous html code.

            document.body.appendChild(ifr);

            ifr.contentWindow.addEventListener('message', function(message){
              message = JSON.parse(message.data);
              if(message.type === 'success'){
                resolve(message.data);
              } else {
                reject(message.data);
              }
              document.body.removeChild(ifr);
            });
          });
    },
    loaderTimeoutId : 0,
    getLoader : function(){
        var d = '<style>.temp_loader { position: fixed;width: 100%;top: 0px;height: 100%;background: #000;opacity: 0.6;z-index: 9999999;} .temp_loader .loader_img { background: #fff;top: 50%;left: 50%;position: absolute;margin-left: -20px;margin-top: -20px;padding: 20px;}</style><div class="temp_loader"><div id="modal-content" class="loader_img"><img src="/images/fancybox_loading.gif"></div></div>';
        return d;
    },
    showLoader : function(timeout){
        var hasLoader = $(".temp_loader");
        if(!hasLoader.length){
            var divLoader = this.getLoader();
            $("body").append($(divLoader));
            
        } 
        $(".temp_loader").removeClass("hide");
        if(timeout){
            if(this.loaderTimeoutId){
                clearTimeout(this.loaderTimeoutId);
            }
            this.loaderTimeoutId = setTimeout(function(){$(".temp_loader").addClass("hide");},timeout);
        }
    },
    hideLoader : function(){
        $(".temp_loader").addClass("hide");
        clearTimeout(this.loaderTimeoutId);
    },
    showModalForIframe : function(url){
        var hasLoader = $(".temp_loader");
        if(!hasLoader.length){
            var divLoader = this.getModal();
            $("body").append($(divLoader));
            
        } 
        $(".modal_wrapper_frame").removeClass("hide");
        if(url){
            $(".modal_wrapper_frame .data-iframe").attr("src",url);
        }
        $(".modal_wrapper_frame .cross-btn").off("click");
        $(".modal_wrapper_frame .cross-btn").on("click",function(){
            Utils.sendGaEvent("pop-up","click","close");
            $(".modal_wrapper_frame").addClass("hide");
        });

        return $(".modal_wrapper_frame");
    },
    getModal : function(){
        var d = '<div class="modal_wrapper_frame"><div id="modal-content"><a class="cross-btn"> X </a><iframe class="data-iframe"></iframe></div></div>';
        return d;
    },
    sendGaEvent : function(category,action,label,val){
            val = val || 0;
            label = label.toUpperCase();
            if(window.ga){
                window.ga('send', 'event', category, action, label,val);
                window.ga('common.send', 'event', category, action, label,val);    
                window.ga('common2.send', 'event', category, action, label,val);    
            }
            
    },
    initTracking : function(){

        //track-change, track-click, track-focus, track-scroll, track-display
        var $p = $("body");
        var partner = $p.find("#content").data("partner");
        $p.on("change",".track-change",function(e){
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            Utils.sendGaEvent(category,"change",label);
            // var label = 
        });
        $p.on("click",".track-click",function(e){
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            Utils.sendGaEvent(category,"click",label);
        });
        $p.on("focus",".track-focus",function(e){
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            Utils.sendGaEvent(category,"focus",label);
        });
        


    },
    initHocalAdClickTracking : function(){
        var $p = $("body");
        var partner = $p.find("#content").data("partner");
        $p.on("click",".image-ad-unit",function(e){
            var clickedAlready = Hocalwire.Services.GlobalService.getCookie("_NADI_AD_UNIT_CLICKED_");
            var isUniuque = !clickedAlready;
            var val = isUniuque ? 1 : 0;
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            var action = "img-ad-click-"+partner;
            if(window.ga){
                window.ga('send', 'event', category, action, label,val);
                window.ga('common.send', 'event', category, action, label,val);    
                window.ga('common2.send', 'event', category, action, label,val);    
            }
            var ip = elem.data("ip");
            if(window.ga){
                var labelnew = "ip-track-"+ip;
                window.ga('send', 'event', category, action, labelnew,val);
                window.ga('common.send', 'event', category, action, labelnew,val);    
                window.ga('common2.send', 'event', category, action, labelnew,val);    
            }
            var clickedCount = isUniuque ? 1 : parseInt(clickedAlready)+1;
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_CLICKED_",clickedCount,{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_LOADED_","1",{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
        });
        $p.on("click",".video-ad-unit",function(e){
            var clickedAlready = Hocalwire.Services.GlobalService.getCookie("_NADI_AD_UNIT_CLICKED_");
            var isUniuque = !clickedAlready;
            var val = isUniuque ? 1 : 0;
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            var action = "video-ad-click-"+partner;
            if(window.ga){
                window.ga('send', 'event', category, action, label,val);
                window.ga('common.send', 'event', category, action, label,val);    
                window.ga('common2.send', 'event', category, action, label,val);    
            }
            var ip = elem.data("ip");
            if(window.ga){
                var labelnew = "ip-track-"+ip;
                window.ga('send', 'event', category, action, labelnew,val);
                window.ga('common.send', 'event', category, action, labelnew,val);    
                window.ga('common2.send', 'event', category, action, labelnew,val);    
            }
            var clickedCount = isUniuque ? 1 : parseInt(clickedAlready)+1;
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_CLICKED_",clickedCount,{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_LOADED_","1",{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
        });
        $p.on("click",".recommended-content-popup-item",function(e){
            var clickedAlready = Hocalwire.Services.GlobalService.getCookie("_NADI_AD_UNIT_CLICKED_");
            var isUniuque = !clickedAlready;
            var val = isUniuque ? 1 : 0;
            var elem = $(this);
            var label = elem.data("label");
            var category = elem.data("category");
            var action = "pop-ad-click-"+partner;
            if(window.ga){
                window.ga('send', 'event', category, action, label,val);
                window.ga('common.send', 'event', category, action, label,val);    
                window.ga('common2.send', 'event', category, action, label,val);    
            }
            var ip = elem.data("ip");
            if(window.ga){
                var labelnew = "ip-track-"+ip;
                window.ga('send', 'event', category, action, labelnew,val);
                window.ga('common.send', 'event', category, action, labelnew,val);    
                window.ga('common2.send', 'event', category, action, labelnew,val);    
            }
            var clickedCount = isUniuque ? 1 : parseInt(clickedAlready)+1;
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_CLICKED_",clickedCount,{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
            Hocalwire.Services.GlobalService.setCookie("_NADI_AD_UNIT_LOADED_","1",{"path":"/","expires":new Date(new Date().getTime())+(24*7*60*60*1000)});
        });
        
    },
    init : function(){
        this.initTracking();
        this.initHocalAdClickTracking();
        $(window).resize( function() {
            // Utils.myOrientResizeFunction();
            var event = new CustomEvent("WINDOW_RESIZED", { "detail": "WINDOW_IS_RSIZED" });
            document.dispatchEvent(event);
        });
        this.myOrientResizeFunction();
    },
    getUrlVars : function() {
        var vars = {}, hash;
        var query_string = window.location.search;

        if (query_string) {
            var hashes = query_string.slice(1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars[hash[0]] = hash[1];
            }

            return vars;
        } else {
            return false;
        }
    },
    bin2dec : function(num){
        return num.split('').reverse().reduce(function(x, y, i){
          return (y === '1') ? x + Math.pow(2, i) : x;
        }, 0);
    },
    destroySlider : function(slider){
        
        if(!slider.length){
            return false;
        }
        
        if(slider.lightSlider && slider.attr("data-initialized")=="true"){
            var e = slider.clone();
            var wrapper = $("#right-section-light-slider");
            // $('#rightsection_slider').attr("data-initialized","true");
            slider.lightSlider().destroy();
            slider.find(".lSAction a").off("click");
            wrapper.html(e);
            e.attr("class","");
            var ch = e.children();
            if(ch.length>0){
                for(var i=0;i<ch.length;i++){
                    $(ch[i]).removeClass("lsslide").removeClass("active");
                }
            }
        }
        return true;

    },
    initLightslide  : function(elementHeight){
        var $parent = $("#rightsection_slider");
        var $e = $("#leftelement_slider").clone();
        $e.removeClass("big_img").addClass("small_img");
        $e.removeClass("big-img").addClass("small-img").removeClass("feat-top2-left").addClass("feat-top2-right");
            
        $("#leftelement_slider").parent().remove();
        $parent.prepend($e);
        $('#rightsection_slider div').removeClass('small_img').removeClass("small-img");
        $('.news_category_description').css({"bottom":"10px"});
        var result = this.destroySlider($parent);
        if(result){
            $('#rightsection_slider').lightSlider({
                item:1,
                slideMargin: 5,
                speed: 500,
                auto: true,
                loop: true,
                slideMove:1,
                mode: "fade",
                verticalHeight: elementHeight,
            });   
            $('#rightsection_slider').attr("data-initialized","true");
        }
        
    },
    myOrientResizeFunction  : function(){

        var current_width = $(window).width();
        if(current_width < 800){
            var height = $(".hocal_big_image_wrapper").css("height");
            var height_small = parseInt(height, 10);
            var temp_height = height_small;
            height_small = (height_small/2)-7;
            height_small = height_small+"px";
            $('.hocal_small_image_wrapper').css('height',height_small);
            $('.hocal_small_image_wrapper').css('max-height',height);
            this.initLightslide(temp_height);
            
        } else{
                var slider = $('#rightsection_slider');
                this.destroySlider(slider);
        }
            
    }
    

};
