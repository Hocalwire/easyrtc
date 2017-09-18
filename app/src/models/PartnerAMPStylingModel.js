
'use strict';

var apiHelper = require('src/libs/apiHelper');
var logger = require('src/libs/logger');
var Constants = require('src/locales/Constants');
var partnerConfig = require('src/config/PartnerConfig');
var PartnerAMPStylingModel = {};
var cacheExpireDuration = 24*60*60*1000;
var fs = require('fs');
var Promise = require('promise');
PartnerAMPStylingModel.fetch = function(partner) {
    console.log("Fetch requested 8888");
    return fetchPartnersStyling(partner);
};
PartnerAMPStylingModel.promises = {};
PartnerAMPStylingModel.data = {};
PartnerAMPStylingModel.lastFetchedTime = {};



function fetchPartnersStyling(partner) {
    // return false;
    var currentTime = new Date().getTime();

    PartnerAMPStylingModel.lastFetchedTime[partner] = PartnerAMPStylingModel.lastFetchedTime[partner] || currentTime;
   
    // re-fetch in every 24 hours
    if ((currentTime - PartnerAMPStylingModel.lastFetchedTime[partner] < cacheExpireDuration) && PartnerAMPStylingModel.promises[partner]) {
        console.log("Returning Promise from cache*************");
        return PartnerAMPStylingModel.promises[partner];
    }

    logger.info('fetching stylinh props'+partner);

    // change last fetch time to now
    PartnerAMPStylingModel.lastFetchedTime[partner] = currentTime;
    // var catsToFetch = ["popular","latest","crime","events","personalities","awareness","develppments"];
    console.log("fetching");
        PartnerAMPStylingModel.promises[partner] = getPartnerStylingApi(partner);
        console.log(PartnerAMPStylingModel.promises[partner]);
       
        PartnerAMPStylingModel.promises[partner].then(
            function(response){
                PartnerAMPStylingModel.data[partner] = response;
            },
            function(err){
                PartnerAMPStylingModel.promises[partner] = null;
                PartnerAMPStylingModel.data[partner] = null;
            });


    return PartnerAMPStylingModel.promises[partner];
}

function getPartnerStylingApi(partner){
    console.log("inside styling promise************");
    var path = "src/partners/"+partner+"/styles/partner_amp.css";
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
PartnerAMPStylingModel.getPartnerStylingData = function(req){
    return PartnerAMPStylingModel.data[req.environment.partner];
};
PartnerAMPStylingModel.getPartnerStylingDataByPartner = function(partner){
    return PartnerAMPStylingModel.data[partner];
};
module.exports = PartnerAMPStylingModel;

