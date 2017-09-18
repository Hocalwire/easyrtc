
'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var partnerConfig = require('src/config/PartnerConfig');
var PartnerStylingModel = {};
var cacheExpireDuration = 24*60*60*1000;
var fs = require('fs');
var Promise = require('promise');
PartnerStylingModel.fetch = function(partner) {
    console.log("Fetch requested 8888");
    return fetchPartnersStyling(partner);
};
PartnerStylingModel.promises = {};
PartnerStylingModel.data = {};
PartnerStylingModel.lastFetchedTime = {};



function fetchPartnersStyling(partner) {
    // return false;
    var currentTime = new Date().getTime();

    PartnerStylingModel.lastFetchedTime[partner] = PartnerStylingModel.lastFetchedTime[partner] || currentTime;
   
    // re-fetch in every 24 hours
    if ((currentTime - PartnerStylingModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerStylingModel.promises[partner]) {
        console.log("Returning Promise from cache*************");
        return PartnerStylingModel.promises[partner];
    }

    logger.info('fetching stylinh props'+partner);

    // change last fetch time to now
    PartnerStylingModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    console.log("fetching");
        PartnerStylingModel.promises[partner] = getPartnerStylingApi(partner);
        console.log(PartnerStylingModel.promises[partner]);
       
        PartnerStylingModel.promises[partner].then(
            function(response){
                PartnerStylingModel.data[partner] = response;
            },
            function(err){
                PartnerStylingModel.promises[partner] = null;
                PartnerStylingModel.data[partner] = null;
            });


    return PartnerStylingModel.promises[partner];
}

function getPartnerStylingApi(partner){
    console.log("inside styling promise************");
    var path = "src/partners/"+partner+"/styles/partner.css";
    console.log("path to file=================="+path);
    return new Promise(function(resolve, reject) {
        console.log("\n\n\n\n\n\n\n=====================called promise to resolve or reject=============");
        var contents = "body {} ";
        try {
        
            var content;
            if (fs.existsSync(path)) {
 
                fs.readFile(path, "utf-8",function read(err, data) {
                    if (err) {
                        throw err;
                    }
                    content = data;
                    console.log(content);
                    resolve(content);
                });
                
            } else {
                console.log("\n\n\n\n\n\n\n=====================called promise to resolve or reject else case=============");
                resolve(contents);
            }
           
        } catch(e){
            console.log("\n\n\n\n\n\n\npromise rehjected\n\n\n\n");
            reject(contents);
        }
    });
    
};
PartnerStylingModel.getPartnerStylingData = function(req){
    return PartnerStylingModel.data[req.environment.partner];
};
PartnerStylingModel.getPartnerStylingDataByPartner = function(partner){
    return PartnerStylingModel.data[partner];
};
module.exports = PartnerStylingModel;

