'use strict';
(function() {
    var $el;
    $el = $("#subscription-details-page");
    bindEvents();
    bindApplyForm();

    function bindEvents(){


    };
    function bindApplyForm(){
        $el.find(".js-btn-submit-subscription").on("click",function () {
            var $parent = $el.find(".subscription-form");
            // var mobile = $parent.find('input#mobile_no').val(); // get the value of the input field
            // var password = $parent.find('input#password').val(); 
            // $parent.find('.error').slideUp();
            var error = false;
            // if (!mobile || mobile == "" || mobile == " ") {
            //     $parent.find('#err-name').slideDown();
            //     error = true; // change the error state to true
            // }
            // if (!password || password == "" || password == " ") {
            //     $parent.find('#err-password').slideDown();
            //     error = true; // change the error state to true
            // }
            
            if (error == false) {
                submitSubscriptionForm($parent);
            }
            return false;
        });
    };
     
    function openSubscribeDetails($form,isInternship){
        var url = "/xhr/admin/subscribeDetails"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Hocalwire.Services.post(url,$form.serialize(),options).then(
                function(data){
                    if(data.errorCode == 0) {
                        var redirectURL = data.redirectURL;
                        if(!redirectURL) {
                            redirectURL = "/";
                        }
                        window.location = redirectURL;
                        
                    } else {
                        console.log("Inside login error");
                        //Utils.dialog(params);
                        if(data.errorCode == -8) {
                            $form.find('#err-common').html("Mobile Number or Pasword does not match.");
                            $form.find('#err-common').slideDown();
                        } else {
                            $form.find('#err-common').html("Unable to login. Please try again later.");
                            $form.find('#err-common').slideDown();
                        }
                    }
                },

                function(e) {
                    $form.find('#err-common').html("Unable to login. Please try again later.");
                    $form.find('#err-common').slideDown();
                }
            );
            
    }
        
    function submitSubscriptionForm($form){
        var url = "/xhr/admin/submitSubscription"; // the script where you handle the form input.
        var options = {
            'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
        };
        Hocalwire.Services.post(url,$form.serialize(),options).then(
            function(data){
                console.log("======================>> Insider submitSubscriptionForm");
                console.log(data);
                // if(data.errorCode == 0) {
                //     var redirectURL = data.redirectURL;
                //     if(!redirectURL) {
                //         redirectURL = "/";
                //     }
                //     window.location = redirectURL;
                    
                // } else {
                //     console.log("Inside login error");
                //     //Utils.dialog(params);
                //     if(data.errorCode == -8) {
                //         $form.find('#err-common').html("Mobile Number or Pasword does not match.");
                //         $form.find('#err-common').slideDown();
                //     } else {
                //         $form.find('#err-common').html("Unable to login. Please try again later.");
                //         $form.find('#err-common').slideDown();
                //     }
                // }
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