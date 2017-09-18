'use strict';
(function() {
    var $el;
    $el = $("#login-page");
    bindEvents();
    bindApplyForm();
    var mode = $("#content").data("registration-mode");
    function bindEvents(){


    };
    function bindApplyForm(){
        $el.find(".js-btn-submit-login").on("click",function () {
            var $parent = $el.find(".login-form");
            var mobile = $parent.find('input#mobile_no').val();
            var email = $parent.find('input#email').val(); // get the value of the input field
            var password = $parent.find('input#password').val(); 
            $parent.find('.error').slideUp();
            var error = false;
            if (!mobile && !email) {
                if(!mobile){
                    $parent.find('#err-mobile').slideDown();
                } else {
                    $parent.find('#err-email').slideDown();
                }
                
                error = true; // change the error state to true
            } else {
                $parent.find('#err-name').slideUp();
            }
            if (!password || password == "" || password == " ") {
                $parent.find('#err-password').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-password').slideUp();
            }
            
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                sendLoginRequest($parent,false);
            }
            return false;
        });

    };
     
    function sendLoginRequest($form,isInternship){
        var url = window.Constants.url.xhrVerify ? window.Constants.url.xhrLogin :  "/xhr/admin/login"; // the script where you handle the form input. // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Utils.showLoader(5000);
            Hocalwire.Services.post(url,$form.serialize(),options).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        var redirectURL = data.redirectURL;
                        if(!redirectURL){
                            var queryString=location.search;
                            var params=queryString.substring(1).split('&');
                            for(var i=0; i<params.length; i++){
                                var pair=params[i].split('=');
                                if(pair[0] && (pair[0]=="redirecturl") || (pair[0]=="redirectUrl")){
                                    redirectURL = decodeURIComponent(pair[1]);
                                }
                            }
                        }
                        if(!redirectURL) {
                            redirectURL = "/";
                        }
                        window.location = redirectURL;
                        
                    } else {
                        console.log("Inside login error");
                        //Utils.dialog(params);
                        if(data.errorCode == -8) {
                            if(mode=="otp"){
                                $form.find('#err-common').html("Phone Number or Pasword does not match.");
                            } else {
                                $form.find('#err-common').html("Email or Pasword does not match.");
                            }
                            
                            $form.find('#err-common').slideDown();
                        }
                        else if(data.errorCode == -18){
                            if(mode=="otp"){
                                var phoneNo = $('.login-form input#mobile_no').val();
                                $form.find('#err-common').html("You have not authorized, verified your phone. Kindly verify it using otp and try again.").append("</br><a class='generate_otp_btn' href='/verify-email?regenerate-phone=true&mobile="+phoneNo+"'><i>Generate new OTP</i></a></br>");
                            } else {
                                $form.find('#err-common').html("You have not authorized your email. Kindly authorize it and try again.").append("</br><a class='generate_otp_btn' href='/verify-email?regenerate-email=true' target='_blank'><i>Generate Verification link</i></a></br>");
                            }
                            
                            $form.find('#err-common').slideDown();
                        } else {
                            $form.find('#err-common').html("Unable to login. Please try again later.");
                            $form.find('#err-common').slideDown();
                        }
                    }
                },

                function(e) {
                    Utils.hideLoader();
                    $form.find('#err-common').html("Unable to login. Please try again later.");
                    $form.find('#err-common').slideDown();
                }
            );
            
    }
        


    

})();