(function ($) {
    "use strict";

    var loadedCaptcha=false;

    var ajax = function(options) {
        return new Promise(function(resolve, reject) {

            options.success = function(response) {
                resolve(response);
            };

            options.error = function(error) {
                reject(error);
            };

            $.ajax(options);
        });
    };

    var get = function(url, options) {
        options = $.extend({}, options);
        options.url = url;
        options.type = 'GET';

        return ajax(options);
    };

    var getJSON = function(url, options) {
        options = $.extend({}, options);
        options.url = url;
        options.type = 'GET';
        options.dataType = 'json';

        return ajax(options);
    };

    var post = function(url, postData,optionsPassed) {

        var options = {
            url:         url,
            type:        'POST',
            data:        (!optionsPassed || (optionsPassed.contentType && optionsPassed.contentType.indexOf("json")>-1))  ? JSON.stringify(postData) : postData,
            contentType: "application/json; charset=utf-8"
        };
        if(optionsPassed){
            options = $.extend(options,optionsPassed);    
        }
        
        return ajax(options);
    };

   
    // Put in globals
    Hocalwire.Services.get = get;
    Hocalwire.Services.getJSON = getJSON;
    Hocalwire.Services.post = post;
    
})($);
