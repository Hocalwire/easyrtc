'use strict';
(function() {
    var $el = $("#contact-us-page");
    bindApplyForm();
   
    function bindApplyForm(){
        $el.find(".js-btn-submit-contact").on("click",function () {
            var $parent = $el.find(".contact-us-form");
            var name = $parent.find('#name').val(); // get the value of the input field
            var hasPhone = $parent.find('#phone').length;
            var email = $parent.find('#email').val(); 
            var subject = $parent.find('#subject').val(); 
            var message = $parent.find('#message').val(); 
            $parent.find('.error').slideUp();
            var error = false;
            if (!name || name == "" || name == " ") {
                $parent.find('#err-name').slideDown();
                error = true; // change the error state to true
            }
            if (!email || email == "" || email == " ") {
                $parent.find('#err-email').slideDown();
                error = true; // change the error state to true
            }
            if (hasPhone) {
                var phone = $parent.find('#phone').val(); 
                if(!phone || phone == "" || phone == " ") {
                    $parent.find('#err-phone').slideDown();
                    error = true; // change the error state to true    
                }
                
            }
            // if (!subject || subject == "" || subject == " ") {
            //     $parent.find('#err-subject').slideDown();
            //     error = true; // change the error state to true
            // }
            if (!message || message == "" || message == " ") {
                $parent.find('#err-message').slideDown();
                error = true; // change the error state to true
            }
            if (error == false) {
                //Hocalwire.Services.AnalyticsService.sendGAEvent("login","submit","loginUser");
                sendContactUsRequest($parent,false);
            }
            return false;
        });
    };
     
    function sendContactUsRequest($form,isInternship){
        var url = "/xhr/admin/contactus"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Hocalwire.Services.post(url,$form.serialize(),options).then(
                function(data){
                    if(data.errorCode == 0) {
                        $form.find('#success-common').html("Message Sent Sucessfully");
                        $form.find('#success-common').slideDown();
                    } else {
                        
                            $form.find('#err-common').html("Unable to send message now. Please try again later.");
                            $form.find('#err-common').slideDown();
                    }
                },

                function(e) {
                    $form.find('#err-common').html("Some error occured while posting your entry. Please retry again.");
                    $form.find('#err-common').slideDown();
                    
                    // Utils.dialog(params);
                }
            );
            
    }
        


    

})();