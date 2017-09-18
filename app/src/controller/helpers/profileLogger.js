
"use strict";

var Utils = require("src/libs/Utils");
var logger = require('src/libs/logger');

var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ 'timestamp': true,"level":"error"}),
        new (winston.transports.File)({ filename: 'profile-logger', 'timestamp': true,"level":"error",'maxsize':10000000})
    ]
});

function logDetails(req,type,props)    {
    if(!req.environment.partnerData.enable_logging){
        return;
    }
    var partner = req.partner;
    
    var p = "Partner:  "+partner + " type: "+type;
    console.log(props)
    for(var k in props){
        p+=" "+k + " : "+props[k];
    }
    console.log(p);
    logger.error(p);
}

module.exports.logDetails = logDetails;
