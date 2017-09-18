'use strict';
(function() {
    var $el;
    $el = $("#register-page");
    bindEvents();
    bindApplyForm();
    var mode = $("#content").data("registration-mode");
    bindForEmailAndOTPVerification();
    var sendingRegisterRequest=false;
    function bindEvents(){

    };
    function bindApplyForm(){
        
        $el.find(".js-btn-submit-register").on("click",function () {
            if(sendingRegisterRequest){
                return;
            }
            sendingRegisterRequest=true;
            var $parent = $el.find(".register-form");
            var error = false;
            var terms = $el.find(".js-verify-term-conditions");
            var isChecked = terms.is(":checked");
            var mobile = $parent.find('input#mobile_no').val(); // get the value of the input field
            var password = $parent.find('input#password').val(); 
            var firstName = $parent.find('input#firstName').val(); 
            var lastName = $parent.find('input#lastName').val(); 
            var email = $parent.find('input#email').val(); 
            var confirmPassword = $parent.find('input#confirm_pass').val(); 

            
            if (!firstName || firstName == "" || firstName == " ") {
                $parent.find('#err-firstName').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-firstName').slideUp();
            }

            // if (!lastName || lastName == "" || lastName == " ") {
            //     $parent.find('#err-lastName').slideDown();
            //     error = true; // change the error state to true
            // }

            if (mode!="otp" && (!email || email == "" || email == " ")) {
                $parent.find('#err-email').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-email').slideUp();
            }

            if (mode=="otp" && (!mobile || mobile == "" || mobile == " ")) {
                $parent.find('#err-mobile').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-mobile').slideUp();
            }

            if (!password || password == "" || password == " ") {
                $parent.find('#err-password').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-password').slideUp();
            }

            if (!confirmPassword || confirmPassword == "" || confirmPassword == " ") {
                $parent.find('#err-confirm-password').slideDown();
                error = true; // change the error state to true
            } else {
                $parent.find('#err-confirm-password').slideUp();
            }
            if(!error && (password!=confirmPassword)) {
                $parent.find('#err-confirm-password-no-match').slideDown();
                error = true; // change the error state to true
                setTimeout(function(){
                    $parent.find('#err-confirm-password-no-match').slideUp();
                },4000);
            }
            if(!isChecked){
                $el.find('#err-check-terms-condition').slideDown();
                error = true; // change the error state to true
                setTimeout(function(){
                    $el.find('#err-check-terms-condition').slideUp();
                },4000);
                sendingRegisterRequest=false;
               return false;
            }
            
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                sendRegisterRequest($parent,false);
            } else {
                sendingRegisterRequest=false;
            }
            return false;
        });
    };
     
    function sendRegisterRequest($el,isInternship){
        var url = window.Constants.url.xhrVerify ? window.Constants.url.xhrRegister :  "/xhr/admin/register"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            $('#register-page-response-message-error').removeClass("has-error");
            Utils.showLoader(5000);
            Hocalwire.Services.post(url,$el.serialize(),options).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        var validation = data.validation;
                        sendingRegisterRequest=false;
                        if(mode=="otp"){
                                $('#register-page').hide();
                                $(".verify-otp-wrapper").parent().removeClass("hide");
                                $(".verify-otp-wrapper").removeClass("hide");
                                setTimeout(function(){$('html,body').animate({
                                    scrollTop: $(window).scrollTop() - 250
                                });},100);
                        } else {
                            if(validation == 'email') {
                                $('#register-page').hide();
                                $('#register-page-response-message').html("An email has been sent to you at given email address. <br>Please verify your email address by clicking on the provided link.");
                                $('#register-page-response-message').show();
                                setTimeout(function(){$('html,body').animate({
                                    scrollTop: $(window).scrollTop() - 250
                                });},100);
                            } else {
                                $('#register-page').hide();
                                $('#register-page-response-message').html("Registration Successfull.");
                                $('#register-page-response-message').show();
                                setTimeout(function(){$('html,body').animate({
                                    scrollTop: $(window).scrollTop() - 250
                                });},100);
                                
                            }    
                        }
                        
                        
                    } else {
                        console.log("Inside login error");
                        //Utils.dialog(params);
                        $('#register-page').hide();
                            if(data.errorCode == "-4"){
                                if(mode=="otp") {
                                    $('#register-page-response-message').html("Mobile Number is already registered. Please use differnent mobile or try to login.");    
                                } else {
                                    $('#register-page-response-message').html("Email Address is already registered. Please use differnent email address or try to login.");    
                                }
                                
                            } else if(data.errorCode == "-10"){
                                $('#register-page-response-message').html("Email id or Phone number already registered.");
                            } else {
                                $('#register-page-response-message').html("Error occured during registration. Please try again.");
                            }
                        
                        $('#register-page-response-message').addClass("has-error").show();
                    }
                    var params = {};
                },

                function(e) {
                    Utils.hideLoader();
                    $('#register-page-response-message').html("Error occured during registration. Please try again.");
                           
                    $('#register-page-response-message').addClass("has-error").show();
                }
            );
            
    }
        

    function bindForEmailAndOTPVerification(){
        var $el1 = $("#content");
        var $btn = $el1.find(".js-btn-submit-regenerate-email-code");
        $btn.on("click",function(){
          var email = $el1.find("#email-address");
          var regen = $el1.find(".regenrate-message");
          if(!email.val()) {
            regen.html("Please Enter Email Id").removeClass("hide");
            return;
          }
          var data = {"email" : email.val()};
          var url = window.Constants.url.xhrRegenerateEmailCode ? window.Constants.url.xhrRegenerateEmailCode :  "/xhr/admin/login/regenerateEmailCode"; // the script where you handle the form input.
          Utils.showLoader(5000);
          Hocalwire.Services.post(url,data).then(function() {
            Utils.hideLoader();
            if(mode=="otp"){
                $(".verify-otp-wrapper").removeClass("hide");
                // $(".wrapper-to-generate-otp").addClass("hide");
                setTimeout(function(){$('html,body').animate({
                    scrollTop: $(window).scrollTop() - 250
                });},100);
            } else {
                regen.html("Email has been sent to you for verification. Please check your inbox").removeClass("hide");
                $(".box-wrapper-verify").addClass("hide");
                setTimeout(function(){$('html,body').animate({
                    scrollTop: $(window).scrollTop() - 250
                });},100);
            }
            
              },
              function() { 
                Utils.hideLoader();
                  regen.html("Verification code generation failed. Please try again later").removeClass("hide");
              }
          );
        });
        

        var $btn1 = $el1.find(".js-btn-submit-otp-code");
        $btn1.on("click",function(){
          var otp = $el1.find("#otp-address");
          var phoneNo = $el1.find("#email-address");
          if(!phoneNo || !phoneNo.length){
            phoneNo = $el1.find("#email");
          }
          if(!otp || !otp.length){

          }
          var data = {"phoneNo" : phoneNo.val(),"otp" : otp.val()};
          var regen = $el1.find(".regenrate-message");
          var url = window.Constants.url.verify ? window.Constants.url.verify :  "/xhr/admin/login/verifyUser"; // the script where you handle the form input.
          var externalTarget = $el1.find("#external_target_for_otp_verify");
          Utils.showLoader(5000);
          Hocalwire.Services.post(url,data).then(function() {
            Utils.hideLoader();
                if(externalTarget && externalTarget.length){
                    externalTarget.removeClass("hide");                
                    externalTarget.find("form input#code").val(otp.val());
                    externalTarget.find("form input#email").val(phoneNo.val());
                } else {
                    regen.html("Your OTP is verified. Redirecting to login page").removeClass("hide");
                    setTimeout(function(){
                      window.location="/login";
                    },3000);

                }
                              },
              function() { 
                  //- alert("f");
                  Utils.hideLoader();
                  regen.html("OTP verification failed. Please provide correct OTP").removeClass("hide");
              }
          );
        });
            
    }
    

})();