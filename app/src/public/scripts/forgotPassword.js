'use strict';
(function() {
    var $el;
    $el = $("#forgot-password-page");
    var mode = $("#content").data("registration-mode");
    bindEvents();
    bindApplyForm();
    var a = $("#status-page-wrapper");
    if(a && a.length){
        var products = [];
        if(a.data("clear-cart")){
            var partner = a.data("partner");
            var o = {};
            o[partner] = products;
            localStorage.products = localStorage.products ? localStorage.products : {};
            localStorage.products = JSON.stringify(o);
        }
    }
    function bindEvents(){
        

    };
    function bindApplyForm(){
        $el.find(".js-btn-submit-forgotPassword").off("click");
        $el.find(".js-btn-submit-forgotPassword").on("click",function () {
            var $parent = $el.find(".form-forgotPassword");
            var mobile = $parent.find('input#email').val(); // get the value of the input field
            
            var error = false;
            if (!mobile || mobile == "" || mobile == " ") {
                $parent.find('#err-email').slideDown();
                error = true; // change the error state to true
            }
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                sendLoginRequest($parent,false);
            }
            return false;
        });
        $el.find(".js-btn-submit-reset-password").off("click");
        $el.find(".js-btn-submit-reset-password").on("click",function () {
            var $parent = $el.find(".form-resetPassword");
            var password = $parent.find('input#password').val(); // get the value of the input field
            var retype = $parent.find('input#retype-password').val(); // get the value of the input field
            
            var error = false;
            if (!password || password == "" || password == " ") {
                $parent.find('#err-password').slideDown();
                error = true; // change the error state to true
            }
            if (!retype || retype == "" || retype == " ") {
                $parent.find('#err-password-retype').slideDown();
                error = true; // change the error state to true
            }
            if (!retype || password == "" || retype != password) {
                $parent.find('#err-password-not-match').slideDown();
                error = true; // change the error state to true
            }
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                sendResetRequest($parent,false);
            }
            return false;
        });
    };
     
    function sendLoginRequest($el,isInternship){
        var url = window.Constants.url.xhrForgotPassword ? window.Constants.url.xhrForgotPassword :  "/xhr/admin/login/forgotPassword"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Utils.showLoader(5000);
            Hocalwire.Services.post(url,$el.serialize(),options).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        if(mode=="otp"){
                            $(".verify-otp-wrapper").removeClass("hide");
                            $(".verify-otp-wrapper").parent().removeClass("hide");
                        } else {
                            $(".success-msg").removeClass("hide");
                            setTimeout(function(){
                                window.location = '/';
                            },3000);    
                        }
                        
                    } else {
                        $(".error-msg").removeClass("hide");
                        console.log("Inside login error");
                        //Utils.dialog(params);
                    }
                    var params = {};
                    // params.title = "Thanks for applying."
                    // if(isInternship){
                    //     params.message = "Please download the app to start reporting news. You internship application will be selected based on your reporting";
                    //     params.actionOneLabel = "Download Now";
                    //     params.actionOneCallback = function(){
                    //         window.location.href="/refer-170";
                    //     }
                    //     Hocalwire.Services.AnalyticsService.sendGAEvent("careers","success","applyIntern");
                    // } else {
                    //     params.message = "We will contact you back. Please try our app";
                    //     params.actionOneLabel = "Try App";
                    //     params.actionOneCallback = function(){
                    //         window.location.href="/refer-170";
                    //     }
                    //     params.actionTwoLabel = "Cancel";
                    //     params.actionTwoCallback = function(){
                    //         window.location.href="/";
                    //     }
                    //     Hocalwire.Services.AnalyticsService.sendGAEvent("careers","success","applyJob");
                    // }
                    //Utils.dialog(params);
                },

                function(e) {
                    $(".error-msg").removeClass("hide");
                }
            );
            
    }
    function sendResetRequest($el){
        var url = window.Constants.url.xhrResetPassword ? window.Constants.url.xhrResetPassword :  "/xhr/admin/login/reset-password"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Utils.showLoader(5000);
            Hocalwire.Services.post(url,$el.serialize(),options).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        $(".success-msg").removeClass("hide");
                        setTimeout(function(){
                            window.location = '/login';
                        },5000);
                    } else {
                        $(".error-msg").removeClass("hide");
                        console.log("Inside login error");
                        //Utils.dialog(params);
                    }
                    var params = {};
                    
                },

                function(e) {
                    $(".error-msg").removeClass("hide");
                }
            );
            
    }
      
})();