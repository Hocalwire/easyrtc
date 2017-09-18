"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

function submitSubscriptionDetails(req,res,next){
	console.log('Inside submitSubscriptionDetails ==================>>>>>>>>>>> ');
	if(!req.body) {
		next();
		return;
	}
	// var otp = req.body.otp;
	// var phoneNo = req.body.phoneNo;
	// var registerId = req.body.registerId;
	var options = {
                    rdm : apiHelper.getURL(Constants.submitSubscriptionDetailsUrl,req.parentPartner  || req.partner)
    };
    // options.rdm.setRDMProperty("1","code",otp); 
    // options.rdm.setRDMProperty("1","phoneNo",phoneNo); 
    // options.rdm.setRDMProperty("1","registerId",registerId);
    // options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    // options.rdm.setRDMProperty("1","deviceId","2323232323232");
    
    apiHelper.get(options, req, res).then(
    	function(rdm){
    		//success
    		console.log("==============================================submitSubscriptionDetails");
    		console.log(rdm.toXML());
    		res.send({errorCode:rdm.getRDMAttribute('errorCode')});

    	},function(){
    		//Fail
    		res.send({errorCode:-1});
    	}
    ).catch(function(e){
    	logger.error('error in login:', e.message);
        next(e);
    });
}
function forgotPassword(req,res,next){
	console.log('Inside forgotPassword');
	if(!req.body) {
		next();
		return;
	}
}
function registerUser(req,res,next){
	if(!req.body) {
		next();
		return;
	}
	
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var phone = req.body.mobile_no;
	var password = req.body.password;
	var confirmPassword = req.body.confirm_pass;

	console.log('login requested: '+firstName+" : "+lastName+" : "+email+" : "+phone+" : "+password+" : "+confirmPassword);

	var options = {
                    rdm : apiHelper.getURL(Constants.registerUrl,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","phoneNo",phone); 
    options.rdm.setRDMProperty("1","password",password);
    options.rdm.setRDMProperty("1","firstName",firstName);
    options.rdm.setRDMProperty("1","lastName",lastName);
    options.rdm.setRDMProperty("1","email",email);
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    
    apiHelper.get(options, req, res).then(
    	function(rdm){
    		//success
    		console.log("==============================================REGISTER");
    		console.log(rdm.toXML());
    		res.send({errorCode:rdm.getRDMAttribute('errorCode'),registerId:rdm.getRDMProperty('1','registerId'),phoneNo:rdm.getRDMProperty('1','phoneNo')});

    	},function(){
    		//Fail
    		res.send({errorCode:-1});
    	}
    ).catch(function(e){
    	logger.error('error in login:', e.message);
        next(e);
    });
};
function loginUser(req,res,next){
	if(!req.body) {
		next();
		return;
	}
	var phone = req.body.mobile_no;
	var password = req.body.password;
	console.log('login requested: '+phone+" : "+password);

	var options = {
                    rdm : apiHelper.getURL(Constants.loginUrl,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","phoneNo",phone); 
    options.rdm.setRDMProperty("1","password",password);
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    
    apiHelper.get(options, req, res).then(
    	function(rdm){
            var cookie = req.cookies["redirect_url"];
            if(!cookie) cookie = "";
            Utils.writeCookie(req,res,"redirect_url",req.query.redirectURL,(10));
    		res.send({errorCode:rdm.getRDMAttribute('errorCode'),redirectURL:cookie});
    	},function(){
    		//Fail
    		res.send({errorCode:-1});
    	}
    ).catch(function(e){
    	logger.error('error in login:', e.message);
        next(e);
    });
};
function contactus(req,res,next){
    if(!req.body) {
        next();
        return;
    }
    
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    
    
    var options = {
                    rdm : apiHelper.getURL(Constants.sendEmail,req.parentPartner || req.partner)
    };
    var message = name + " has contacted you using your website "+req.environment.rootUrl+"\n Email Address is : "+email +" \n Message sent :"+message;
    subject="User Contacted : "+subject;
    
    
    options.rdm.setRDMProperty("1","subject",subject); 
    options.rdm.setRDMProperty("1","text",message);
    console.log(options.rdm.toXML());
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
            console.log("==============================================REGISTER");
            console.log(rdm.toXML());
            res.send({errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
};
function saveAndFollow(req,res,next){
    var query = req.query;
    var content_id = req.content_id;
    var content_type = req.content_type;
    var follow = query.follow;
    var bookmark = query.bookmark;
    var url = query.url;
    if(!content_id && !content_type && !url){
        res.send({errorCode:-1,"message":"Nothing specified to follow or book mark"});
    }
    var options = {
        rdm : apiHelper.getURL(Constants.saveOrFollow,req.partner)
    }
    if(content_type!=undefined){
        options.rdm.setRDMProperty("1","content_type",content_type);     
    }
    if(content_id!=undefined){
        options.rdm.setRDMProperty("1","content_id",content_id);     
    }
    if(url!=undefined){
        options.rdm.setRDMProperty("1","url",url);     
    }
    if(follow!=undefined){
        options.rdm.setRDMProperty("1","follow",follow);     
    }
    if(bookmark!=undefined){
        options.rdm.setRDMProperty("1","bookmark",bookmark);     
    }
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
            console.log("==============================================REGISTER");
            console.log(rdm.toXML());
            res.send({errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
};
function requestTrialPackageAccess(req,res,next){
    var query = req.query;
    var options = {
        rdm : apiHelper.getURL(Constants.requestForTrialPlan,req.partner)
    }
    var message = req.body.trial_requirement;
    options.rdm.setRDMProperty("1","message",message);
    apiHelper.get(options, req, res).then(
        function(rdm){
            console.log("==============================================SUBSCRIPTION");
            console.log(rdm.toXML());
            res.send({errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
};
module.exports.submitSubscriptionDetails = submitSubscriptionDetails;
module.exports.saveAndFollow = saveAndFollow;
module.exports.requestTrialPackageAccess = requestTrialPackageAccess;
