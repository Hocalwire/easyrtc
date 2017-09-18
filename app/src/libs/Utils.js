/**
 * [exports description] Utils class used on server
 * @type {Object}
 */

"use strict";
var Constants = require("src/locales/Constants");
var mobileAgent = require('mobile-agent');
var app;
var logger = require('src/libs/logger');
var PartnerConfig = require("src/config/PartnerConfig");
var Q = require("q");
var fs = require("fs");
var jsonfile = require("jsonfile");
var LineByLineReader = require('line-by-line');
var Promise = require('promise');
var extend = require("extend");
module.exports = {
    clientConstants : {
        "url" : {
            "xhrLogin" : "/xhr/admin/login/loginUser",
            "xhrRegister" : "/xhr/admin/login/registerUser",
            "xhrVerify" : "/xhr/admin/login/verifyUser",
            "xhrVerifyEmail" : "/xhr/admin/login/verifyEmail",
            "xhrForgotPassword" : "/xhr/admin/login/forgotPassword",
            "xhrResetPassword" : "/xhr/admin/login/reset-password",
            "xhrLogout" : "/xhr/admin/login/logout",
            "xhrRegenerateEmailCode" : "/xhr/admin/login/regenerateEmailCode"
        }
    },
    visitorscount : {},
    userLocations : {},
    writeDataToFile : function(file,data,callbackfunction){
        fs.writeFile(file, data, function (err) {
            if(err){
                console.log("error in writing to file");
            }
            if(callbackfunction){
                callbackfunction();    
            }
            console.log("written entry in file"+data);
            
        });
    },
    setupVisitorCounter : function(){
        var fileName = "src/data/visitorscount.json";
        var that = this;
        jsonfile.readFile(fileName, function(err, obj) {
            console.log(err);
            var data;
            if(err){
                console.log("error in reading JSON file***************");
                // return;
                data = {};
            } else {
                data = obj.data;
            }
           
          for(var k in data){
            var visitors = data[k];
            that.visitorscount[k] = data[k];
            console.log("K::::"+k+"    count:"+that.visitorscount[k]);
          }
          that.updateVisitorsCount();
          
        });
        
    },
    createIfFileDoesNotExist : function(fileName,partner,localdata,callbackfunction){
            fs.exists(fileName, function (exists) {
                if(exists)
                {
                    callbackfunction(localdata,partner);
                }else
                {
                    fs.writeFile(fileName, "", function (err, data) 
                    { 
                       callbackfunction(localdata,partner);
                    });
                }
            });
    },
    saveLocations : function(callbackfunction){
        // console.log("Save locations called");
        // console.log(this.userLocations);

        var that=this;
        for(var k in this.userLocations){
            var plocation = this.userLocations[k];
            // console.log(plocation);
            if(!plocation){
                plocation=[];
                this.userLocations[k]=plocation;
            }
            var partner = k;
            var fname="src/data/location_"+k+".txt";
            that.createIfFileDoesNotExist(fname,partner,plocation,function(locData,partner){
                var data = "";
                for(var i=0;i<locData.length;i++){
                    var l = "lat: "+locData[i].lat+" lng: "+locData[i].lng;
                    data = data+l+"\n";
                }
                fs.appendFile(fname, data, function (err) {
                    if(err){
                        return;
                    }
                    that.userLocations[partner]=[];
                });
            
            });
        }       
                
    },
    timeoutId : 0,
    addLocation : function(lat,lng,partner){
        if(!lat || !lng){
            return;
        }
        var location = this.userLocations[partner];
        if(!location){
            location=[];
            this.userLocations[partner]=location;
        }

        this.userLocations[partner].push({"lat":lat,"lng":lng});
    },
    getVisitorsLocations : function(partner){
        var that=this;

        var promise  = new Promise(function(resolve,reject){
           
            var fname="src/data/location_"+partner+".txt";
            var plocation = that.userLocations[partner];
            var lines = [];
            that.createIfFileDoesNotExist(fname,partner,plocation,function(locData,partner){
                    var lr = new LineByLineReader(fname);

                    lr.on('error', function (err) {
                        reject([]);
                    });

                    lr.on('line', function (line) {
                        var l = line;
                        l = l.replace("lat:","");
                        l = l.replace("lng:","=");
                        var a = l.split("=");
                        if(a.length>1){
                            var lat = a[0].trim();
                            var lng = a[1].trim();
                            lines.push({"lat":lat,"lng":lng});
                        }
                    });

                    lr.on('end', function () {
                        resolve(lines);                        
                    });

                
            });
        });
        
        return promise;  
                
    },
    updateVisitorsCount : function(){
        var fileName = "src/data/visitorscount.json";
        var data = ' { "data": { ';
        for(var k in this.visitorscount){
            data = data+'"'+k+'":"'+this.visitorscount[k]+'",';
        }
        if(data.lastIndexOf(",")==data.length-1){
            data=data.substring(0,data.length-1);
        }
        data = data + " } }";
        var that = this;
        if(this.timeoutId){
            clearTimeout(this.timeoutId);
        }
        this.writeDataToFile(fileName,data,function(){
        });
        that.saveLocations();
        this.timeoutId = setTimeout(function(){
            that.updateVisitorsCount();
            that.saveLocations();
        },(10*60*1000));
    },
    increaseVisitorsCounter : function(req,res,next){
        var partner = req.partner;
        var count  = this.visitorscount[partner]?parseInt(this.visitorscount[partner])+1 : 1;
        if(!this.visitorscount[partner]){
            this.visitorscount[partner]={};
        }
        this.visitorscount[partner]=count;

    },
    getVisitorsCount : function(partner){
        var count  = this.visitorscount[partner]?parseInt(this.visitorscount[partner]) : 1;
        if(!this.visitorscount[partner]){
            this.visitorscount[partner]={};
        }
        this.visitorscount[partner]=count;  
        return count;      
    },
    setup: function(expressApp) {
        app = expressApp;
        if(app.get('env')=="development"){
         
        } else {
            this.setupVisitorCounter(); 
        }
        
    },
    yearEpoch : 3,
    officeAddress : 'Hocalwire -  Indirapuram',

    getVideoPlaceHolderImage : function(){
        return  "/images/video-placeholder.jpg";
    },
    formatDate: function( date, format ) {
        return require('dateformat')(date, format);
    },

    compareDate: function(date1, date2, period) {
        date1 = new Date(date1);
        date2 = new Date(date2);

        var isYearSame = date1.getYear() === date2.getYear();
        var isMonthSame = date1.getMonth() === date2.getMonth();
        var isDateSame = date1.getDate() === date2.getDate();

        if (period === "year") {
            return isYearSame;
        } else if (period === "month") {
            return isMonthSame && isYearSame;
        } else if (period === "date") {
            return isDateSame && isMonthSame && isYearSame;
        } else {
            return date1.getTime() === date2.getTime();
        }
    },

    
    getDateStringFromMillis : function(millis,includeDate,getGMT) {
        if ( !getGMT ) {
            //  add five an an half hour
            millis += ( 5.5 * 60 * 60 * 1000 );
        }
        var d=new Date(millis),
            year = (d.getFullYear() +"").substr(2,4),
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

        if(includeDate){
            return d.getDate() + " "+ months[d.getUTCMonth()]+"'"+year;
        }
        return months[d.getUTCMonth()]+"'"+year;
    },

    

    
    isBot : function(req){
        var userAgent = req.headers["user-agent"];
        logger.info("useragent is:"+userAgent);
        if(userAgent) {
            userAgent=userAgent.toLowerCase();
        }
        var botDetected=false;
        if(userAgent.indexOf("facebook")>-1 || userAgent.indexOf("facebot")>-1){ //FACEBOOK BOT
            botDetected=true;
        }
        else if(userAgent.indexOf("twitterbot") >-1){ //twitter bot
            botDetected=true;
        }
        else if(userAgent.indexOf("googlebot")>-1){ //google bot
            botDetected=true;
        }
        else if(userAgent.indexOf("bingbot")>-1){
            botDetected=true;
        }
        else if(userAgent.indexOf("metauri")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("exabot")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("yahoo")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("google")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("dlvr")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("hootsuit")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("istellabot")>-1){ //extenral bot
            botDetected=true;
        }
        else if(userAgent.indexOf("bot")>-1){ //extenral bot
            botDetected=true;
        }


        return botDetected;
    },
    isFBBot : function(req){
        var userAgent = req.headers["user-agent"];
        logger.info("useragent is:"+userAgent);
        if(userAgent) {
            userAgent=userAgent.toLowerCase();
        }
        var botDetected=false;
        if(userAgent.indexOf("facebook")>-1 || userAgent.indexOf("facebot")>-1){ //FACEBOOK BOT
            botDetected=true;
        }
        
        return botDetected;
    },

    isAndroid : function(req) {
        try{
            return !!mobileAgent(req.headers["user-agent"]).Android;
        }catch(e){
            logger.error("exception in getting Utils.isAndroid"+e.message+" user agent"+req.headers['user-agent']);
            return false;
        }
    },

    isIOS: function(req) {
        try{
            return !!mobileAgent(req.headers["user-agent"]).iOS;
        } catch(e){
            logger.error("exception in getting Utils.isIOS"+e.message+" user agent"+req.headers['user-agent']);
            return false;
        }
    },

    isAndroidGB : function(req) { // Is app supported >= 2.3
        try{
            var androidVersion = mobileAgent(req.headers["user-agent"]).Android;
            var versionFloatValue;

            if (androidVersion) {

                if (!isNaN(parseInt(androidVersion))) {
                    versionFloatValue = parseFloat(mobileAgent(req.headers['user-agent']).Android
                        .split('.').slice(0,2).join('.'));
                } else {
                    // just to ensure, this function returns true
                    versionFloatValue = 2.3;
                }
            }

            return (androidVersion && versionFloatValue >= 2.3);
        }catch(e){
            logger.error("exception in getting Utils.isAndroidGB"+e.message+" user agent"+req.headers['user-agent']);
            return false;
        }
    },

    isIOS7OrGreater: function(req) {
        try{
            var iOSVersion = mobileAgent(req.headers["user-agent"]).iOS;
            var versionFloatValue;

            if (iOSVersion) {
                versionFloatValue = parseFloat(mobileAgent(req.headers['user-agent']).iOS
                    .split('.').slice(0,2).join('.'));
            }

            return (iOSVersion && versionFloatValue >= 7.0);
        }catch(e){
            logger.error("exception in getting Utils.isIOS7OrGreater"+e.message+" user agent"+req.headers['user-agent']);
            return false;
        }
    },

    isAndroidLessThan3 : function(req) {
        try{
            var androidVersion = mobileAgent(req.headers["user-agent"]).Android;
            var versionFloatValue;

            if (androidVersion) {
                if (!isNaN(parseInt(androidVersion))) {
                    versionFloatValue = parseFloat(mobileAgent(req.headers['user-agent']).Android
                        .split('.').slice(0,2).join('.'));
                } else {
                    // just to ensure, this function returns false
                    versionFloatValue = 4.4;
                }
            }

            return (androidVersion && versionFloatValue < 3.0);
        }catch(e){
            logger.error("exception in getting Utils.isAndroidLessThan3"+e.message+"  user agent"+req.headers['user-agent']);
            return false;
        }
    },

   
    /**
     * Change array to a readable format
     * e.g. [1,2,3] => 1, 2 & 3
     * @param  {Array} array
     * @param  {String} [join=','] The string between two array values
     * @param  {String} finalJoin String between last and second last value
     * @return {String} String format of array
     */
    niceFormattedList: function(array, join, finalJoin) {
        array = array.sort();
        var arr = array.slice(0, array.length - 1),
            last = array.pop();
        join = join || ', ';
        finalJoin = finalJoin || ' & ';

        var firstPart = arr.join(join);
        if (firstPart) {
            firstPart = firstPart + " & ";
        }

        return firstPart + last;
    },

    formatFloatValue : function(value,toFixedSize){
        if(!toFixedSize){
            toFixedSize = 1;
        }

        return parseFloat(value).toFixed(toFixedSize);
    },

    /**
     * capitalize first letter and then followed by lower letters
     * @param  {String} str
     * @return {String} modified word
     */
    firstCapitalize: function(str) {
        if (!str) { return ''; }

        str = str.toString();

        return str.substr(0, 1).toUpperCase() + str.substr(1);
    },
    /**
     * capitalize first letter and then followed by lower letters
     * @param  {String} str
     * @return {String} modified word
     */
    firstCapitalizeSentence: function(str) {
        if (!str) { return ''; }

        var a = str.split(" ");
    	var na = [];
    	for(var i=0;i<a.length;i++){
    		na.push(this.firstCapitalize(a[i]));
    	}
    	return na.join(" ");
    },
    formatNumber : function(value, roundOffToDigits){
        var val = parseFloat(value).toFixed(roundOffToDigits);
        if(isNaN(val)){
            val = 0;
        }
        if(parseFloat(val) >= 1000) {
            var indexOfDecimal = val.indexOf('.');
            if(indexOfDecimal > 0) {
                val = val.slice(0,indexOfDecimal-3) + ',' +val.slice(indexOfDecimal -3);
            } else {
                val = val.slice(0,-3) + ',' +val.slice(-3);
            }

        }
        return val;
    },
    getAMPStoryData : function(data){
        var story = data.story;
        // story = this.trimSentence(story,story.length).finalString;
        story=story.split("style=").join("data-style=");
        story=story.split("<img").join('<amp-img layout="responsive" width="375" height="225"');
        story=story.split("size=").join("data-size");
        story=story.split("<font").join("<div");
        story=story.split("</font").join("</div");
        for(var i=1;i<5;i++){
            var checkstring = 'inside_post_content_ad_'+i;
            if(data['ampAds'] && data['ampAds'][checkstring]){
                if(data['ampAds'][checkstring]['adType']=="adsense"){
                    
                    var index = story.indexOf(checkstring);
                    var len = checkstring.length;

                    if(index>-1){
                        var s = story.slice(0, index+len+2) + data['ampAds'][checkstring]['content'] + story.slice(index+len+2);
                        // story = story.replace('inside_post_content_ad_'+i+'">','inside_post_content_ad_'+i+'">'+data['ampAds']['inside_post_content_ad_'+i]['content']);    
                        story=s;
                    }
                    
                    
                } else {
                    // var iframe = "amp-iframe(width='500', height='281', layout='responsive', sandbox='allow-scripts allow-same-origin allow-popups', allowfullscreen='', frameborder='0', src='#{env.rootUrl}/xhr/admin/loadAdIframe?elementId=ad_level_1')";
                    // story.replace('inside_post_content_ad_'+i+'">','inside_post_content_ad_'+i+'">'+data['ampAds']['inside_post_content_ad_'+i]['content']);
                    
                }
            }
            
        }
        return story;
    },
    /**
     * Removes all the HTML tags from raw string and returns the filtered strings
     * @param  {String} sentence The HTML string that needs trimming
     * @param  {Integer} trimToLength The length to which the trim string needs to be restricted to
     * @param  {String} appendString Append this string in case the trimmed string is longer than `trimToLength`
     * @return {Object} Object contains `finalString` and the boolean `showMore` which indicates
     * whether showMore link is required or not
     */

    trimSentence : function(sentence, trimToLength, appendString) {

        if(!sentence) return "";
        // console.log(sentence);
        trimToLength = trimToLength - 1;
        var count = 0,
            finalString = '',
            ignoreText = false,
            chars = '',
            showMore = false;
        appendString = appendString || '...';
        var isHTMLComment=false;
        while((ignoreText || finalString.length <= trimToLength) && count !== sentence.length) {
            
            chars = sentence.charAt(count);
            
            if(count<sentence.length-4 && sentence.charAt(count)=="<" && sentence.charAt(count+1)=="!" && sentence.charAt(count+2)=="-" && sentence.charAt(count+3)=="-"){
                isHTMLComment=true;
            }
            if(count<sentence.length && sentence.charAt(count)==">" && sentence.charAt(count-1)=="-" && sentence.charAt(count-2)=="-"){
                isHTMLComment=false;
            }

            if(chars === '<'){
               ignoreText = true;
            }
            else if(chars === '>'){
              ignoreText = false;
            }
            else if(!ignoreText && !isHTMLComment){
                finalString = finalString + chars;
            }

            count ++;
        }
        if(finalString.length > trimToLength && count !== sentence.length){
            finalString = finalString + appendString;
            showMore = true;
        }
        
        return { 'finalString': this.replaceHtmlEntities(finalString), 'showMore' : showMore };
    },
    isIgnoredTag : function(index,story,openType,ignoreTags){
            if(!ignoreTags){
                ignoreTags = ["blockquote","a","h1","h2"];
            } 
          var chars = story.charAt(index);
          var matched = false;
          var tagf = "";
           for(var i=0;i<ignoreTags.length;i++){
                var tag = ignoreTags[i];
                if(story.length>(index+tag.length+1)){
                    var str = "";
                    if(openType) {
                        str = story.substring(index,index+tag.length+1);
                    } else {
                        str = story.substring(index,index+tag.length+2);
                    }
                    if(openType){
                        if(str=="<"+tag){
                         return tag;
                        }
                    } else {
                        if(str==tag+"/>"){
                         return true;
                        }
                    }
                    
                }
                
                
           }
           return false;
    }, 
    checkIfIgnoredTag : function(index,story){
          var isOpeningIgnoreTag = this.isIgnoredTag(index,story,true);
           if(isOpeningIgnoreTag){
                var count=index;
                while(count<story.length){
                    var result = this.isIgnoredTag(index,story,false,[isOpeningIgnoreTag]);
                    if(result){
                        index=count+isOpeningIgnoreTag.length+1;
                        return index;
                        
                    }
                    count++;
                }
           }
           return false;
    },
    getDetailedStoryContent : function(sentence,countbreak,noOfinsert,data){
        // return sentence;
        var fillerCount = 20;
        var ignoreText=false,
            finalString="",
            count=1,
            inserts = 0,
            isClosing=false,result=sentence,
            index=-1,
            chars="",
            insertIndex=[],
            lowerRange=0,
            upperRange=countbreak;
            var ignoreElement=false
        while(1) {
            if(inserts >= (noOfinsert+fillerCount) || index>result.length){
                break;
            }
            index++;

            chars = sentence.charAt(index);
            // var newIndex = this.checkIfIgnoredTag(index,sentence);
            // if(newIndex && newIndex!=index) {
            //     index = newIndex;
            //     console.log("new index is:"+index + " char is"+(sentence.charAt(index)));
            //     continue;
            // }
            // if(Utils.checkIfIgnoredTagStart(sentence,index())){
            //     ignoreElement=true;
            // }
            // if(Utils.checkIfIgnoredTagEnd(sentence,index())){
            //     ignoreElement=true;
            // }
            if(chars === '<'){
               ignoreText = true;
               isClosing=false;
            }
            else if(chars === '>'){
              ignoreText = false;
              isClosing=true;

            }
            else if(!ignoreText){
                finalString = finalString + chars;
                isClosing=false;
            }
            
            if(isClosing){
                    if(finalString.length>(countbreak*(count))){
                        count = parseInt(finalString.length/countbreak)+1;
                        inserts++;
                        insertIndex.push(index);
                    }
            }
            
        }
        var results = [];
        var prev=0;
        for(var i=0;i<insertIndex.length;i++){
            var s = result.substring(prev,insertIndex[i]+1);
            var id = 'inside_post_content_ad_'+(i+1);
            console.log(id);
            console.log(data);
            results.push(s);
            
            var contentPart = (data && data[id] && data[id]['templateData'] && data[id]['templateData']['content']) ? data[id]['templateData']['content'] : ""; 
            console.log(contentPart);
            if(i>=noOfinsert){
                var xx = "<div class='hide inside-post-ad filler-ad-unit-inside-post' id='filler_ad"+(i==noOfinsert?'':"_"+i)+"'>"+contentPart+"</div>";
                results.push(xx);
            } else {

                results.push("<div class='hide inside-post-ad-before' id='inside_post_content_ad_"+(i+1)+"_before'></div><div class='"+(contentPart? "" : "hide")+" inside-post-ad' id='inside_post_content_ad_"+(i+1)+"'>"+contentPart+"</div><div class='hide inside-post-ad-after' id='inside_post_content_ad_"+(i+1)+"_after'></div>");
            }
            prev = insertIndex[i]+1;
            
        }
        if((prev+countbreak) > result.length){
            results.splice(results.length-1);
        }
        var s = result.substring(prev,result.length);
        results.push(s);

        result =results.join("");
        var replaceStack = {};
        // if(data && (data['hashtags'] || data['keywords'])){
        //     var s = result;
        //     var a = [];
        //     var params = [];
        //     console.log(data['hashtags']);
        //     console.log(data['keywords']);
        //     if(data['hashtags']){
        //         var aa = data['hashtags'].split(" ").join(",").split(",");
        //         for(var j=0;j<aa.length;j++){
        //             a.push(aa[j]);
        //             params.push("search="+aa[j]+"&search_type=tags");
        //         }
        //     } 
        //     if(data['keywords']){
        //         var aa = data['keywords'].split(" ").join(",").split(",");
        //         console.log(aa);
        //         for(var j=0;j<aa.length;j++){
        //             a.push(aa[j]);
        //             params.push("search="+aa[j]+"&search_type=all");
        //         }
        //     }
        //     console.log(a);
        //     console.log(params);
            

        //     if(a && a.length){
        //         for(var i=0;i<a.length;i++){
        //             if(a[i] && result.indexOf(a[i])>-1 && a[i].length>3){
        //                 var random = Math.random();
        //                 console.log("FOUND FOUND========");
        //                 result = result.replace(new RegExp(a[i], 'g'), random);
        //                 replaceStack[random]='<a class="track-click" data-label="inside-content" data-category="post-details" href="/search?'+params[i]+'">'+a[i]+'</a>';
        //             }
                    
        //         }
        //     }
        // }
        // for(var k in replaceStack){
        //     result = result.replace(new RegExp(k, 'g'), replaceStack[k]);
        // }
        return result;
    },

    replaceHtmlEntities : function(s) {
         s=s.replace(/&nbsp;/g," ");
         s=s.replace(/&amp;/g,"&");
         s=s.replace(/&quot;/g,"\"");
         s=s.replace(/&apos;/g,"\"");
         return s;
         
    },
    replaceHtmlEntitiesExtra : function(s) {
         s=s.replace(/&nbsp;/g," ");
         s=s.replace(/&amp;/g,"&");
         s=s.replace(/&quot;/g,"\"");
         s=s.replace(/&lt;/g,"<");
         s=s.replace(/&gt;/g,">");
         return s;
         
    },
    xmlEncodeChars : function(s){
        if(typeof s==="string"){
            s = s.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');    
        }
        
        return s;
    },
    xmlDecodeChars : function(s){
        if(typeof s==="string"){
            return s;
        } else {
            return this.replaceHtmlEntitiesExtra(s);    
        }
        
    },
    isObjectEmpty : function( obj ) {
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        if (obj === null) { return true; }
        if (obj.length > 0) { return false; }
        if (obj.length === 0) { return true; }

        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) { return false; }
        }

        return true;
    },

    toSentence : function( arr ) {
        var sentence = "";
        if ( arr.length === 0 ) {
            //  do nothing
        }
        else {
            sentence = arr[ 0 ];
        }
        for ( var __cnt = 1; __cnt < arr.length; __cnt++ ) {
            if ( __cnt === arr.length - 1 ) {
                sentence += ( " and " + arr[ __cnt ] );
            }
            else {
                sentence += ( ", " + arr[ __cnt ] );
            }
        }
        return sentence;
    },
    /**
     * Returns boolean value for whether the client is using mobile/desktop browser
     * @param  {Object}  req
     * @return {Boolean} isMobile[true/false]
     */
    isMobile: function(req) {
        var agent = mobileAgent(req.headers["user-agent"]);
        return agent.Mobile;
    },

    /**
     * update URL query string
     * @param  {String} uri   valid url, valid querystring parameter
     * @param  {String} key   querystring parameter
     * @param  {String} value querystring value
     * @return {String} updated uri
     */
    updateQueryStringParameter: function(uri, keys, values) {
        logger.info("updateQueryStringParameter uri = "+uri);
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

    /**
     * remove the query search parameter from the url
     * @param {String} uri valid url, valid querystring parameter
     * @param {String} keyToRemove key to be removed
     * @return {String} filtered uri
     */
    removeQueryStringParameter: function(uri, keyToRemove) {
        uri = uri.split('?');
        var searchIndex = uri.length > 1 ? 1 : 0;

        uri[searchIndex] = uri[searchIndex].split('&').filter(function(pair) {
          pair = pair.split('=');
          if (pair[0] === keyToRemove) {
            return false;
          }

          return true;
        }).join('&');

        if (uri[searchIndex]) {
            return uri.join('?');
        } else {
            return uri.join('');
        }
    },
    /**
     * converting the Months into year for eg 12 months to 1 year and 15 months into 1 year and as one quarter passes the count of year increases
     * @param {String} uri valid url, valid querystring parameter
     * @param {String} keyToRemove key to be removed
     * @return {String} filtered uri
     */
    getMonthsInApproxYear: function(months){

        var count = 0;
        if(months){
            while(months >= 12){
                months = months - 12;
                count++;
            }
            if(months > this.yearEpoch){
                count++;
            }
        }else{
            return 1;
        }
        return count;
    },

    
    getNthLabel: function(n) {
        if (!n) { return n; }

        switch(n) {
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
            default:
                return n + 'th';
        }
    },
    
    extend: function() {
        var args = Array.prototype.slice.call(arguments);
        return require('extend').apply(this, args);
    },

    
    arrayIntersection : function(arr1, arr2) {
        if (!Array.isArray) {
            Array.isArray = function(arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };
        }
        var r = [];
        if ( Array.isArray( arr1 ) && Array.isArray( arr2 ) ) {
            var o = {}, l = arr2.length, i, v;
            for (i = 0; i < l; i++) {
                o[arr2[i]] = true;
            }
            l = arr1.length;
            for (i = 0; i < l; i++) {
                v = arr1[i];
                if (v in o) {
                    r.push(v);
                }
            }
        }
        return r;
    },
    ucwords: function(str){
        if(!str){return '';}
        str = str.toString();
        str = str.replace(/-/g,' ');
        str = str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        });
        return str;
    },
    duplicateRemove: function(arr){
        var obj = {};
        var duplicateArray = [], newArray = [];
        for(var i=0;i<arr.length;i++){
            if(!obj[arr[i]]){
                obj[arr[i]] = arr[i];
                newArray.push(arr[i]);
            }else{
                duplicateArray.push(arr[i]);
            }
        }
        return newArray;
    },
    getHeadOfficeAddress: function(){
        return this.officeAddress;
    },
    getCDNUrl : function(url){
        return "/"+url;
    },
    writeCookie : function(req,res,key,value,expire){
        res.cookie(key, value, { path: '/', expires: new Date(Date.now() + expire),httpOnly: true });
    },
    getDateFromString : function(dateString){
        var s = dateString.split("-").join("/");
        return new Date(s);
    },
    getStringFromDate : function(d){
        if(!(d.getTime() > 0)) d = new Date(); //default to current date
        var hh = d.getHours(); if(hh<10 && (""+hh).indexOf('0')!=0) hh = "0"+hh;
        var mm = d.getMinutes(); if(mm<10 && (""+mm).indexOf('0')!=0) mm = "0"+mm;
        var ss = d.getSeconds(); if(ss<10 && (""+ss).indexOf('0')!=0) ss = "0"+ss;
        if(mm=='0') mm='00';
        if(ss=='0') ss='00';
        if(hh=='0') hh='00';
        var month = parseInt(d.getMonth()+1);
        if(month <10 && (""+month).indexOf('0')!=0) month = "0"+month;
        var year = d.getFullYear();
        var date = d.getDate(); if(date<10 && (""+date).indexOf('0')!=0) date = "0"+date;
        return (year+"/"+month+"/"+date+" " +hh+":"+mm+":"+ss);
    },
    getIP : function(req){
        var ip;
        if(req.headers['REMOTE_ADDR']) {
            ip=req.headers['REMOTE_ADDR'];
        } else if(req.headers['remote_addr']) {
            ip=req.headers['remote_addr'];
        }
        else if(req.headers['x-forwarded-for']) {
            ip=req.headers['x-forwarded-for'].split(",")[0];
        } else if(req.connection && req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        } else {
            ip = req.ip;
        }

        return ip;
    },
getAMPImageUrl : function(data,mediaId,width,height,lazy,attr,placeholder){
        if(!mediaId) {
            return "<amp-img width='500' layout='responsive' height='300' src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ") +"title='"+(data.mainImageAlt || data.title)+"'/>";
        }
        var hasPaidContent=false;
        var CDNUrl = "";
        for(var k in PartnerConfig){
            if(k==data.partner){
                hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                break;
            }
        }
        var url;
        if(!hasPaidContent && CDNUrl){
            url = CDNUrl+mediaId;
        }else {
            url = Constants.getImageServerURL(data.partner)+"&type="+Constants.IMAGE_TYPE_NEWS+"&uid="+mediaId;
        }

        
        if(width && height){
            if(!hasPaidContent && CDNUrl){
                url = url+"?width="+width+"&height="+height;
            } else {
                url = url+"&width="+width+"&height="+height;    
            }
            
        }
        var altOrTitle = (data.mainImageAlt || data.title);
        if(altOrTitle.indexOf("'")>-1){
            altOrTitle = altOrTitle.split("'").join("\'");
        }
        if(altOrTitle.indexOf('"')>-1){
            altOrTitle = altOrTitle.split("'").join('\"');
        }
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        if(!lazy){
            element = "<amp-img layout='responsive' width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+url+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ") +" title='"+(data.mainImageAlt || data.title)+"'/>";
        } else {
            element = "<amp-img  layout='responsive' width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"', data-src='"+url+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ")+"title='"+(data.mainImageAlt || data.title)+"'/>";
        }
        return element;
        
    },
    getAPMImageUrlFromPath : function(path,width,height,lazy,attr,placeholder,title){
        if(!path) {
            return "<amp-img width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ") +"title='"+title+"'/>";
        }

        var url = path;
       
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        if(!lazy){
            element = "<amp-img width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+url+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ") +"title='"+title+"'/>";
        } else {
            element = "<amp-img width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' data-src='"+url+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ")+"title='"+title+"'/>";
        }
        return element;
        
    },
    getAMPImageUrlAbsolute : function(data,mediaId,noproto,lazy,attr,placeholder){
        var url;
        if(noproto){
            url = "//"+mediaId;
        } else {
            url=mediaId;
        }
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        if(!lazy){
            element = "<amp-img width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+url+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ")+"title='"+(data.mainImageAlt || data.title)+"'/>";
        } else {
            element = "<amp-img width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"', data-src='"+url+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ") +"title='"+data.title+"'/>";
        }
        return element;
    },
    getAMPVideoUrl : function(data,mediaId,width,height,lazy,attr){
        
          // <link href="http://vjs.zencdn.net/5.10.4/video-js.css" rel="stylesheet">

        // <script src="http://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>
        var element = "";
        var p = PartnerConfig[data.partner]; 

        var url = (p && data.partner && data.partner.indexOf("specialcoveragehindi")==0 ?Constants.getServletRoot("/content") : ( data.partner && data.partner.indexOf("thehakw")==0 ?Constants.getServletRoot("/hawkcontent") : Constants.getServletRoot("/content")))+"command=rdm.ServletVideoPlayer&app=rdes&partner="+data.partner+"&sessionId="+p.sessionId+"&uid="+mediaId;
        
        if(data.thumbId){ //has thumb, insert script to show thumb and play video when clicked
            var imageId = new Date().getTime();
            attr = attr ? attr+" id='"+imageId+"'" : "id='"+imageId+"'"+' onerror="$(this).addClass("'+"'image_placeholder_loaded'"+');$(this).attr('+"'src','/images/video-placeholder.jpg');"+'"'+"\n";
            var thumb = this.getAMPImageUrl(data,data.thumbId,width,height,true,attr,"/images/video-placeholder.jpg");
            var script = '\n\n<script type="text/javascript">\n'
           
            +'var callOnLoad = function(){\n'
            +'$("body").on("click","#'+imageId+'",function(){\n'
            
            +'$(this).addClass("hide");\n'
            +' $(".video_'+imageId+'").attr("src","'+url+'");\n'
            +' $(".script_'+imageId+'").attr("src","//vjs.zencdn.net/5.10.4/video.js");\n'
            +' $(".autoplay_'+imageId+'").attr("autoplay","true").removeClass("hide");\n'
            +"});\n};\n"
             +'if(window.addEventListener){ window.addEventListener("load",function(){\ncallOnLoad();\n}); } \n else { window.attachEvent("load", function(){\ncallOnLoad();\n});}\n'
            +"</script>\n\n";
            element+=thumb;
            element+='<link href="//vjs.zencdn.net/5.10.4/video-js.css" rel="stylesheet">';
            // element+='<script src="//vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>';
            element+=" <apm-video class='hide autoplay_"+imageId+" video-js vjs-big-play-centered' id='video'  controls preload='auto' data-setup='{}' style='width:100%;height:auto;position:relative'>";

            element += "<source class='video_"+imageId+"' data-src='"+url+"' type='video/mp4'/>";
            element += "<source class='video_"+imageId+"' data-src='"+url+"' type='video/webm'/>";
            // element+='<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
            element += "</amp-video>";
            element+='<script class="script_'+imageId+'" async data-src="//vjs.zencdn.net/5.10.4/video.js"></script>';
            element+=script;
        } else {
            element+=" <apm-video id='video' class='video-js vjs-big-play-centered' controls preload='auto' data-setup='{}' style='width:100%;height:auto;position:relative'>";

            element += "<source src='"+url+"' type='video/mp4'/>";
            element += "<source src='"+url+"' type='video/webm'/>";
            // element+='<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
            element += "</amp-video>";
        }

        
        return element;
    },
    getAMPYTVideoUrl : function(data,mediaId,width,height,lazy){
        var doLazy = (lazy==true || lazy==undefined);
        // console.log("media id:"+mediaId+" width:"+width+"height:"+height+" data.thumbUrl"+data.thumbUrl+"data.mediaUrl"+data.mediaUrl);

        if(data && width && height && data.thumbUrl && data.mediaUrl){ //send thumb nail only
            var p = PartnerConfig[data.partner];
            if(p.inlineVideos && !data.showThumbForVideo){

                return "<amp-iframe layout='responsive' width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='http://www.youtube.com/embed/"+mediaId+"' frameborder='0' allowfullscreen='true'></amp-iframe>";       
            }
            var params = "class='video_view' data-video-id='"+mediaId+"' data-video-type='youtube' data-video-path='"+data.mediaUrl+"'";
            var element = this.getAMPImageUrlFromPath(data.thumbUrl,width,height,doLazy,params,this.getVideoPlaceHolderImage(),(data.mainImageAlt || data.title));
            return element;
        }
        var element = "<amp-iframe  width='"+(width ? width : '500')+"' height='"+(height ? height : '300')+"' src='http://www.youtube.com/embed/"+mediaId+"' frameborder='0' allowfullscreen='true'></amp-iframe>";
        return element;
    },
    getAMPMediaElement :function(data,index,width,height,attr,ignoreEmpty){
        var lazy=false;
        var element = "";
        var mediaIds = data["mediaIds"] ? data["mediaIds"] : [];
        if(index>mediaIds.length-1 || index<0){ //request for bigger index which is not in data
            if(ignoreEmpty){
                return;
            } else {
                return this.getAMPImageUrl(data,"",width,height,lazy,attr);
            }
            // return;
        }

        var mediaId = mediaIds[index];
        if(index==0 && mediaId=="null" && mediaIds.length>1){
            mediaId = mediaIds[1];
        }
        var mediaType = this.getMediaType(mediaId);
        var result="";
        switch(mediaType){
            case "youtube": 
                mediaId = mediaId.trim().substring(3,mediaId.trim().length);
                result= this.getAMPYTVideoUrl(data,mediaId,width,height,attr,lazy);
                break
            case "video": 
                // mediaId = mediaId.trim().substring(6,mediaId.trim().length);
                result= this.getAMPVideoUrl(data,mediaId,width,height,lazy,attr);
                break;
            case "image": 
                result= this.getAMPImageUrl(data,mediaId,width,height,lazy,attr);
                break;
            case "external": 
                result = this.getAMPImageUrlAbsolute(data,mediaId,false,lazy,attr);
                break;
            case "externalNoProtocol": 
                result= this.getAMPImageUrlAbsolute(data,mediaId,true,lazy,attr);
                break;
        }
        
        return result;
    },
    
    getMediaElement : function(data,index,width,height,lazy,attr,ignoreEmpty){
        var element = "";
        var mediaIds = data["mediaIds"] ? data["mediaIds"] : [];
        if(index>mediaIds.length-1 || index<0){ //request for bigger index which is not in data
            if(ignoreEmpty){
                return;
            } else {
                return this.getImageUrl(data,"",width,height,lazy,attr);
            }
            // return;
        }

        var mediaId = mediaIds[index];
        if(index==0 && mediaId=="null" && mediaIds.length>1){
            mediaId = mediaIds[1];
        }
        var mediaType = this.getMediaType(mediaId);
        var result="";
        switch(mediaType){
            case "youtube": 
                mediaId = mediaId.trim().substring(3,mediaId.trim().length);
                
                result= this.getYTVideoUrl(data,mediaId,width,height,attr,lazy,index);
                break
            case "video": 
                // mediaId = mediaId.trim().substring(6,mediaId.trim().length);
                result= this.getVideoUrl(data,mediaId,width,height,lazy,attr);
                break;
            case "image": 
                result= this.getImageUrl(data,mediaId,width,height,lazy,attr);
                break;
            case "external": 
                result = this.getImageUrlAbsolute(data,mediaId,false,lazy,attr);
                break;
            case "externalNoProtocol": 
                result= this.getImageUrlAbsolute(data,mediaId,true,lazy,attr);
                break;
        }
        
        return result;
    },
   
    getMediaType : function(mediaId){
        if(mediaId.trim().indexOf(Constants.YOUTUBE_MEDIA_ID_PREFIX)==0){ //youtube video
           return "youtube";
        } else if(mediaId.trim().indexOf(Constants.VIDEO_ID_PREFIX)==0){
            return "video";
        } else if(mediaId.trim().indexOf("http://")==0 || mediaId.trim().indexOf("https://")==0 || mediaId.trim().indexOf("www.")==0){
            if(mediaId.trim().indexOf("www.")==0){
                return "externalNoProtocol";
            }
            return "external";
        } else {
            return "image";
        }
    },
    getImageUrl : function(data,mediaId,width,height,lazy,attr,placeholder){
        if(!mediaId) {
            return "<img src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' alt='"+(data.mainImageAlt || data.title)+"' "+ (attr? attr : " ") +"title='"+(data.mainImageAlt || data.title)+"'/>";
        }
        var hasPaidContent=false;
        var CDNUrl = "";
        for(var k in PartnerConfig){
            if(k==data.partner){
                hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                break;
            }
        }
        var url;
        if(!hasPaidContent && CDNUrl){
            url = CDNUrl+mediaId;
        }else {
            url = Constants.getImageServerURL(data.partner)+"&type="+Constants.IMAGE_TYPE_NEWS+"&uid="+mediaId;
        }

        
        if(width && height){
            if(!hasPaidContent && CDNUrl){
                url = url+"?width="+width+"&height="+height;
            } else {
                url = url+"&width="+width+"&height="+height;    
            }
            
        }
        var indexOfMediaId = data.mediaIds.length>0 ? data.mediaIds.indexOf(mediaId) : 0;
        var altText = indexOfMediaId>0 && data.mediaAltTexts && data.mediaAltTexts.length>indexOfMediaId ?data.mediaAltTexts[indexOfMediaId] : data.mainImageAlt;
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        if(!lazy){
            element = "<img src='"+url+"' alt='"+(altText || data.title)+"' "+ (attr? attr : " ") +"title='"+(altText || data.title)+"'/>";
        } else {
            placeholder = placeholder || '/images/placeholder.jpg';
            element = "<img src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"', data-src='"+url+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+(altText || data.title)+"' "+ (attr? attr : " ")+"title='"+(altText || data.title)+"'/>";
        }
        return element;
        
    },
    getImageUrlFromPath : function(path,width,height,lazy,attr,placeholder,title){
        if(!path) {
            return "<img src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ") +"title='"+title+"'/>";
        }

        var url = path;
       
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        if(!lazy){
            element = "<img src='"+url+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ") +"title='"+title+"'/>";
        } else {
            element = "<img src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"' data-src='"+url+"' "+(placeholder ? 'onerror="$(this).addClass('+"'image_placeholder_loaded'"+');$(this).attr('+"'src','"+placeholder+"');"+'" ' : "" )+"alt='"+title+"' "+ (attr? attr : " ")+"title='"+title+"'/>";
        }
        return element;
        
    },
    getImageUrlAbsolute : function(data,mediaId,noproto,lazy,attr,placeholder){
        var url;
        if(noproto){
            url = "//"+mediaId;
        } else {
            url=mediaId;
        }
        var element = "";//"<img src='"+url+"' alt='"+data.title+"' title='"+data.title+"'/>";
        var indexOfMediaId = data.mediaIds.length>0 ? data.mediaIds.indexOf(mediaId) : 0;
        var altText = indexOfMediaId>0 && data.mediaAltTexts && data.mediaAltTexts.length>indexOfMediaId ?data.mediaAltTexts[indexOfMediaId] : data.mainImageAlt;
        if(!lazy){
            element = "<img src='"+url+"' alt='"+(altText || data.title)+"' "+ (attr? attr : " ")+"title='"+(altText || data.title)+"'/>";
        } else {
            element = "<img src='"+(placeholder ? placeholder : '/images/placeholder.jpg')+"', data-src='"+url+"' alt='"+(altText || data.title)+"' "+ (attr? attr : " ") +"title='"+(altText || data.title)+"'/>";
        }
        return element;
    },
    getVideoUrl : function(data,mediaId,width,height,lazy,attr){
        
          // <link href="http://vjs.zencdn.net/5.10.4/video-js.css" rel="stylesheet">

        // <script src="http://vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>
        var element = "";
        var p = PartnerConfig[data.partner]; 

        var url = (p && data.partner && data.partner.indexOf("specialcoveragehindi")==0 ?Constants.getServletRoot("/content") : ( data.partner && data.partner.indexOf("thehakw")==0 ?Constants.getServletRoot("/hawkcontent") : Constants.getServletRoot("/content")))+"command=rdm.ServletVideoPlayer&app=rdes&partner="+data.partner+"&sessionId="+p.sessionId+"&uid="+mediaId;
        
        if(data.thumbId && width){ //has thumb, insert script to show thumb and play video when clicked
            var imageId = new Date().getTime();
            attr = attr ? attr+" id='"+imageId+"'" : "id='"+imageId+"'"+' onerror="$(this).addClass("'+"'image_placeholder_loaded'"+');$(this).attr('+"'src','/images/video-placeholder.jpg');"+'"'+"\n";
            var thumb = this.getImageUrl(data,data.thumbId,width,height,true,attr,"/images/video-placeholder.jpg");
            var script = '\n\n<script type="text/javascript">\n'
           
            +'var callOnLoad = function(){\n'
            +'$("body").on("click","#'+imageId+'",function(){\n'
            
            +'$(this).addClass("hide");\n'
            +' $(".video_'+imageId+'").attr("src","'+url+'");\n'
            +' $(".script_'+imageId+'").attr("src","//vjs.zencdn.net/5.10.4/video.js");\n'
            +' $(".autoplay_'+imageId+'").attr("autoplay","true").removeClass("hide");\n'
            +"});\n};\n"
             +'if(window.addEventListener){ window.addEventListener("load",function(){\ncallOnLoad();\n}); } \n else { window.attachEvent("load", function(){\ncallOnLoad();\n});}\n'
            +"</script>\n\n";
            element+=thumb;
            element+='<link href="//vjs.zencdn.net/5.10.4/video-js.css" rel="stylesheet">';
            // element+='<script src="//vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>';
            element+=" <video class='hide autoplay_"+imageId+" video-js vjs-big-play-centered' id='video'  controls preload='auto' data-setup='{}' style='width:100%;height:auto;position:relative'>";

            element += "<source class='video_"+imageId+"' data-src='"+url+"' type='video/mp4'/>";
            element += "<source class='video_"+imageId+"' data-src='"+url+"' type='video/webm'/>";
            // element+='<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
            element += "</video>";
            element+='<script class="script_'+imageId+'" async data-src="//vjs.zencdn.net/5.10.4/video.js"></script>';
            element+=script;
        } else {
            var setup = "";
            if(width && height){
                setup  = "data-setup='"+'{"controls": true, "autoplay": false, "preload": "auto" }'+"'";
            } else {
                setup  = "data-setup='"+'{ "controls": true, "autoplay": true, "preload": "auto" }'+"'";
            }
             
            element+='<link href="//vjs.zencdn.net/5.10.4/video-js.css" rel="stylesheet">';
            // element+='<script src="//vjs.zencdn.net/ie8/1.1.2/videojs-ie8.min.js"></script>';
            element+=" <video id='video' class='video-js vjs-big-play-centered' controls preload='auto' autoplay='true' data-setup='{}' style='width:100%;height:auto;position:relative'>";

            element += "<source src='"+url+"' type='video/mp4'/>";
            element += "<source src='"+url+"' type='video/webm'/>";
            // element+='<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p>';
            element += "</video>";
            element+='<script async data-src="//vjs.zencdn.net/5.10.4/video.js"></script>';
        }

        
        return element;
    },
    getYTVideoUrl : function(data,mediaId,width,height,attr,lazy,index){
        var doLazy = (lazy==true || lazy==undefined);
        // console.log("media id:"+mediaId+" width:"+width+"height:"+height+" data.thumbUrl"+data.thumbUrl+"data.mediaUrl"+data.mediaUrl);
        if(data && width && height && data.thumbUrl && data.mediaUrl){ //send thumb nail only
            var p = PartnerConfig[data.partner];
            if(p.inlineVideos && !data.showThumbForVideo){

                return "<iframe width='100%' height='100%' src='http://www.youtube.com/embed/"+mediaId+"' frameborder='0' allowfullscreen='true'></iframe>";       
            }
            
            // var index = data.mediaIds && data.mediaIds.length ? data.mediaIds.indexOf(mediaId) : -1;
            var thumbUrl;
            
            if(index && index>0){
                thumbUrl = "/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;//"https://img.youtube.com/vi/"+mediaId+"/0.jpg"; //"http://hocalwire.com/admin/downloadYoutubeThumb?videoId="+mediaId;
            } else {
                thumbUrl = data.thumbUrl;
            }
            
            var params = "class='video_view' data-video-id='"+mediaId+"' data-video-type='youtube' data-video-path='"+data.mediaUrl+"'";
            var element = this.getImageUrlFromPath(thumbUrl,width,height,doLazy,params,this.getVideoPlaceHolderImage(),(data.mainImageAlt || data.title));
            return element;
        }
        var element = "<iframe width='100%' height='100%' src='http://www.youtube.com/embed/"+mediaId+"?autoplay=1' frameborder='0' allowfullscreen='true'></iframe>";
        return element;
    },
    isOldPost : function(data){
        var mediaIds = data["mediaIds"] ? data["mediaIds"] : [];
        if(!mediaIds.length){ //request for bigger index which is not in data
            
            return false;
        }

        var mediaId = mediaIds[0];
        var mediaType = this.getMediaType(mediaId);
        if(mediaType=="external" || mediaType=="externalNoProtocol"){
            return true;
        }
        return false;
    },
    getMediaUrl : function(data,mediaIdsPassed,rootUrl,indexPassed,width,height){

        var element = "";
        var mediaIds = mediaIdsPassed ? mediaIdsPassed : data["mediaIds"] ? data["mediaIds"] : [];
        var index = indexPassed || 0;
        
        if(!mediaIds.length){
            return "";
        }
        if(index>mediaIds.length || index<0){ //request for bigger index which is not in data
            return "";
        }
        var mediaId = mediaIds[index];
        
        var mediaType = this.getMediaType(mediaId);
        var url = "";
        switch(mediaType){
            case "youtube": 
                
                mediaId = mediaId.trim().substring(3,mediaId.trim().length);
                url = "http://www.youtube.com/embed/"+mediaId+"?feature=player_detailpage";
                
                break
            case "video": 
                // mediaId = mediaId.trim().substring(6,mediaId.trim().length);
                var p = PartnerConfig[data.partner];
                url = (rootUrl ? rootUrl : "")+ Constants.getServletRoot()+"command=rdm.ServletVideoPlayer&app=rdes&partner="+data.partner+"&sessionId="+p.sessionId+"&uid="+mediaId;
                break;
            case "image": 
                var hasPaidContent=false;
                var CDNUrl = "";
                for(var k in PartnerConfig){
                    if(k==data.partner){
                        hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                        CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                        break;
                    }
                }
                if(!hasPaidContent && CDNUrl){
                    url = CDNUrl+mediaId;
                    if(width && height){
                        url+="?width="+width+"&height="+height;
                    }
                }else {
                    url = (rootUrl ? rootUrl : "")+Constants.getImageServerURL(data.partner)+"&type="+Constants.IMAGE_TYPE_NEWS+"&uid="+mediaId;
                    if(width && height){
                        url+="&width="+width+"&height="+height;
                    }
                }

                
                break;
            case "external": 
                var url = mediaId;
                var partner = data.partner;
                var rootUrlCurr = PartnerConfig[partner].domains[0];
                if(url.indexOf(rootUrlCurr)>-1){
                    index = url.indexOf(rootUrlCurr)+rootUrlCurr.length;
                    url = (rootUrl ? rootUrl : "")+url.substring(index,url.length);
                }
                break;
            case "externalNoProtocol": 
                var url = mediaId;
                try{
                    var protocol = PartnerConfig[partner].protocals[0];
                    url = protocol+"://"+mediaId;
                    var partner = data.partner;
                    var rootUrl = PartnerConfig[partner].domains[0];
                    if(url.indexOf(rootUrl)>-1){
                        index = url.indexOf(rootUrl)+rootUrl.length;
                        url = (rootUrl ? rootUrl : "")+url.substring(index,url.length);
                    }
                }catch(e){
                    
                }
                
                break;
        }
        return url;
    },
    getThumbUrl : function(data,mediaIdsPassed,rootUrl,indexPassed,width,height){

        var element = "";
        var mediaIds = mediaIdsPassed ? mediaIdsPassed : data["mediaIds"] ? data["mediaIds"] : [];
        var index = indexPassed || 0;
        
        if(!mediaIds.length){
            return "";
        }
        if(index>mediaIds.length || index<0){ //request for bigger index which is not in data
            return "";
        }
        var mediaId = mediaIds[index];
        
        var mediaType = this.getMediaType(mediaId);
        var url = "";
        switch(mediaType){
            case "youtube": 
                mediaId = mediaId.trim().substring(3,mediaId.trim().length);
                url = "/xhr/admin/downloadYoutubeThumb?videoId="+mediaId;
                break
            case "video": 
                // mediaId = mediaId.trim().substring(6,mediaId.trim().length);
                var p = PartnerConfig[data.partner];
                url = "/images/placeholder.jpg";
                break;
            case "image": 
                var hasPaidContent=false;
                var CDNUrl = "";
                for(var k in PartnerConfig){
                    if(k==data.partner){
                        hasPaidContent = PartnerConfig[k]['hasPaidContent'] || false;
                        CDNUrl = PartnerConfig[k]['CDNURL'] || "";
                        break;
                    }
                }
                if(!hasPaidContent && CDNUrl){
                    url = CDNUrl+mediaId;
                    if(width && height){
                        url+="?width="+width+"&height="+height;
                    }
                }else {
                    url = (rootUrl ? rootUrl : "")+Constants.getImageServerURL(data.partner)+"&type="+Constants.IMAGE_TYPE_NEWS+"&uid="+mediaId;
                    if(width && height){
                        url+="&width="+width+"&height="+height;
                    }
                }

                
                break;
            case "external": 
                var url = mediaId;
                var partner = data.partner;
                var rootUrlCurr = PartnerConfig[partner].domains[0];
                if(url.indexOf(rootUrlCurr)>-1){
                    index = url.indexOf(rootUrlCurr)+rootUrlCurr.length;
                    url = (rootUrl ? rootUrl : "")+url.substring(index,url.length);
                }
                break;
            case "externalNoProtocol": 
                var url = mediaId;
                try{
                    var protocol = PartnerConfig[partner].protocals[0];
                    url = protocol+"://"+mediaId;
                    var partner = data.partner;
                    var rootUrl = PartnerConfig[partner].domains[0];
                    if(url.indexOf(rootUrl)>-1){
                        index = url.indexOf(rootUrl)+rootUrl.length;
                        url = (rootUrl ? rootUrl : "")+url.substring(index,url.length);
                    }
                }catch(e){
                    
                }
                
                break;
        }
        return url;
    },
    getPublishedDate : function(date){
        var a = date.split(" ");
        var finalString;
        if(a.length>1){
          finalString  = a[0]+"T"+a[1]+"+00:00";   
        } else {
            finalString  = a[0]+"+00:00";   
        }
        return finalString;
    },
    getCategoryById : function(cats,id) {
        if(!id || !cats) {
            return {};
        }
        var items = cats.filter(function(item) { return item.id == id});
        if(items.length) {
            return items[0];
        } else {
            return {};
        }
    },
    getCategoryPrevPageUrl : function(env,data){
        var url = "";
        var type = env.listingPageType;
        if(type=="cats"){
            url = data.mainCatNews.catData.url+"/"+(env.pageNo-1);
        } else if(type=="search"){
            url = env.pathname+"?search="+env.query.search+"&search_type="+env.query.search_type+"&page="+(env.pageNo-1);
        } else if(type=="author"){
            url = data.mainCatNews.catData.url+"/"+(env.pageNo-1);
        } else {
            url="/";
        }
        return url;
    },
    getCategoryNextPageUrl : function(env,data){
        var url = "";
        var type = env.listingPageType;
        if(type=="cats"){
            url = data.mainCatNews.catData.url+"/"+(env.pageNo+1);
        } else if(type=="search"){
            url = env.pathname+"?search="+env.query.search+"&search_type="+env.query.search_type+"&page="+(env.pageNo+1);
        } else if(type=="author"){
            url = data.mainCatNews.catData.url+"/"+(env.pageNo+1);
        } else {
            url="/";
        }
        return url;
    },
    render : function(req,res,path,props,callback){
        var currTime = new Date().getTime();
        var reqTime = req.requestTime;
        if(reqTime){
            logger.info("SPEED_SLOW Time for Complete Request Till Render is: "+(currTime-reqTime));
        }
        var data = props.data;
        var env = req.environment;
        var syncMixins = data.syncMixins || [];
        if(syncMixins){
            var fileSync = syncMixins.filter(function(item){
                    return item.content_type=="FILE";
            });
            if(fileSync && fileSync.length>0){
                
                var promisses = [];
                for(var i=0;i<fileSync.length;i++){
                    var filepath = fileSync[i].fileName;
                    promisses.push(this.getFileDataPromise(req,res,filepath,props));
                }
                var result = Q.all(promisses);
                
                result.then(
                    function(response){
                        // console.log(response);
                        for(var i=0;i<fileSync.length;i++){
                            fileSync[i].data=response[i];
                        }
                        
                        logger.info("SPEED_SLOW Time from render inside to -  before Calling Render: "+(new Date().getTime()-currTime));
                        res.render(path, props, function(err, html) {
                            if(reqTime){
                                var t = new Date().getTime();
                                logger.info("SPEED_SLOW Time for Complete Rendering Page Before Serveis: "+(t-currTime));
                            }
                            // console.log(html);
                            callback(err,html);
                        });
                    },
                    function(e) {
                        logger.info("SPEED_SLOW Time from render inside to -  before Calling Render: "+(new Date().getTime()-currTime));
                        res.render(path, props, function(err, html) {
                            var t = new Date().getTime();
                            logger.info("SPEED_SLOW Time for Complete Rendering Page Before Serveis: "+(t-currTime));
                            // console.log(html);
                            callback(err,html);
                        });
                    })
                    .catch(function(e) {
                        res.render(path, props, function(err, html) {
                            // console.log(html);
                            callback(err,html);
                        });
                    });
            } else {
                
                logger.info("SPEED_SLOW Time from render inside to -  before Calling Render: "+(new Date().getTime()-currTime));
                res.render(path, props, function(err, html) {
                        var t = new Date().getTime();
                        logger.info("SPEED_SLOW Time for Complete Rendering Page Before Serveis: "+(t-currTime));
                        callback(err,html);
                    });
            }
        } else {
            
            logger.info("SPEED_SLOW Time from render inside to -  before Calling Render: "+(new Date().getTime()-currTime));
            res.render(path, props, function(err, html) {
                var t = new Date().getTime();
                logger.info("SPEED_SLOW Time for Complete Rendering Page Before Serveis: "+(t-currTime));
                callback(err,html);
            });
        }
        
    },
    getFileDataPromise : function(req,res,path,props){
        return new Promise(function(resolve, reject) {
            res.render(path,props, function(err, html) {
                if(err){
                    reject("");
                }
                resolve(html);
            });
            
        });
    
    },
    writeToLogFile : function(logger,arr,req){
        var pathname = req && req.url ? req.url : req;
        var msg = "";
        for(var i=1;i<arr.length;i++){
            msg=msg+"  ---  "+(arr[i]-arr[i-1]);
        }
        logger.error("LOADTEST================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>    api load time ::::::"+pathname+" values:::::"+msg);
    },
    getValValue : function(req,varvalue){
        var result="";
        var a = varvalue.split("+");
        for(var k=0;k<a.length;k++){
            var res;
            var aa = a[k].split(".");
            for(var j=0;j<aa.length;j++){
                if(!res) {
                    res = req[aa[j]];
                } else {
                    res = res[aa[j]];
                }
                
            }
            result =result+res;
        }
        return result;
    },
    setAsyncTenmplates : function(req,asyncTemplates){
        var aTemplates = [];
        var aTemplates = extend(true,aTemplates,asyncTemplates);
        for(var i=0;i<aTemplates.length;i++){ //encode content of template

            if(aTemplates[i].content.indexOf("##$$") >-1){
                var variables = [];
                var c=aTemplates[i].content;
                var start = -1;
                var end = -1;
                for(var j=0;j<c.length;j++){

                    if(start<0 && j<c.length && c[j]=="$" && c[j-1]=="$" && c[j-2]=="#" && c[j-3]=="#"){
                        start = j+1;
                    }
                    if(end<0 && j<c.length && c[j]=="#" && c[j-1]=="#" && c[j-2]=="$" && c[j-3]=="$"){
                        end = j-3;
                    }
                    if(start>-1 && end>-1){
                        var tvar = c.substring(start,end);
                        var vvalue = this.getValValue(req,tvar);
                        variables.push({"start":start,"end":end,"variable":tvar,"value":vvalue});
                        start=-1;
                        end=-1;
                    }
                }
                var indexShift=0;
                for(var j=0;j<variables.length;j++){
                    var i1 = variables[j].start-4+indexShift;
                    var i2 = variables[j].end+4+indexShift;
                    var vva = variables[j].value;
                    var tvar = variables[j].variable;
                    indexShift = indexShift+(vva.length-tvar.length-8);
                    var p1 = aTemplates[i].content.substring(0,i1);
                    var p2 = aTemplates[i].content.substring(i2,aTemplates[i].content.length);
                    aTemplates[i].content = p1 + vva +p2;
                }
                        
                
                aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
            } else {
                aTemplates[i].content = encodeURIComponent(aTemplates[i].content);    
            }
            
        }
        req.environment.asyncTemplates = aTemplates;

    },
    setCustomDimen : function(req,data,pageType){
        
    }

    
};
