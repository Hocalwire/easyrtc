

"use strict";

var Constants = require('src/locales/Constants');
var EVC = require('express-view-cache');
var CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // in milli-seconds
var evc;

/**
 * Dont change the order otherwise regex match will start detecting wrong one
 * @type {Array}
 */
var routeMappings = [
    "cacheHandler",
    "root",
    "pageHandler",
    "xhrHandler",
    "inputStreamController"
    
];

module.exports.setup = function(app) {
    mapMiddlewareRoutesBeforeCaching(app);

   

    // mapMiddlewareRoutes(app);

    routeMappings.map(function(route) {
        require('./' + route).setup(app);
    });

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    require('./error').setup(app);
};

// don't add page routes in this function
function mapMiddlewareRoutes(app) {
    var defaultMappings =  [
        'index'            // Home page
    ];

    defaultMappings.map(function(route) {
        require('./' + route).setup(app);
    });
}


// don't add page routes in this function
function mapMiddlewareRoutesBeforeCaching(app) {
    var defaultMappings =  [
        'urlSetup'
    ];

    defaultMappings.map(function(route) {
        require('./' + route).setup(app);
    });
}

function mapCachingRoutes(app) {
    var urls = getInFlatArray(Constants.URL);

    for (var i = 0; i < urls.length; i++) {
        if (urls[i].type === 'POST') { continue; }

        app.use(urls[i].urlStructure, evc.cachingMiddleware(CACHE_DURATION,urls[i].queryParams,urls[i].responsive));
    }
}

function getInFlatArray(URL) {
    var URLArray = [];

    for (var param in URL) {
      if (URL.hasOwnProperty(param)) {
        if (URL[param].urlStructure) {
            if(URL[param].cache==="1"){
                URLArray.push(URL[param]);
            }
        } else {
          URLArray = URLArray.concat(getInFlatArray(URL[param]));
        }
      }
    }

    return URLArray;
}
