'use strict';
(function() {
    var $el;
    $.addPageInit("#careers-page", function() {
            $el = $("#careers-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            bindEvents();
            bindApplyForm();

        }
    );

    function bindEvents(){
        $(".js-sing-up-btn").addClass("hide");
        $el.find(".js-intern-tab").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("careers","click","intern-tab");
            if(!$el.find(".js-intern-tab").hasClass("active")){
                $el.find(".js-intern-tab").addClass("active");
            }
            $el.find(".js-apply-internship").removeClass("hide");
            $el.find(".js-apply-job").addClass("hide");
            $el.find(".js-job-tab").removeClass("active");
        });
        $el.find(".js-job-tab").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("careers","click","job-tab");
            if(!$el.find(".js-job-tab").hasClass("active")){
                $el.find(".js-job-tab").addClass("active");
            }
            $el.find(".js-apply-job").removeClass("hide");
            $el.find(".js-apply-internship").addClass("hide");
            $el.find(".js-intern-tab").removeClass("active");
        });

    };
    function bindApplyForm(){
        $el.find("#apply-job").on("click",function () {
            var $parent = $el.find(".js-apply-job");
            var name = $parent.find('input#name').val(); // get the value of the input field
            var error = false;
            if (name == "" || name == " ") {
                $parent.find('#err-name').show(500);
                $parent.find('#err-name').delay(4000);
                $parent.find('#err-name').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }
            var phone = $parent.find('input#phone').val();
            if (phone == "" || phone == " ") {
                $parent.find('#err-phone').show(500);
                $parent.find('#err-phone').delay(4000);
                $parent.find('#err-phone').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }
            var emailCompare = /^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$/; // Syntax to compare against input
            var email = $parent.find('input#email').val().toLowerCase(); // get the value of the input field
            if (email == "" || email == " " || !emailCompare.test(email)) {
                $parent.find('#err-email').show(500);
                $parent.find('#err-email').delay(4000);
                $parent.find('#err-email').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }


            
            if (error == false) {
                Hocalwire.Services.AnalyticsService.sendGAEvent("careers","submit","applyIntern");
                applyNow($parent.find("form"),false);
                
            }
        });
        $el.find("#apply-intern").on("click",function () {
            var $parent = $(".js-apply-internship");
            var name = $parent.find('input#name').val(); // get the value of the input field
            var error = false;
            if (name == "" || name == " ") {
                $parent.find('#err-name').show(500);
                $parent.find('#err-name').delay(4000);
                $parent.find('#err-name').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }
            var phone = $parent.find('input#phone').val();
            if (phone == "" || phone == " ") {
                $parent.find('#err-phone').show(500);
                $parent.find('#err-phone').delay(4000);
                $parent.find('#err-phone').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }
            var college = $parent.find('input#college').val(); // get the value of the input field
            if (college == "" || college == " ") {
                $parent.find('#err-college').show(500);
                $parent.find('#err-college').delay(4000);
                $parent.find('#err-college').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }

            var emailCompare = /^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$/; // Syntax to compare against input
            var email = $parent.find('input#email').val().toLowerCase(); // get the value of the input field
            if (email == "" || email == " " || !emailCompare.test(email)) {
                $parent.find('#err-email').show(500);
                $parent.find('#err-email').delay(4000);
                $parent.find('#err-email').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }


            
            if (error == false) {
                Hocalwire.Services.AnalyticsService.sendGAEvent("careers","submit","applyIntern");
                applyNow($parent.find("form"),true);
                
            }

            return false; // stops user browser being directed to the php file
        });

    };
     
    function applyNow($el,isInternship){
        var url = "/content/servlet/RDESController?command=career.ServletCareer"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Hocalwire.Services.post(url,$el.serialize(),options).then(
                function(data){
                    var params = {};
                    params.title = "Thanks for applying."
                    if(isInternship){
                        params.message = "Please download the app to start reporting news. You internship application will be selected based on your reporting";
                        params.actionOneLabel = "Download Now";
                        params.actionOneCallback = function(){
                            window.location.href="/refer-170";
                        }
                        Hocalwire.Services.AnalyticsService.sendGAEvent("careers","success","applyIntern");
                    } else {
                        params.message = "We will contact you back. Please try our app";
                        params.actionOneLabel = "Try App";
                        params.actionOneCallback = function(){
                            window.location.href="/refer-170";
                        }
                        params.actionTwoLabel = "Cancel";
                        params.actionTwoCallback = function(){
                            window.location.href="/";
                        }
                        Hocalwire.Services.AnalyticsService.sendGAEvent("careers","success","applyJob");
                    }
                    Utils.dialog(params);
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