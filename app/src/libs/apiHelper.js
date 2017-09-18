"use strict";

var http = require('http');
var https = require('https');
var Promise = require('promise');
var Utils = require('src/libs/Utils');
var Constants = require("src/locales/Constants");
var RDM = require("src/libs/RDM");
var logger = require('src/libs/logger');
var requestStartCount=0;
var requestCompleteCount=0;
var config = require('src/config/PartnerConfig');
var app;
var isDevMode = false;

module.exports.setup = function(expressApp) {
    app = expressApp;
    if(app.get('env')=="development"){
        isDevMode=true;
    }
};


/**
 *  Return a promise
 * @param  {Object} options
 * @return {Object} promise object containing the result
 */
function getIP(req){
    var ip;
    if(req.headers['x-forwarded-for']) {
        ip=req.headers['x-forwarded-for'].split(",")[0];
    } else if(req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }

    return ip;
}

var getRequest = function(options,req,res) {
    requestStartCount++;
    logger.error("api request count - "+requestStartCount);
    // logger.log('info', 'calling api '+options.rdm.getRDMAttribute("action"));
    var reqHeaders = {};
    var d = new Date();
    options.rdm.setRDMAttribute("client","web");
    var currGMT = (d.getTime() + (d.getTimezoneOffset() * 60 * 1000));
    currGMT = Utils.getStringFromDate(new Date(currGMT));
    currGMT = currGMT.split("/").join("-");
    options.rdm.setRDMAttribute("req_time",currGMT);
    if(req){

        var clientHeader=req.headers;
        if(clientHeader && clientHeader['cookie']){
            reqHeaders['Cookie'] = clientHeader['cookie'];
            
        }
        reqHeaders['User-Agent'] = clientHeader['user-agent'];
        //extra headers wriiten
        if(clientHeader['accept']){
            reqHeaders['Accept'] = clientHeader['accept'];
        }
        if(clientHeader['accept-language']){
            reqHeaders['Accept-Language'] = clientHeader['accept-language'];
        }
        if(clientHeader['cache-control']){
            reqHeaders['Cache-Control'] = clientHeader['cache-control'];
        }

        if(clientHeader['connection']){
            reqHeaders['Connection'] = clientHeader['connection'];
        }
        if(clientHeader['if-none-match']){
            reqHeaders['If-None-Match'] = clientHeader['if-none-match'];
        }
        if(clientHeader['referer']){
            reqHeaders['Referer'] = clientHeader['referer'];
        }

        reqHeaders['Client-IP'] = getIP(req) ? getIP(req) : "localhost";

    }
    reqHeaders['Accept-Encoding'] = 0;
    
    var encodePath = encodeURIComponent(options.rdm.toXML());
    
    // logger.info(encodePath);
    if(options.host){
        options["path"]= Constants.getRDMGetway(true)+"&platform=native&data="+encodePath;
    } else {
        options["path"]= Constants.getRDMGetway()+"&platform=native&data="+encodePath;    
    }
    
    // logger.info(options.path);

    //logger.profile("api requested completed"+options.path);

    return new Promise(function(resolve, reject) {
        logger.info("inside promise");
        options.port = options.port ? options.port : (options.host ? "80": app.get('config').api.port);
        options.host = options.host || app.get('config').api.host;
        options.headers=reqHeaders;
        // logger.info(options.path);
        var protocol = app.get('config').protocol ? app.get('config').protocol : "http";
        var requestType = (protocol==="https" ? https : http);
        // options.path = encodeURIComponent(options.path);

        var str = '';
        //logger.info(requestType);

        if(protocol==="https"){
            options.agent = https.globalAgent;
        //options.agent.options.ca = cas;
        }
        var startTime = new Date().getTime();
        var dataStartedRecieving=false;
        

        var getRequestObject  = requestType.get(options, function(resp) {

            

            if(res){ //write cookie and other header values to response
                    if(resp['headers']['set-cookie']) {
                        res.setHeader('Set-Cookie',resp['headers']['set-cookie']);
                    }
            }

            resp.on('data', function(chunk){
                //do something with chunk
                if(!dataStartedRecieving){
                        dataStartedRecieving=true;
                        logger.error("SPEED_SLOW api request connected --------   started receiving data count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
                }

                str += chunk;
            });

            resp.on("end", function() {


                if (resp.statusCode === 200) {
                    try {
                        var rdm = RDM.parse(str);
                        var resTime = rdm.getRDMAttribute("res_time");
                        // console.log(rdm.toXML());
                        if(resTime){
                            resTime = new Date(resTime).getTime();
                            var d = new Date();
                            var currGMT = (d.getTime() + (d.getTimezoneOffset() * 60 * 1000));
                            var delta = currGMT - parseInt(resTime);
                            logger.error("TIME DELTA --------------------From Server To Response Received------------------------- "+delta)
                        }
                        logger.error("reponse rdm error code is:"+rdm.getRDMAttribute("errorCode"));
                        resolve(rdm);
                        //logger.profile("api requested completed"+options.path);
                        requestCompleteCount++;
                        logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
                    } catch(e) {
                        reject(e);
                        //logger.profile("api requested completed"+options.path);
                        requestCompleteCount++;
                        logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
                    }
                } else {
                    logger.error("SPEED_SLOW Got error with statusCode " + resp.statusCode);
                    var error = new Error(str);
                    error.status = resp.statusCode;

                    try {
                        
                        reject(error);
                        // //logger.profile("api requested completed"+options.path);
                        requestCompleteCount++;
                        logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
                    } catch(e) {
                        logger.error("Got error with statusCode " + resp.statusCode);
                        var error = new Error(resp.statusCode);
                        error.status=resp.statusCode;
                        reject(error);
                        // //logger.profile("api requested completed"+options.path);
                        requestCompleteCount++;
                        logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
                    }
                    //reject(new Error('Some Error Occured'),resp.statusCode);
                }
            });

        });
        getRequestObject.on("error", function(e){
            logger.log("SPEED_SLOW error", "Got Error: " + e.message +" ================= for request:"+(options.rdm ? options.rdm.toXML() : ""));
            reject(e);
            //logger.profile("api requested completed"+options.path);
            requestCompleteCount++;
            logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
        });

        getRequestObject.setTimeout((10*1000), function( ) {
            logger.error("SPEED_SLOW request timeout happened*************** ABORTED========================"+options.path);
            var error = new Error(400);
            error.status = "400";
            var resp = {"statusCode":"400"};
            try {
                logger.error("TIMEOUT REQUEST:::::::::::"+options.rdm.toXML());
                reject(error);
                //logger.profile("api requested completed"+options.path);
                requestCompleteCount++;
                logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
            } catch(e) {
                logger.error("Got error with statusCode " + resp.statusCode);

                var error = new Error(resp.statusCode);
                error.status=resp.statusCode;
                reject(error);
                //logger.profile("api requested completed"+options.path);
                requestCompleteCount++;
                logger.error("SPEED_SLOW api request completed count - "+requestCompleteCount +" Time:" + (new Date().getTime()-startTime)+" path :"+options.path+"  pending cocunt:"+(requestStartCount-requestCompleteCount));
            }
        });
    });
};



module.exports.post = function(req,res,options, postData) {
    postData=JSON.stringify(postData);

    var headers = {};
    var clientHeader=(req ? req.headers : {});
    if(!clientHeader && req && req.headers){
        clientHeader=req.headers;
        if(clientHeader['user-agent']){
            headers['User-Agent'] = clientHeader['user-agent'];
        }

    }
    options.rdm.setRDMAttribute("client","web");
    headers['Content-Type'] = clientHeader['content-type'] || 'application/x-www-form-urlencoded';

    headers['Content-Length'] = postData.length;
    if(clientHeader && clientHeader['cookie']){
        headers['Cookie'] = clientHeader['cookie'];
    }
    headers['User-Agent'] = clientHeader['user-agent'];
    headers['Accept-Encoding'] = 0;
    
        if(clientHeader['accept']){
            headers['Accept'] = clientHeader['accept'];
        }
        // headers['Accept-Encoding'] = clientHeader['accept-encoding'];
        if(clientHeader['accept-language']){
            headers['Accept-Language'] = clientHeader['accept-language'];
        }
        if(clientHeader['cache-control']){
            headers['Cache-Control'] = clientHeader['cache-control'];
        }

        if(clientHeader['connection']){
            headers['Connection'] = clientHeader['connection'];
        }
        if(clientHeader['if-none-match']){
            headers['If-None-Match'] = clientHeader['if-none-match'];
        }
        if(clientHeader['referer']){
            headers['Referer'] = clientHeader['referer'];
        }

    

    return new Promise(function(resolve, reject) {
        var postOptions = {
            host: options.host || app.get('config').api.host,
            port: options.port || app.get('config').api.port,
            path: options.path,
            method: 'POST',
            headers: headers
        };
        //postOptions.path = "/data/v1/entity/city/xxxx"; //remove this code after testing
        var protocol = app.get('config').protocol ? app.get('config').protocol : "http";
        var requestType = (protocol==="https" ? https : http);
        if(protocol==="https"){
            options.agent = https.globalAgent;
        //options.agent.options.ca = cas;
        }

        var postReq = requestType.request(postOptions, function(resp) {
            var str = '';
                       //check for MD5 logic
            
            if(res){ //write cookie and other header values to response
                if(resp['headers']['set-cookie']) {
                    res.setHeader('Set-Cookie',resp['headers']['set-cookie']);
                }

                if (resp.headers['content-encoding']) {
                    res.setHeader('Content-Encoding', resp.headers['content-encoding']);
                }

                if (resp.headers['content-type']) {
                    res.setHeader('Content-Type', resp.headers['content-type']);
                }
            }

            if (resp.statusCode === 200) {

                //resp.setEncoding('utf8');
                resp.on('data', function (chunk) {
                    //logger.info(chunk);
                    str += chunk;
                });

                resp.on('end', function() {
                    resolve(str);
                });
            } else {
                logger.error("Got error with statusCode " + resp.statusCode);

                resp.on('data', function (chunk) {
                    str += chunk;
                });

                resp.on("error",function(){
                });

                resp.on('end', function() {
                    var error = new Error(str);
                    error.status = resp.statusCode;

                    try {
                        if(str){ //status code capture for CAPTCHA
                            var result = JSON.parse(str);
                            if(result && result.statusCode && result.statusCode==="495"){
                                error.status=495;
                            }
                        }
                        reject(error);
                    } catch(e) {
                        var error = new Error(resp.statusCode);
                        error.status=resp.statusCode;
                        reject(error);
                    }

                });

            }
        }).on("error", function(e) {
            logger.error("Got error in post: " + e.message);

            reject(e);
        });

        // post the data
        postReq.write(postData);
        postReq.end();
    });

};
module.exports.getURL = function(url,partner) {
    return new RDM(url,partner);
};
module.exports.get = getRequest;


