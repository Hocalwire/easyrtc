var Utils = require('src/libs/Utils');
var logger = require('src/libs/logger');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var staticPageHandler = require("src/controller/renderStaticPage");

module.exports.setup = function(app) {
    // development error handler
    // will print stacktrace

    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            console.log("**********************************************\n\n\n 404 page error");
            res.status(err.status || 500);
            if (err.status === 404) {
                // show 404 page
                logger.info('Page Not Found', req.url);
                if(req.requestContentType=="resource"){
                    res.send("error");
                } else {
                    staticPageHandler.renderStaticPage(req,res,next,{"template":"404","status":404},true);
                    // res.render(PartnerPropsModel.data[req.partner]["theme"]+'/404', {
                    
                    // });    
                }
                
            } else {
                logger.error(err.message);
                logger.info(err.stack);

                if (req.xhr || res.status===495 || res.status==="495") {
                    res.send(err.message);
                } else {
                    if(req.requestContentType=="resource"){
                        res.send("error");
                    } else {
                        staticPageHandler.renderStaticPage(req,res,next,{"template":"error","status":500},true);
                        
                    }
                    
                }
            }
        });
    } else {
        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
           
            res.status(err.status || 500);

            if (err.status === 404) {
                // show 404 page
                staticPageHandler.renderStaticPage(req,res,next,{"template":"404","status":404},true);
                // res.render(PartnerPropsModel.data[req.partner]["theme"]+'/404', {
                   
                // });
            } else {
                logger.error(err.message);
                logger.info(err.stack);

                if (req.xhr || res.status===408 || res.status===409 || res.status==="409" || res.status==="408") {
                    res.send('Some Error Occured!!');
                } else {
                    staticPageHandler.renderStaticPage(req,res,next,{"template":"error","status":500},true);
                    // res.render(PartnerPropsModel.data[req.partner]["theme"]+'/error', {
                    //     message: err.message,
                    //     error: {},

                    // });
                }
            }
        });
    }

};
