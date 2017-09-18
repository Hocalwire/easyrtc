'use strict';
  (function() {
    var initalized=false;
    var $el;
    var errorMessage;
    var $parent;
    window.initialiseScriptsBinding = function() {
        $el = $("#send-email-page");
        $parent = $el.find("#emailarticle");
        errorMessage = $parent.find("#status-message-div");
         if (initalized) {
             return;
         }
         bindForSubmit();
    }
    function bindForCaptchaService(){

    }
    function bindForSubmit(){
        $el.find(".js-submit-for-email").on("click",function () {

            
            var error = false;
            var mails=$parent.find("#to_email").val();
            var name = $parent.find("#name").val();
            var mail = $parent.find("#from_email").val();
            var message = $parent.find("#message").val();;
            
            var hasCaptcha = $("#captcha_wrapper")
            
            if (!mails || mails == "" || mails == " ") {
                errorMessage.html("Please enter email address to send mail to").slideDown();
                error = true; // change the error state to true
            } else {
                errorMessage.slideUp();
            }
            if (!name || name == "" || name == " ") {
                errorMessage.html("Please enter your name").slideDown();
                error = true; // change the error state to true
            } else {
                errorMessage.slideUp();
            }
            if (!mail || mail == "" || mail == " ") {
                errorMessage.html("Please enter your name").slideDown();
                error = true; // change the error state to true
            } else {
                errorMessage.slideUp();
            }
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                checkCaptchaAndSubmit($parent,hasCaptcha.length);
            }
            return false;
        });
    };
    function checkCaptchaAndSubmit($form,hasCaptcha){
        var type = $el.find("#story-content-type").attr("data-type");
        var url = $el.find("#story-url").attr("href");
        var $parent = $el.find("#emailarticle");
        
        var mails=$parent.find("#to_email").val();;
        var name = $parent.find("#name").val();
        var mail = $parent.find("#from_email").val();
        var message = $parent.find("#message").val();;
        var data = {
            "to_email":mails,
            "from_email":mail,
            "type":type,
            "url":url,
            "medium":"mail",
            "message":message,
            "from_name":name
        };

        if(hasCaptcha){
            var url = "/xhr/admin/validateCaptch";
            var options = {
                'contentType' : 'application/json'
            };
            var captcha = $("#g-recaptcha-response").val();
            if(!captcha){
                errorMessage.html("Please validate that you are human").slideDown();
                return;
            }
            var captchadata = {"captcha":captcha};
            Hocalwire.Services.post(url,captchadata,options).then(
                function(responseData){
                    
                    if(responseData.errorCode == 0) {
                       sendEmailToServer(data);
                    } else {
                        errorMessage.html("Captcha Check Failed. Please validate that you are human").slideDown();
                        return;
                    }
                    
                },

                function(e) {
                    $('#status-message-div').addClass("has-error");
                    errorMessage.html("Captcha Check Failed. Please validate that you are human").slideDown();
                    return;
                }
            );
        } else {
            sendEmailToServer(data);
        }
        
    }
     
    function sendEmailToServer(data){
            var url = "/xhr/admin/shareArticleByEmail"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/json'
            };
            $('#status-message-div').removeClass("has-error");
            Hocalwire.Services.post(url,data,options).then(
                function(data){
                    
                    if(data.errorCode == 0) {
                       
                            $('#status-message-div').html("Article Shared Successfuly");
                            $('#status-message-div').show();
                       
                    } else {
                        $('#status-message-div').addClass("has-error");
                        $('#status-message-div').html("Error Occured While Sharing Article");
                        $('#status-message-div').show();
                    }
                    
                },

                function(e) {
                    $('#status-message-div').addClass("has-error");
                    $('#status-message-div').html("Error Occured While Sharing Article. Something went wrong");
                    $('#status-message-div').show();
                }
            );
            
    }
        


})();
