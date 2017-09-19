'use strict';


var express = require('express'),
    params = require('express-params'),
    path = require('path'),
    logger = require('src/libs/logger'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    baseRoute = require('src/controller/base'),
    config = require('src/config/config'),
    compress = require('compression'),
    compressible = require('compressible'),
    apiHelper = require('src/libs/apiHelper'),
    multer  = require('multer'),
    utilsHelper = require('src/libs/Utils'),
    contants = require("src/locales/Constants"),
    vhost = require("vhost");
    require('http').globalAgent.maxSockets = 500000;
    var partnerConfig = require("src/config/PartnerConfig");
var app = express();
//app.set("view cache", true);
// var session = require('express-session');
// var jadeDynamicIncludes = require('src/controller/dynamicTemplateLoader');

var sess = {
  secret: '123456PTR',
  cookie: {path:"/",httpOnly:false},
  resave : true,
  saveUninitialized : true
};

/**
 * Configurations
 */
app.set('config', config[app.get('env')]);
app.set('port', app.get('config').port);
app.set('views', path.join(__dirname, 'src/templates'));
// jadeDynamicIncludes.initTemplates(__dirname + '/src/templates',true,".d");
var viewEngine = require('view-engine');

app.set('view engine', 'jade');
// app.use(jadeDynamicIncludes.attachTemplatesToRequest());
// Configs
console.log('Env:' + app.get('env'));
console.log('Port:' , config[app.get('env')]);
console.log('Port:' + config[app.get('env')].port);
console.log('API object:' + config[app.get('env')].api);
console.log('API:' + config[app.get('env')].api.host);



/**
 * Middlewares
 */
console.log("_dir name"+__dirname);

// logger.setup(app);
var transports = logger.transports;
for(var k in transports){
if(app.get('env')=="development"){
        transports[k].level = "info";
    } else {
        transports[k].level = "error";
    }
    
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
// app.use(session(sess));


app.use(compress({
    filter: function(req, res) {
        // TODO: this is set because we are using express-view-cache middleware
        // to store the html in redis database to serve html faster
        // In this case, we are sending uncompressed content
        if (req.headers.express_view_cache) { return false; }

        var gzip,
            type = res.getHeader('Content-Type'),
            extraList = [
                'application/font-woff'
            ];
        gzip = (type && (compressible(type) || extraList.indexOf(type)!==-1));
        return gzip;
    }
}));
app.use(function(req, res, next){
  res.header('Vary', 'User-Agent,Accept-Encoding');
  app.disable('x-powered-by');
  next();
});

configPartnersApp(app);
if (app.get('env') === "development") { //only dev mode will go here
    
    // app.use(express.static(path.join(__dirname, '.tmp'))); // jshint ignore:line
    app.use(express.static(path.join(__dirname, 'src/public'))); // jshint ignore:line
    app.use(express.static(path.join(__dirname, 'src/sitemaps'))); // jshint ignore:line
} else if (app.get('env') === "production") {
    app.use(express.static(path.join(__dirname, 'src/public'), { maxAge: 31557600000 })); // jshint ignore:line
    app.use(express.static(path.join(__dirname, 'src/sitemaps'), { maxAge: 31557600000 })); // jshint ignore:line
}

/**
 * Helpers
 */
apiHelper.setup(app);
utilsHelper.setup(app);
contants.setup(app);
app.locals.Utils = require('src/libs/Utils'); // template utils
app.locals.Constants = require('src/locales/Constants'); // template utils
app.locals.environment = app.get('env'); //environment setting

/**
 * Routes
 */
params.extend(app); // to use regex in url
baseRoute.setup(app);

module.exports = app;
function configPartnersApp(){
    console.log("setting up vertual hosts************");
    for(var k in partnerConfig){
        var domains = partnerConfig[k]["domains"];
        for(var i=0;i<domains.length;i++){
            var h = createVirtualHost(domains[i],"src/partners/"+k);
            app.use(h);
        }
    }

}
function createVirtualHost(domainName, dirPath) {
    return vhost(domainName, express.static( dirPath ));
}
