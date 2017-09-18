'use strict';
(function() {
    $.addPageInit("#aboutus-page", function() {
            var $el = $("#aboutus-page");
            
            Hocalwire.PageLoader.init();
            Hocalwire.CommonJs.init();
            // initSliders();
            bindInView();
            bindContactUs();
            bindGATrackingElements();
            $.addPageLoad(initSliders,true);
        }
    );

    function bindInView(){
        $("#send-mail").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("contactus","submit","mail");
            sendMail();
        });
       
        $('.thumbnail').one('inview', function (event, visible) {
            if (visible == true) {
                $(this).addClass("animated fadeInDown");
            } else {
                $(this).removeClass("animated fadeInDown");
            }
        });

        //Animate triangles
        $('.triangle').bind('inview', function (event, visible) {
            if (visible == true) {
                $(this).addClass("animated fadeInDown");
            } else {
                $(this).removeClass("animated fadeInDown");
            }
        });
        
        //animate first team member
        $('#first-person').bind('inview', function (event, visible) {
            if (visible == true) {
                $('#first-person').addClass("animated pulse");
            } else {
                $('#first-person').removeClass("animated pulse");
            }
        });
        
        //animate sectond team member
        $('#second-person').bind('inview', function (event, visible) {
            if (visible == true) {
                $('#second-person').addClass("animated pulse");
            } else {
                $('#second-person').removeClass("animated pulse");
            }
        });

        //animate thrid team member
        $('#third-person').bind('inview', function (event, visible) {
            if (visible == true) {
                $('#third-person').addClass("animated pulse");
            } else {
                $('#third-person').removeClass("animated pulse");
            }
        });
        
        
        
        $('.contact-form').bind('inview', function (event, visible) {
            if (visible == true) {
                $('.contact-form').addClass("animated bounceIn");
            } else {
                $('.contact-form').removeClass("animated bounceIn");
            }
        });
        $('.skills > li > span').one('inview', function (event, visible) {
            if (visible == true) {
                $(this).each(function () {
                    $(this).animate({
                        width: $(this).attr('data-width')
                    }, 3000);
                });
            }
        });
    };
       
    function initSliders(){
           //Initialize header slider.
        var images = $(".section img");
        Utils.registerLoadOnVisible(images,function(elem){
            Utils.lazyLoadImage(elem);
        },true);
        // $('#da-slider').cslider();

        //Initial mixitup, used for animated filtering portfolio.
        $('#portfolio-grid').mixitup({
            'onMixStart': function (config) {
                $('div.toggleDiv').hide();
            }
        });

        //Initial Out clients slider in client section
        $('#clint-slider').bxSlider({
            pager: true,
            minSlides: 1,
            maxSlides: 3,
            moveSlides: 5,
            slideWidth: 250,
            slideMargin: 25,
            prevSelector: $('#client-prev'),
            nextSelector: $('#client-next'),
            prevText: '<i class="icon-left-open"></i>',
            nextText: '<i class="icon-right-open"></i>'
        });

        $('#news-stories-tiles').bxSlider({
            pager: true,
            minSlides: 1,
            maxSlides: 3,
            moveSlides: 5,
            slideWidth: 250,
            slideMargin: 25,
            prevSelector: $('#client-prev'),
            nextSelector: $('#client-next'),
            prevText: '<i class="icon-left-open"></i>',
            nextText: '<i class="icon-right-open"></i>'
        });
        $('input, textarea').placeholder();
        $('div.toggleDiv').hide();
        $('.show_hide').showHide({
            speed: 500,
            changeText: 0,
            showText: 'View',
            hideText: 'Close'
        });

    };
    function bindContactUs(){
        $("#send-mail").click(function () {

            var name = $('input#name').val(); // get the value of the input field
            var error = false;
            if (name == "" || name == " ") {
                $('#err-name').show(500);
                $('#err-name').delay(4000);
                $('#err-name').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }

            var emailCompare = /^([a-z0-9_.-]+)@([da-z.-]+).([a-z.]{2,6})$/; // Syntax to compare against input
            var email = $('input#email').val().toLowerCase(); // get the value of the input field
            if (email == "" || email == " " || !emailCompare.test(email)) {
                $('#err-email').show(500);
                $('#err-email').delay(4000);
                $('#err-email').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }


            var comment = $('textarea#comment').val(); // get the value of the input field
            if (comment == "" || comment == " ") {
                $('#err-comment').show(500);
                $('#err-comment').delay(4000);
                $('#err-comment').animate({
                    height: 'toggle'
                }, 500, function () {
                    // Animation complete.
                });
                error = true; // change the error state to true
            }

            if (error == false) {
                var dataString = $('#contact-form').serialize(); // Collect data from form
                $.ajax({
                    type: "POST",
                    url: $('#contact-form').attr('action'),
                    data: dataString,
                    timeout: 6000,
                    error: function (request, error) {

                    },
                    success: function (response) {
                        response = $.parseJSON(response);
                        if (response.success) {
                            $('#successSend').show();
                            $("#name").val('');
                            $("#email").val('');
                            $("#comment").val('');
                        } else {
                            $('#errorSend').show();
                        }
                    }
                });
                return false;
            }

            return false; // stops user browser being directed to the php file
        });

    };
     
     
        


    function sendEmail() {
        if(validateFormData()) {
            Hocalwire.Services.AnalyticsService.sendGAEvent("contactus","submit","mail-sent");
            var url = "/content/send_email.jsp"; // the script where you handle the form input.
            $.ajax({
                type: "POST",
                url: url,
                data: $("#contact-form").serialize(), // serializes the form's elements.
                success: function(data)
                {
            data = data.trim();
            if(data) {
                data = data.trim();
                if(data.indexOf("PASS") >-1) {
                    alert("Thanks for contacting. We will come back to you.");
                } else {
                    alert("Whoops!! there is some error. Please try again later");
                }
            }
                }
            });
            
     
        }
        return false;
    }
    function validateFormData() {

        if( $('#name').val().trim() == '') {
            alert("Please enter your Name.");
            return false;
        }
        
        if( $('#email').val().trim() == '') {
            alert("Please enter your Email Address.");
            return false;
        } else {
            var email = $('#email').val().trim();
            if(email.indexOf("@") >0 && email.indexOf("@")+1 < email.length && email.indexOf(".") >=0 ) {
                //alert("valid");
            } else {
                alert("Email address you have entered is not correct.");
                return false;
            }
        }
        
        
        
        if( $('#message').val().trim() == '') {
            alert("Please write your message.");
            return false;
        }
        return true;
    }
    function bindGATrackingElements() {
        $("#send-mail").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("contactus","submit","send-message");
            sendMail();
        });

        

       

        /****** Our Picks ******/
        $(".js-picks-all").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("our-picks","click","all");
        });
        $(".js-picks-popular").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("our-picks","click","popular");
        });
        $(".js-picks-complaints").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("our-picks","click","complaints");
        });
        $(".js-picks-others").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("our-picks","click","others");
        });

        /******* Navigation ******/
        $(".js-nav-home").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","home");
        });
        $(".js-nav-whyus").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","whyus");
        });
        $(".js-nav-our-picks").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","our-picks");
        });
        $(".js-nav-reviews").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","reviews");
        });
        $(".js-nav-team").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-nav","click","team");
        });
        

        /************* About us social links ****************/
        $(".js-ceo-facebook").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","ceo-facebook");
        });
        $(".js-ceo-twitter").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","ceo-twitter");
        });
        $(".js-ceo-linkedin").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","ceo-linkedin");
        });

        $(".js-cto-facebook").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cto-facebook");
        });
        $(".js-cto-twitter").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cto-twitter");
        });
        $(".js-cto-linkedin").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cto-linkedin");
        });

        $(".js-cmo-facebook").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cmo-facebook");
        });
        $(".js-cmo-twitter").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cmo-twitter");
        });
        $(".js-cmo-linkedin").on("click",function(){
            Hocalwire.Services.AnalyticsService.sendGAEvent("home-aboutus","click","cmo-linkedin");
        });
    }

})();