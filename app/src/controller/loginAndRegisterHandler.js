"use strict";
var logger = require('src/libs/logger');
var Utils = require("src/libs/Utils");
var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');
var PartnerPropsModel = require('src/models/PartnerPropsModel');
var commonController = require("src/controller/helpers/commonController");
var commonContentController = require("src/controller/helpers/commonContentController");
var staticMixinController = require("src/controller/helpers/staticMixinController");
var staticDataController = require("src/controller/helpers/staticDataController");
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');
var request = require("request");
function verifyOTP(req,res,next){
	console.log('Inside verifyOTP');
	if(!req.body) {
		next();
		return;
	}
	var otp = req.body.otp;
	var phoneNo = req.body.phoneNo;
	var registerId = req.body.registerId;
	var options = {
                    rdm : apiHelper.getURL(Constants.validateOTPUrl,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","code",otp); 
    options.rdm.setRDMProperty("1","phoneNo",phoneNo); 
    if(registerId)
        options.rdm.setRDMProperty("1","registerId",registerId);
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    
    apiHelper.get(options, req, res).then(
    	function(rdm){
    		//success
    		console.log("==============================================ValidateOTP");
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

function openPaymentStatus(req,res,next){
    var id = req.query.payment_id;
    var options = {
                    rdm : apiHelper.getURL(Constants.getPaymentStatus,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","payment_id",id); 
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            //parse Payment data here

            //render payment details and template page

            var dataV = {};
            dataV.data = Constants.paymentsStatus[id];
            res.render(PartnerPropsModel.data[req.partner]["theme"]+"/paymentstatus", {
                data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });

            //success
            // console.log("==============================================ValidateOTP");
            // // console.log(rdm.toXML());
            // var errorCode = rdm.getRDMAttribute('errorCode');
            // var redirectUrl = "/payments/payment-status";
            // if(errorCode==0 && rdm.getRDMProperty("1","redirectUrl")){
            //     redirectUrl = rdm.getRDMProperty("1","redirectUrl");
            // }
            // res.redirect(301,redirectUrl);
            // res.end();
            // res.send({errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function openPaymentDetails(req,res,next){
    console.log('Inside openPaymentDetails');
    if(!req.body) {
        next();
        return;
    }
    var name = req.body.name;
    var plan = req.body.plan;
    var region = req.body.region;
    var cost = req.body.cost;
    var options = {
                    rdm : apiHelper.getURL(Constants.submitPayment,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","name",name); 
    options.rdm.setRDMProperty("1","plan",plan); 
    options.rdm.setRDMProperty("1","region",region);
    options.rdm.setRDMProperty("1","cost",cost);
   
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
            console.log("==============================================ValidateOTP");
            // console.log(rdm.toXML());
            var errorCode = rdm.getRDMAttribute('errorCode');
            var redirectUrl = "/payments/fake-payment-status";
            if(errorCode==0 && rdm.getRDMProperty("1","redirectUrl")){
                redirectUrl = rdm.getRDMProperty("1","redirectUrl");
            }
            res.redirect(301,redirectUrl);
            res.end();
            // res.send({errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function subscribeForEmailUpdates(req,res,next){
    console.log('Inside subscribeForEmailUpdates');
    console.log(req.body);
    if(!req.body || !req.body.email) {
        next();
        return;
    }
    var email = req.body.email;
    var options = {
                    rdm : apiHelper.getURL(Constants.getSubscribeForUpdates,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","email",email); 
    options.rdm.setRDMProperty("1","name",req.body.name); 
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
           
            var errorCode = rdm.getRDMAttribute('errorCode');
            res.send(200,{errorCode:rdm.getRDMAttribute('errorCode')});

        },function(){
            //Fail
            res.send(500,{errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function showFakePaymentPage(req,res,render){
    res.render(PartnerPropsModel.data[req.partner]["theme"]+"/fakepaymentstatus", {
                data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });
}
function regenerateEmailCode(req,res,next,isForgot){
    if(!req.body) {
        next();
        return;
    }
    var email = req.body.email;
    
    var options = {
                    rdm : apiHelper.getURL(Constants.regenerateEmailCode,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","email",email); 
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    if(isForgot){
        options.rdm.setRDMProperty("1","is_reset",true);
    }
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
            console.log("==============================================ValidateOTP");
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
function verifyEmail(req,res,next){
    console.log('Inside verifyOTP');
    if(!req.body) {
        next();
        return;
    }
    var otp = req.query.code;
    var registerId  = req.query.registerId;
    
    var options = {
                    rdm : apiHelper.getURL(Constants.validateOTPUrl,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","registerId",registerId);
    options.rdm.setRDMProperty("1","code",otp); 
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    apiHelper.get(options, req, res).then(
        function(rdm){
            var dataV = {};
            dataV['status'] = rdm.getRDMAttribute('errorCode');
            console.log(rdm.toXML());
            // if(dataV['status']=='0'){
            //     res.redirect(301,"/login");
            //     return;
            // }
            res.render(PartnerPropsModel.data[req.partner]["theme"]+"/verifyEmail", {
                data : dataV
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                
                    res.send(200, html);
                });

        },function(){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function forgotPassword(req,res,next){
	return regenerateEmailCode(req,res,next,true);
 //    console.log('Inside forgotPassword');
	// if(!req.body) {
	// 	next();
	// 	return;
	// }
 //    // var otp = req.query.code;
 //    var registerId  = req.query.registerId;
    
 //    var options = {
 //                    rdm : apiHelper.getURL(Constants.remindPassword,req.parentPartner || req.partner)
 //    };
 //    options.rdm.setRDMProperty("1","registerId",registerId);
 //    options.rdm.setRDMProperty("1","email",req.body.email); 
 //    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
 //    options.rdm.setRDMProperty("1","deviceId","2323232323232");
 //    apiHelper.get(options, req, res).then(
 //        function(rdm){
 //            console.log(rdm.toXML());
 //            res.send({errorCode:rdm.getRDMAttribute('errorCode')});
 //        },function(){
 //            next(e);
 //        }
 //    ).catch(function(e){
 //        logger.error('error in login:', e.message);
 //        next(e);
 //    });
}
function resetPassword(req,res,next){
    console.log('Inside verifyOTP');
    if(!req.body) {
        next();
        return;
    }
    console.log(req.body);
    var otp = req.body.code;
    var email  = req.body.email;
    var newspassword = req.body.password;
    
    var options = {
                    rdm : apiHelper.getURL(Constants.setNewPassword,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","email",email);
    options.rdm.setRDMProperty("1","code",otp); 
    options.rdm.setRDMProperty("1","password",newspassword); 
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    apiHelper.get(options, req, res).then(
        function(rdm){
            res.send({errorCode:rdm.getRDMAttribute('errorCode')});
        },function(){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function registerUser(req,res,next){
	if(!req.body) {
		next();
		return;
	}
    console.log(req.body);
	
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var email = req.body.email;
	var phone = req.body.mobile;
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
    console.log(options.rdm.toXML());
    apiHelper.get(options, req, res).then(
    	function(rdm){
    		//success
    		console.log("==============================================REGISTER");
    		console.log(rdm.toXML());
    		res.send({errorCode:rdm.getRDMAttribute('errorCode'),registerId:rdm.getRDMProperty('1','registerId'),phoneNo:rdm.getRDMProperty('1','phoneNo'),'validation':rdm.getRDMProperty('1','validation'),email:rdm.getRDMProperty('1','email')});

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
    var email = req.body.email;
	var password = req.body.password;
	console.log('login requested: '+phone+" : "+password);

	var options = {
                    rdm : apiHelper.getURL(Constants.loginUrl,req.parentPartner || req.partner)
    };
    if(phone){
        options.rdm.setRDMProperty("1","phoneNo",phone);     
    }
    if(email){
        options.rdm.setRDMProperty("1","email",email);     
    }
    options.rdm.setRDMProperty("1","password",password);
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    
    apiHelper.get(options, req, res).then(
    	function(rdm){
            var cookie = req.cookies["redirect_url"];
            if(!cookie) cookie = "";
            cookie = decodeURIComponent(cookie);
            if(req.query.redirectURL){
                Utils.writeCookie(req,res,"redirect_url",req.query.redirectURL);
            } else {
                Utils.writeCookie(req,res,"redirect_url",cookie,(10));
            }
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
    console.log(req.body);
    
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;
    var phone = req.body.phone;
    
    var options = {
                    rdm : apiHelper.getURL(Constants.sendEmail,req.parentPartner || req.partner)
    };
    var message = name + " has contacted you using your website "+req.environment.rootUrl+"\n Email Address is : "+email + (phone? "\n Phone No is: "+phone :'')+" \n Message sent :"+message;
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
function verifyLogin(req,res,next){
    if(!req.body) {
        next();
        return;
    }
    
};
function getProfileExtraInfo(req,res,next){
    var options = {
        rdm : apiHelper.getURL(Constants.getContentData,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","sendSync",true);
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            console.log(rdm.toXML());
            res.send({"errorCode":0});
        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });   
}
function parseLocationData(rdm){
    var data = [];
    for(var k in rdm.rdRows){
        var d = {};
        var id = rdm.rdRows[k].id;
        for(var j in rdm.rdRows[k]){
            d[j] = rdm.rdRows[k][j];
            // console.log(d[j]);

        }
        // if(d.imageId && partner){
        //     d['partner'] = partner;
        //     d['mediaUrl'] = Utils.getMediaUrl(d,[d.imageId]); //env.rootUrl+    
        // } else {
        //     d["mediaUrl"] = "/images/logo.png";
        // }
        // d.name = Utils.replaceHtmlEntities(d.name);
        d.childs = [];
        data.push(d);
    }
    
    data = data.sort(function(a,b){
            var a1 = a.sorting_order ? a.sorting_order :1;
            var b1 = b.sorting_order ? b.sorting_order : 1;
            if(a1!=b1){
                return a1-b1;
            } else {
                return a.name > b.name ? 1 : -1;
            }
            // var res = (a.sorting_order) 
            // return (a.sorting_order - b.sorting_order);
    });
    console.log(data);
    return data;
}
function getLocationExtraInfo(req,res,next){
    console.log("getLocationExtraInfo---------------");
    var parentId = req.query.parentId;
    var options = {
        rdm : apiHelper.getURL(Constants.getLocationsUrl,req.parentPartner || req.partner)
    };
    if(parentId) {
        options.rdm.setRDMProperty("1","parentId",parentId);  
        
    } else {
        options.rdm.setRDMProperty("1","onlyParent",true);  
        
    }
    options.rdm.setRDMProperty("1","sendSync",true);   
    apiHelper.get(options, req, res).then(
        function(rdm){
            console.log(rdm.toXML());
            var data = parseLocationData(rdm);
            res.send({"errorCode":rdm.getRDMAttribute("errorCode"),"data":data});

        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in fetching locations:');
        next(e);
    });   
}
function logout(req,res,next){
    
    if(!req.body) {
        next();
        return;
    }
    
    var redirectURL = req.body.redirectURL ? req.body.redirectURL  :"/";
    console.log("==================");
    console.log(req.body);

    var options = {
                    rdm : apiHelper.getURL(Constants.logout,req.parentPartner || req.partner)
    };
   
    options.rdm.setRDMProperty("1","sendSync",true);
    
    apiHelper.get(options, req, res).then(
        function(rdm){
            res.send({"redirectURL":redirectURL});
        },function(e){
            next(e);
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
};

function handleRequest(req,res,next){
    var pathname = req.pathname;
    if(pathname==Utils.clientConstants.url.xhrLogin){
        loginUser(req,res,next);
    }
    else if(pathname==Utils.clientConstants.url.xhrRegister){
        
        registerUser(req,res,next);
    }
    else if(pathname==Utils.clientConstants.url.xhrForgotPassword){
        forgotPassword(req,res,next);
    }else if(pathname==Utils.clientConstants.url.xhrResetPassword){
        resetPassword(req,res,next);
    }
    else if(pathname==Utils.clientConstants.url.xhrVerify){
        verifyOTP(req,res,next);
    }
    else if(pathname==Utils.clientConstants.url.xhrRegenerateEmailCode){
        regenerateEmailCode(req,res,next);
    }
    else if(pathname==Utils.clientConstants.url.xhrLogout){
        logout(req,res,next);
    }
    else if(pathname=="/xhr/admin/login/subscribe-for-updates"){
        subscribeForEmailUpdates(req,res,next);
    }else if(pathname=="/xhr/admin/login/subscribe-for-email-updates"){
        subscribeForEmailUpdatesNew(req,res,next);
    } else if(pathname=="/profile"){
        showProfilePage(req,res,next);
    } else if(pathname=="/xhr/admin/login/submitProfileInfo"){
        updateProfileInfo(req,res,next);
    }else if(pathname=="/xhr/admin/login/getUserProfileExtraInfo"){
        getProfileExtraInfo(req,res,next);
    }else if(pathname=="/xhr/admin/login/getUserLocationExtraInfo"){
        getLocationExtraInfo(req,res,next);
    }else if(pathname=="/xhr/admin/login/submit-ad-lead"){
        submitAdLead(req,res,next);
    }
    else if(pathname=="/xhr/admin/login/get-user-status"){
        getUserStatus(req,res,next);
    } else {
        res.status(404);
        next();
    }
}
function handlePaymentRequest(req,res,next){
    var pathname = req.pathname;
    if(pathname=="/payments/payment-status"){
        openPaymentStatus(req,res,next);
    }
    if(pathname=="/payments/fake-payment-status"){
        
        showFakePaymentPage(req,res,next);
    }
    if(pathname=="/payments/submit-payments" || pathname=="/xhr/admin/payments/submit-payments"){
        openPaymentDetails(req,res,next);
    }
    
}
function handleJoinUs(req,res,next) {
    
    if(!req.body) {
        next();
        return;
    }
    var options = { rdm : apiHelper.getURL(Constants.createContentUrl,req.parentPartner || req.partner)};
    var onBehalf = req.query.on_behalf ? req.query.on_behalf : 0;
    if(onBehalf){
        options.rdm.setRDMAttribute("agentId",onBehalf);
        options.rdm.setRDMAttribute("registeredBy","agent");
    }

    for(var key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            var item = req.body[key];
            var id;
            if(key.indexOf("_")>-1){
                try {
                    id = key.split("_")[1];  
                } catch(e){
                    id="1";
                }
            }  else {
                id = key;
            }

            options.rdm.setRDMProperty(id,key,item); 
        }
    }
    var content_type=req.query.content_type_name || req.body.content_type_name;
    options.rdm.setRDMProperty("1","content_type_name",content_type);
    options.rdm.setRDMAttribute("content_type_name",content_type);
    apiHelper.get(options, req, res).then(
        function(rdm){
            res.send({"contentId":rdm.getRDMProperty("1","contentId"),"userId":rdm.getRDMProperty("1","userId"),errorCode:rdm.getRDMAttribute('errorCode')});
        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function updateProfileInfo(req,res,next) {
    
    if(!req.body) {
        next();
        return;
    }
    console.log(req.body);
    // res.end();
    var firstName = req.body.first_name;
    var lastName = req.body.last_name;
    var email = req.body.email;
    var phone = req.body.phone;
    var gender = req.body.hosting;
    var password = req.body.password;
    var confirmPassword = req.body.confirm_pass;

    console.log('login requested: '+firstName+" : "+lastName+" : "+email+" : "+phone+" : "+password+" : "+confirmPassword+" : "+gender);

    var options = {
                    rdm : apiHelper.getURL(Constants.updateUserUrl,req.parentPartner || req.partner)
    };
    options.rdm.setRDMProperty("1","phoneNo",phone); 
    options.rdm.setRDMProperty("1","password",password);
    options.rdm.setRDMProperty("1","firstName",firstName);
    options.rdm.setRDMProperty("1","lastName",lastName);
    options.rdm.setRDMProperty("1","gender",gender);
    options.rdm.setRDMProperty("1","email",email);
    options.rdm.setRDMProperty("1","deviceType",Constants.deviceType);
    options.rdm.setRDMProperty("1","deviceId","2323232323232");
    console.log(options.rdm.toXML());
    apiHelper.get(options, req, res).then(
        function(rdm){
            //success
            console.log("==============================================REGISTER");
            console.log(rdm.toXML());
            res.send({errorCode:rdm.getRDMAttribute('errorCode'),registerId:rdm.getRDMProperty('1','registerId'),phoneNo:rdm.getRDMProperty('1','phoneNo'),'validation':rdm.getRDMProperty('1','validation'),email:rdm.getRDMProperty('1','email')});

        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}

function requestCaptcha(req,res,next){

}
function validateCaptch(req,res,next){
    // Put your secret key here.
    var captchaString = req.body.captcha||req.query.captcha;
    var ip = Utils.getIP(req);
    var secretKey = "6LckiRcUAAAAAMxgIe2b4W1IqsNJ4WQDZ89MdTGL";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + captchaString + "&remoteip=" + ip;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  request(verificationUrl,function(error,response,body) {

    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      return res.json({"errorCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
    res.json({"errorCode" : 0,"responseDesc" : "Sucess"});
  });
    
    

        
}
function sendArticleByEmail(req,res,next){
    if(!req.body) {
        next();
        return;
    }
    console.log(req.body);
    
    var name = req.body.name;
    var emails = req.body.emails;
    var fromEmail = req.body.from_email;
    var personalMessage = req.body.message;
    var articleHeading = req.body.heading;
    var description = req.body.description;
    var img = req.body.img;
    var url = req.body.url;


    var options = {
                    rdm : apiHelper.getURL(Constants.shareContent,req.parentPartner || req.partner)
    };
    for(var k in req.body){
        options.rdm.setRDMProperty("1",k,req.body[k]);
    }
    // var message = '<a href="'+url+'">';
    // // message+="<p> "+name+" has shared article with you </br> </p>";
    // if(personalMessage){
    //     message+="<h2>"+personalMessage+"</h2>"
    // }
    // message+="<h1>"+articleHeading+"</h1>";
    // message+='</br> <img src="'+img+'"/>';
    // message+="</br> "+description;
    // message+="</br></a> ";
    // message = message.replace(/'/g, '"');
    // options.rdm.setRDMProperty("1","subject",encodeURIComponent("<p> "+name+", email:"+fromEmail+" has shared article with you </br> </p>")); 
    // options.rdm.setRDMProperty("1","text",encodeURIComponent(message));
    // options.rdm.setRDMProperty("1","to",emails);
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
}

    
function renderSendEmailPage(req,res,next){
    req.query.url = decodeURIComponent(req.query.url);
    validateUrl(req,res,next);
}

var renderpath ='common/sendEmail';
function validateUrl(req,res,next){
    var checkIfClipPage = function(req,res,next){
        var p = req.query.url;
        if(p.indexOf("/clip-preview/")!=0){
            return false;
        } else {
            var i1 = p.lastIndexOf("/");
            var uid = p.substring(i1,p.length);
            var mediaIds = [uid];
            var partner = req.partner;
            var partnerData = req.environment.partnerData;
            var data = {};
            data.partner = req.partner;
            data.mediaIds = mediaIds ? mediaIds : [];
            data.title = "Clip Page";
            data.newsUrl = p;
            data.contentType = "image";
            res.render(renderpath, {
                "data" : data
            }, function(err, html) {
                
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
                
            });
            return true;
        }
        
    }
    var checkIfImagPage = function(req,res,next){
        var env =req.environment;
        var path = req.query.url;
        var isImagePage=false;
        var imgPref = env.partnerData.image_page_prefix || "";
        var imagePageQueryParam = env.partnerData.image_page_query_param || "";
        var prefHasVar = false;
        var prefHasVarIndex = imgPref.indexOf("##$$");
        var mediaId = "";
        var query = req.query;
        
        if(prefHasVarIndex>-1){  //prefix has variable position
            prefHasVar=true;
            imgPref = imgPref.substring(0,prefHasVarIndex);
        }
        
        if(imgPref && (path.indexOf(imgPref)==0 || path.indexOf("/"+imgPref)==0) ){
            console.log("url is image url:");
            isImagePage=true;
            if(imagePageQueryParam && query[imagePageQueryParam]){
                mediaId = query[imagePageQueryParam];
            } else if(prefHasVarIndex){

                mediaId = path.replace(imgPref,"");
            }
        }
        
        if(isImagePage && mediaId){
            var data = {};
            data.partner = req.partner;
            data.mediaIds = mediaId ? [mediaId] : [];
            data.title = "Image Page";
            data.newsUrl = path;
            data.contentType = "image";
            res.render(renderpath, {
                "data" : data
            }, function(err, html) {
                
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
                
            });
            return true;

        } 
        return false;
        
    }
    var renderDynamicPage = function(req, res, next) {
        var referer =  req.headers.referer;
        var isImagePage = checkIfImagPage(req,res,next);
        if(isImagePage){
            return;
        }
        var isClip = checkIfClipPage(req,res,next);
        if(isClip){
            return;
        }
        var path = req.query.url;
        var isPdfFullPage = false;
        if(path.indexOf("/full-page-pdf/")==0){
            var l = "/full-page-pdf/".length;
            isPdfFullPage=true;
            path = path.substring(l-1,path.length);
            console.log("path after change\n\n\n"+isPdfFullPage+"path:"+path);
        }
        
        var options = {
                rdm : apiHelper.getURL(Constants.validateURL,req.partner)
            };
        options.rdm.setRDMProperty("1","url",path);
        if(req.environment.partnerData.sendQueryParamsInValidate){
            var queryParams = [];
            var qp = "";
            for(var k in req.query){
                queryParams.push(k+"="+req.query[k]);
            }
            if(queryParams.length){
                qp = queryParams.join("&");
            }
            qp=encodeURIComponent(qp);
            options.rdm.setRDMProperty("1","query_params",qp);
        }
        apiHelper.get(options, req, res)
            .then(function(response) {
                
                var newsId = "";
                var pageType = "";
                var httpCode = "";
                var finalUrl = "";
                var resourceUrl = "";
                var pageCount=1;
                var baseUrl ="";
                var pageNo=1;
                var pageSufix = "";
                var originalUrl = "";
                var isContent = false;
                var contentType = "-1";
                var altText = "";
                var caption = "";
                for(var k in response.rdRows){
                    newsId = response.rdRows[k].id;
                    pageType = response.rdRows[k].pageType;
                    httpCode = response.rdRows[k].http_response;
                    finalUrl = response.rdRows[k].url;
                    resourceUrl = response.rdRows[k].resourceUrl;
                    pageCount = response.rdRows[k].page_count;
                    baseUrl = response.rdRows[k].base_url;;
                    pageNo = response.rdRows[k].page_no;
                    pageSufix = response.rdRows[k].sufix;
                    originalUrl = finalUrl;
                    altText = response.rdRows[k].alt_text;
                    caption = response.rdRows[k].caption;
                    contentType = response.rdRows[k].content_type;
                    break;
                }

                if(req.environment.urlQueryParams ){
                        finalUrl = finalUrl+"?"+req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
                }
                
                if(httpCode == '404' && req.xhr){
                    res.send(404,"loaderror=true");
                    res.end();
                    return;
                }
                if(httpCode == '404') {
                    res.status(404);
                    next();
                    return;
                } else if(httpCode == '301') {
                    res.redirect(301, finalUrl);
                    return;
                }
                
                
                
                
                // var asyncTemplates = PartnerContentTemplateModel.getAsyncPageTemplate(req,"news_details",PartnerPropsModel.data[req.partner]["theme"]);
                if(pageType=="buzz_details"){
                    handleBuzzDetailsPage(req,res,next,response,"news_details");
                    return;
                }
                if(pageType == 'news_details') {
                    var d = commonController.getData(req,response,newsId);
                    d.contentType = "news_details";
                    d['baseUrl'] = baseUrl ? baseUrl : originalUrl ? originalUrl: finalUrl;
                    d['pageNo'] = pageNo ? parseInt(pageNo) :1;
                    d['pageSufix'] = pageSufix ? pageSufix :"/page-";
                    d["queryparams"] = req.environment.urlQueryParams.substring(1,req.environment.urlQueryParams.length);
                    req.environment.breadcrumb.push({"name":d.title,"url":d.newsUrl});
                   
                    var env = req.environment;
                    res.render(renderpath, {
                        data : d
                    }, function(err, html) {
                        
                        if (err) {
                            logger.error('in index file', err.message);
                            return next(err);
                        }
                        
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end(html);
                        
                    });
                }else if(pageType == 'epaper') {
                    var d = {"pageType":pageType,"url":finalUrl,"resourceUrl":resourceUrl,"title":"E-Paper","description":"E-Paper description","keywords":req.environment.partnerData.partnerName+" epaper","mediaIds":[]};
                    d.contentType = "epaper";
                    if(isPdfFullPage){
                        res.render(renderpath, {
                            data : d
                            }, function(err, html) {
                                if (err) {
                                    logger.error('in index file', err.message);
                                    return next(err);
                                }
                                res.send(200, html);
                            });    
                    } else {
                        res.render(renderpath, {
                            data : d
                            }, function(err, html) {
                                if (err) {
                                    logger.error('in index file', err.message);
                                    return next(err);
                                }
                                res.send(200, html);
                            });    
                    }
                    
                } else if(pageType == 'blog_details') {
                    var d = commonController.getData(req,response,newsId);
                    d.contentType = "blog_details";
                    res.render(renderpath, {
                    data : d
                    }, function(err, html) {
                        if (err) {
                            logger.error('in index file', err.message);
                            return next(err);
                        }
                        res.send(200, html);
                    });
                } else if(pageType=="content_details"){
                    handleContentDetailsDisplay(req,res,next,response,newsId,contentType);
                } else {
                    console.log("Else case of news ***************************************************************")
                    res.status(404);
                    next();
                    return;
                }
                
        },
        function(e) {
            logger.error('error caching page', e.message);
            next(e);
        })
        .catch(function(e) {
            logger.error('error caching page callback:', e.message);
            next(e);
        });       
            
    }
    var handleBuzzDetailsPage = function(req,res,next,rdm,pageType){
        var d = staticDataController.parseBuzzData(req,res,rdm,"");
        d.contentType = "buzz_details";
        if(d.length>0){
            d = d[0];
        }
        var templatePath = renderpath;
        res.render(templatePath, {
            data : d
            }, function(err, html) {
                if (err) {
                    logger.error('in index file', err.message);
                    return next(err);
                }
                res.send(200, html);
        });
    }
    var handleContentDetailsDisplay = function(req,res,next,rdm,id,type){
        var env = req.environment;
        var d = commonContentController.getData(req,rdm,id);
        d.contentType = "content_details";
        var templatePath = renderpath;
        
        if(type){
            res.render(templatePath, {
                data : d
                }, function(err, html) {
                    if (err) {
                        logger.error('in index file', err.message);
                        return next(err);
                    }
                    res.send(200, html);
            });
        }        
    }
    renderDynamicPage(req,res,next);
}
function subscribeForNewsUpdatesNew(req,res,next){
    var data  = req.body || req.query;
    var options = {
                rdm : apiHelper.getURL(Constants.subscribeForEmailUpdates,req.partner)
            };
    options.rdm.setRDMProperty("1","email",data.email);
    options.rdm.setRDMProperty("1","sendSync","true");
    options.rdm.setRDMProperty("1","name","name");
    apiHelper.get(options, req, res).then(function(response) {
        res.send(200, {"errorCode":0});
    },
    function(e) {
        res.send(500, {"errorCode":-1});
    })
    .catch(function(e) {
        res.send(500, {"errorCode":-1});
    });      
}
function getUserStatus(req,res,next,type){
    if(!req.body.trackingId) {
        next();
        return;
    }
    var options = { rdm : apiHelper.getURL(Constants.getUserStatus,req.partner)};
    
    options.rdm.setRDMProperty("1","trackingId",req.body.trackingId); 
    options.rdm.setRDMProperty("1","type",(type || req.body.type || "SOCIAL"));
    options.rdm.setRDMProperty("1","sendSync","true");
    apiHelper.get(options, req, res).then(
        function(rdm){
            var data = [];
            for(var k in rdm.rdRows){
                var d = {};
                var id = rdm.rdRows[k].id;
                d['state'] = rdm.rdRows[k].state || rdm.rdRows[k].STATE;
                d['id'] = rdm.rdRows[k].id;
                d['type'] = rdm.rdRows[k].type;
                data.push(d);
            }
            res.send({"data":data,errorCode:rdm.getRDMAttribute('errorCode')});
        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
function submitAdLead(req,res,next) {
    
    if(!req.body.mobile) {
        next();
        return;
    }
    var options = { rdm : apiHelper.getURL(Constants.createContentUrl,"allytech")};
    options.host = "www.hocalwire.com";

    options.rdm.setRDMProperty("605","val_605",req.body.name); 
    options.rdm.setRDMProperty("606","val_606",req.body.mobile);
    options.rdm.setRDMProperty("607","val_607",(req.query.partner_value || req.body.partner_value || req.partner));
    options.rdm.setRDMProperty("608","val_608",req.body.unitname);

    var content_type="adleads";
    options.rdm.setRDMProperty("1","content_type_name",content_type);
    options.rdm.setRDMAttribute("content_type_name",content_type);
    apiHelper.get(options, req, res).then(
        function(rdm){
            res.send({"contentId":rdm.getRDMProperty("1","contentId"),"userId":rdm.getRDMProperty("1","userId"),errorCode:rdm.getRDMAttribute('errorCode')});
        },function(){
            //Fail
            res.send({errorCode:-1});
        }
    ).catch(function(e){
        logger.error('error in login:', e.message);
        next(e);
    });
}
module.exports.registerUser = registerUser;
module.exports.loginUser = loginUser;
module.exports.forgotPassword = forgotPassword;
module.exports.verifyEmail = verifyEmail;
module.exports.regenerateEmailCode = regenerateEmailCode;
module.exports.verifyOTP = verifyOTP;
module.exports.contactus = contactus;
module.exports.logout = logout;
module.exports.verifyLogin = verifyLogin;
module.exports.handleRequest = handleRequest;
module.exports.handlePaymentRequest = handlePaymentRequest;
module.exports.showFakePaymentPage = showFakePaymentPage;
module.exports.openPaymentStatus = openPaymentStatus;
module.exports.openPaymentDetails = openPaymentDetails;
module.exports.handleJoinUs = handleJoinUs;
module.exports.getLocationExtraInfo = getLocationExtraInfo;
module.exports.requestCaptcha = requestCaptcha;
module.exports.validateCaptch = validateCaptch;
module.exports.sendArticleByEmail = sendArticleByEmail;
module.exports.renderSendEmailPage = renderSendEmailPage;
module.exports.subscribeForNewsUpdatesNew = subscribeForNewsUpdatesNew;
