(function() {
    var initalized=false;
    var planId;
    var partner;
    var userId;
    window.initialiseScriptsBinding1 = function(){
        if(initalized){
            return;
        }
        initalized=true;
        partner = $("#content").attr("data-partner");
        userId = $("#content").attr("data-userid");
        if(!userId || userId=="undefined"){
            userId="0";
        }
        localStorage.products = localStorage.products ? localStorage.products : {};
        
        setupCart();
        setupCheckoutPage();
        profilePageBinding();
        
        
    }
    window.initScriptArray = window.initScriptArray || [];
    window.initScriptArray.push(window.initialiseScriptsBinding1);
    function profilePageBinding(){
        
        $('.form').find('input, textarea').on('keyup blur focus', function (e) {
  
          var $this = $(this),
              label = $this.prev('label');

              if (e.type === 'keyup') {
                    if ($this.val() === '') {
                  label.removeClass('active highlight');
                } else {
                  label.addClass('active highlight');
                }
            } else if (e.type === 'blur') {
                if( $this.val() === '' ) {
                    label.removeClass('active highlight'); 
                    } else {
                    label.removeClass('highlight');   
                    }   
            } else if (e.type === 'focus') {
              
              if( $this.val() === '' ) {
                    label.removeClass('highlight'); 
                    } 
              else if( $this.val() !== '' ) {
                    label.addClass('highlight');
                    }
            }

        });

        $('.tab a').on('click', function (e) {
          
          e.preventDefault();
          
          $(this).parent().addClass('active');
          $(this).parent().siblings().removeClass('active');
          target = $(this).attr('href');

          $('.tab-content > div').not(target).hide();
          
          $(target).fadeIn(600);
          
        });
    }
    var getAllProducts = function(){
          try {
            var products = JSON.parse(localStorage.products);
            return (userId && products[partner] && products[partner][userId])? products[partner][userId] : [];
          } catch (e) {
            return [];
          }
        }
    function setupCart(){
        var isCartPage = $("#cartpage");
        if(!isCartPage.length){
            return;
        }
        var goToCartIcon = function($addTocartBtn){
            var $cartIcon = $(".my-cart-icon");
            var $image = $('<img width="30px" height="30px" src="' + $addTocartBtn.data("image") + '"/>').css({"position": "fixed", "z-index": "999"});
            $addTocartBtn.prepend($image);
            var position = $cartIcon.position();
            $image.animate({
                top: position.top,
                left: position.left
            }, 500 , "linear", function() {
                $image.remove();
            });
        }
        planId = $("#cartpage").attr("data-planid");
        
        $('.my-cart-wrapper-row').myCart({
            partner : partner,
            userId:userId,
            currencySymbol: '₹',
            classCartIcon: 'my-cart-icon',
            classCartBadge: 'my-cart-badge',
            classProductQuantity: 'my-product-quantity',
            classProductRemove: 'my-product-remove',
            classCheckoutCart: 'my-cart-checkout',
            affixCartIcon: true,
            showCheckoutModal: true,
           
            clickOnAddToCart: function($addTocart){
                goToCartIcon($addTocart);
            },
            afterAddOnCart: function(products, totalPrice, totalQuantity) {
                console.log("afterAddOnCart", products, totalPrice, totalQuantity);
            },
            clickOnCartIcon: function($cartIcon, products, totalPrice, totalQuantity) {
                console.log("cart icon clicked", $cartIcon, products, totalPrice, totalQuantity);
            },
            checkoutCart: function(products, totalPrice, totalQuantity) {
                var checkoutString = "Total Price: " + totalPrice + "\\nTotal Quantity: " + totalQuantity;
                checkoutString += "\\n\n id \t name \t summary \t price \t quantity \t image path";
                $.each(products, function(){
                    checkoutString += ("\\n " + this.id + " \t " + this.name + " \t " + this.summary + " \t " + this.price + " \t " + this.quantity + " \t " + this.image);
                });
                
                // console.log("checking out", products, totalPrice, totalQuantity);
                checkoutCart(products, totalPrice, totalQuantity);
            },
            getDiscountPrice: function(products, totalPrice, totalQuantity) {
                console.log("calculating discount", products, totalPrice, totalQuantity);
                return totalPrice;
            }
        });
        var updateCurrentViewFromCartItems = function(){
            var items = getAllProducts();
            var viewItems = $(".my-cart-btn");
            var inCart = function(id){
                for(var i=0;i<items.length;i++){
                    if(items[i].id==id){
                        return true;
                    }
                }
                return false;
            }
            for(var i=0;i<viewItems.length;i++){
                var $e = $(viewItems[i]);
                var id = $e.attr("data-id");
                var isInCart = inCart(id);
                if(isInCart){
                    $e.addClass("is-remove").html("Remove");
                    $e.closest(".my-cart-wrapper-row").addClass("in-cart");
                } else {
                    $e.removeClass("is-remove").html("Add");
                    $e.closest(".my-cart-wrapper-row").removeClass("in-cart");
                }
            }

        }
        updateCurrentViewFromCartItems();
        
    }
    
    function getpaymentData(){
        var $active = $(".tab-pane.active");
        var type = $active.data("type");
        var data =  {};
        var couponCode = $("#coupon_code").val();
        if(couponCode){
            data['coupon_code']=couponCode;
        }
        if(type=="1"){ 

        } else if(type=="2"){ //collect cash/cheque request
            //submit address, preffered time , notes
            var referralCode = $active.find("#agent_id").val();
            if(referralCode){
                data['agentCode'] = referralCode;
            }
            var address = $active.find("#payment_address").val();
            var prefferedTime1 = $active.find("#time_from").val();
            var prefferedTime2 = $active.find("#time_to").val();
            data['message'] = "Please provide cach/cheque collection facility to my address: \n "+address+"\n My Preferred Time is between "+(prefferedTime1+" to "+prefferedTime2);
           data['mode'] = "REQUEST_CASH";
        } else if(type=="3"){ //cash
            var referralCode = $active.find("#agent_id").val();
            if(referralCode){
                data['agentCode'] = referralCode;
            }

            var otp = $active.find("#agent_otp").val();
            if(otp){
                data['otp'] = otp;
            } 
            data['mode'] = "CASH";
        } else if(type=="4"){ //By Cheque
            //confirm agent code, and agent identity
            var referralCode = $active.find("#agent_id").val();
            if(referralCode){
                data['agentCode'] = referralCode;
            }

            var otp = $active.find("#agent_otp").val();
            if(otp){
                data['otp'] = otp;
            } 
            data['chequeNo'] = $active.find("#cheque_number").val();
            data['bankName'] = $active.find("#bank_name").val();
            data['mode'] = "CHEQUE";
              //
        } else if(type=="5"){ //NEFT
            var referralCode = $active.find("#agent_id").val();
            if(referralCode){
                data['agentCode'] = referralCode;
            }
            data['bankName'] = $active.find("#bank_name").val();
            // data['receptNo'] = $active.find("#ref_number").val();
            data['mode'] = "ONLINE";
        }
        var planId = $("#checkout-page-plan").data("planid");
        data['planId'] = planId;
        var txnid = $("#checkout_details").data("txnid");
        data['txnId'] = txnid;
        var message = $active.find("#user_message").val();
        if(message){
            if(data['message']){
                data['message'] = data['message'] + "\n"+message;
            } else {
                data['message'] = message;
            }    
        }
        
        return data;
    }
    function setupPaymentInfoSumbit(){
        var isInterestedPage = $("#checkout_details").length;
        if(!isInterestedPage){
            return;
        }
        var postData = function(pdata){
            var success = function(data){
                if(data.errorCode=="0"){
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Submitted Successfully");
                    setTimeout(function(){
                        window.location = "/user/profile";
                    },5000);
                } else {
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Error in submitting information. Please contact support for more details");
                }

                
            }
            var fail = function(data){
                $("#submit-payment-generic-error-msg").removeClass("hide").html("Error In Submitting");
            }
            var urlVars = Utils.getUrlVars();
                            
            if(urlVars.contentId && urlVars.contentId!="null" && urlVars.contentId!="undefined"){
                pdata['contentId']=urlVars['contentId'];
            }
            if(urlVars.userId && urlVars.userId!="null" && urlVars.userId!="undefined"){
                pdata['userId']=urlVars['userId'];
            }
            Utils.showLoader(5000);      
            Hocalwire.Services.post("/xhr/admin/user/submitPaymentInfo",pdata)
                .then(function(data) {
                    Utils.hideLoader();
                    success(data);
                },
                function(data) { 
                    Utils.hideLoader();
                    fail(data);
                }
            );

        };
        $(".js_submit_payment_info_btn").on("click",function(){
            var $active = $(".tab-pane.active");
            var type = $active.data("type");

            if(type=="1"){  //online
                    //no code here as directly payment gateway is opening
            } else if(type=="2"){ //collect cash/cheque request
               var data = getpaymentData();
               postData(data);

            } else if(type=="3"){ //cash
                var data = getpaymentData();
                if(!data.agentCode && !data.otp){
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Please enter valid referral id and recepit no (received on agents mombile no)");
                    return;
                }
                postData(data);
                $active.find(".submit_agent_code").removeClass("hide");
                //confirm agent code, and agent identity
            } else if(type=="4"){ 
                //By Cheque
                //confirm agent code, and agent identity
                var data = getpaymentData();
                var noValidate = $("#no-check-validation");

                if(!noValidate.length &&  !data.agentCode && !data.otp){
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Please enter valid referral id and recepit no (received on agents mombile no)");
                    return;
                }
                postData(data);
                $active.find(".submit_agent_code").removeClass("hide");
            } else if(type=="5"){ //NEFT
                var data = getpaymentData();
                postData(data);
            }
        });
     
        $(".js_submit_apply_coupon").on("click",function(){
            var $active = $(".apply_coupons_wrapper");
            var couponCode = $active.find(".val_couponCode").val();
            var url =  "/xhr/admin/applyCouponCode"; // the script where you handle the form input.
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };

            Utils.showLoader(5000);
            
            var $active = $(".tab-pane.active");
            var type = $active.data("type");

            if(type=="1"){  //online
                    //no code here as directly payment gateway is opening
            } else if(type=="2"){ //collect cash/cheque request
               var data = getpaymentData();
               postData(data);

            } else if(type=="3"){ //cash
                var data = getpaymentData();
                if(!data.agentCode && !data.otp){
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Please enter valid referral id and recepit no (received on agents mombile no)");
                    return;
                }
                postData(data);
                $active.find(".submit_agent_code").removeClass("hide");
                //confirm agent code, and agent identity
            } else if(type=="4"){ 
                //By Cheque
                //confirm agent code, and agent identity
                var data = getpaymentData();
                var noValidate = $("#no-check-validation");

                if(!noValidate.length &&  !data.agentCode && !data.otp){
                    $("#submit-payment-generic-error-msg").removeClass("hide").html("Please enter valid referral id and recepit no (received on agents mombile no)");
                    return;
                }
                postData(data);
                $active.find(".submit_agent_code").removeClass("hide");
            } else if(type=="5"){ //NEFT
                var data = getpaymentData();
                postData(data);
            }
        });
        
     

        $(".js_send_agent_code").on("click",function () {
            var $active = $(".tab-pane.active");
            var type = $active.data("type");
            var code = $active.find("#agent_id").val();
            var planId = $("#checkout-page-plan").data("planid");
            if(!code){
                $active.$(".error_agent_code").removeClass("hide");
                return;
            }
            var txnid = $("#checkout_details").data("txnid");
            var url = "/xhr/admin/user/submit-agent-code?code="+code+"&txnid="+txnid+"&planId="+planId; // the script where you handle the form input.
            Utils.showLoader(5000);    
            Hocalwire.Services.get(url).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        var dd = {};
                        if(data.data){
                            dd=JSON.parse(data.data);
                        }
                        var name = dd.nickName || dd.firstName || "";
                        var phone = dd.phoneNo || "";
                        if(name){
                            $active.find("#agent_name_on_checkout").html(name);
                        }
                        if(phone){
                            $active.find("#agent_mobile_on_checkout").html(phone);
                        }
                        
                        $active.find(".otp_for_agent_message").removeClass("hide");
                    } else {
                        $active.find('.otp_for_agent_message').html("Error occured. Try Again").removeClass("hide");
                    }
                },

                function(e) {
                    $('.otp_for_agent_message.hide').html("Error occured. Try Again").removeClass("hide");
                }
            );
                
        });
            
        $(".js_validate_coupon").on("click",function () {
            
            var code = $("#coupon_code").val();
            var planId = $("#checkout-page-plan").data("planid");
            if(!code){
                $active.$(".error_coupon_empty_code").html("Code Empty").removeClass("hide");
                return;
            }
            var txnid = $("#checkout_details").data("txnid");
            var url = "/xhr/admin/user/submit-coupon-code?code="+code+"&txnid="+txnid+"&planId="+planId; // the script where you handle the form input.
            Utils.showLoader(5000);    
            Hocalwire.Services.get(url).then(
                function(data){
                    Utils.hideLoader();
                    if(data.errorCode == 0) {
                        var dd = {};
                        if(data.data){
                            dd=JSON.parse(data.data);
                        }
                        console.log(dd);
                        applyCouponCode(dd);
                    } else {
                        $("#coupon_code").attr("is-validated",false);
                        $('.error_coupon_empty_code').html("Error occured. Try Again").removeClass("hide");
                    }
                },

                function(e) {
                    $("#coupon_code").attr("is-validated",false);
                    $('.error_coupon_empty_code').html("Error occured. Try Again").removeClass("hide");
                }
            );
                
        });
    }

    function applyCouponCode(data){
        console.log("apply coupon called");
        var isValid = data.is_valid;
        if(isValid == 'true') {
            $("#coupon_code").attr("is-validated",true);
            var discount = parseInt(data.discount);
            var curr = $("#total_payable_amount");
            var currVal = parseInt(curr.html());
            var finalVal = currVal-discount;
            $("#total_payable_amount").html(finalVal);
            var message = "<b>Congratulations !!! </b><br>You have got a discount of Rs. " + discount+". You discounted value is Rs. "+ finalVal;
            $('.discount_message').html(message).removeClass("hide");
        } else {
            $('.discount_message').html("Unable to apply your coupon. Your Coupon Code is not valid or expired. Feel free to contact us if you think otherwise.").removeClass("hide");
        }

    }
    function setupCheckoutPage(){
        if(!$("#checkoutpage").length){
            return;
        }
        var planId = $("#checkoutpage").attr("data-planid");
        if(!planId){
            return;
        }
        var products = getAllProducts();
        var sendData = {};
        
        // var itemIds = "";
        // for(var i=0;i<products.length;i++){
        //     if(i<products.length-1){
        //         itemIds+=products[i].id+",";
        //     } else {
        //         itemIds+=products[i].id;
        //     }
        // }
        
        var urlVars = Utils.getUrlVars();
        for(var k in urlVars){
            sendData[k] = urlVars[k];
        }
        sendData['items'] = JSON.stringify(products);
        sendData['planId'] = planId;
        var success = function(data){
          $("#cart-items").html(data.viewData);
          
          setupPaymentInfoSumbit();
          bindForProceedToPayment();
        }
        var fail = function(data){
            $("#cart-items").html("<div> error in loading</div>");
        }
        Utils.showLoader(5000);      
        Hocalwire.Services.post("/xhr/admin/user/getCartCheckoutPageData",sendData)
            .then(function(data) {
                Utils.hideLoader();
                success(data);
            },
            function(data) { 
                Utils.hideLoader();
                fail(data);
            }
        );

    }
    function checkoutCart(products, totalPrice, totalQuantity){
        var sendData = {};
        var itemIds = "";
        for(var i=0;i<products.length;i++){
            if(i<products.length-1){
                itemIds+=products[i].id+",";
            } else {
                itemIds+=products[i].id;
            }
        }
        sendData['itemIds'] = itemIds;
        sendData['planId'] = planId;
        var success = function(data){
          
        }
        var fail = function(data){
         
        }
        var url = "/user/checkout?planId="+planId;
        var urlVars = Utils.getUrlVars();
        for(var k in urlVars){
            if(url.indexOf(k)<0){
                url = url + "&"+k+"="+urlVars[k];
            }
        }     
        window.location.href=url;
        return;

        Hocalwire.Services.post("/xhr/admin/user/getCartValue",sendData)
            .then(function(data) {
                Utils.hideLoader();
                success(data);
            },
            function(data) { 
                Utils.hideLoader();
                fail(data);
            }
        );
      
    }
    function bindForProceedToPayment(){
        var btn = $(".js_checkout_button");
        if(!btn || !btn.length) {
            return;
        }
        btn.on("click",function(){
            var url = btn.data("payment-url");
            var form = $(".checkout-form");
            var agentId = $(".tab-pane.active #agent_id").val();
            if(agentId){
                form.find(".agent-code").val(agentId);
            }
            var couponId = $("#coupon_code").val();
            if(couponId && $("#coupon_code").attr("is-validated")){
                form.find(".coupon-code").val(couponId);
            }
            
            var options = {
                'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
            };
            Hocalwire.Services.post(url,form.serialize(),options).then(
                function(data){
                    console.log(data);
                },

                function(e) {
                    $(".error-msg").removeClass("hide");
                }
            );
            
        });
            
    }
 })();