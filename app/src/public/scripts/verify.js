'use strict';
(function() {
    var $el;
    $el = $("#verify-page");
    bindEvents();
    bindApplyForm();

    function bindEvents(){
        

    };
    function bindApplyForm(){
        $el.find(".js-btn-submit-verify").on("click",function () {
            var $parent = $el.find(".form-verify");
            var otp = $parent.find('input#otp').val(); // get the value of the input field
            
            var error = false;
            if (!otp || otp == "" || otp == " ") {
                $parent.find('#err-common').slideDown();
                error = true; // change the error state to true
            }
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                validateOTP($parent,false);
            }
            return false;
        });
    };
     
    function validateOTP($form,isInternship){
        var url = window.Constants.url.xhrVerify ? window.Constants.url.xhrVerify :  "/xhr/admin/verify"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Hocalwire.Services.post(url,$el.serialize(),options).then(
                function(data){
                    if(data.errorCode == 0) {
                        window.location = '/';
                    } else {
                        var message = "Unable to verify your OTP";
                        if(data.errorCode == -14) {
                            message = "OTP you have entered is not correct."
                        } 
                        $form.find('#err-common').html(message);
                        $form.find('#err-common').slideDown();
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
                    var params = {};
                    params.title = "Whoops!! there is some error";
                    params.message = "Some error occured while posting your entry. Please retry again";
                    params.actionOneLabel = "Close";
                    Hocalwire.Services.AnalyticsService.sendGAEvent("careers","error","applyJob");
                    Utils.dialog(params);
                }
            );
            
    }
      
})();