function validateContentForm(formId) {
	var pass = true;
	
	$('form input[type="text"]').each(
		    function(index){  
		        var input = $(this);
		        var type = input.attr('type');
		        var needValidation = input.attr('validate-hidden');
		        var errE = $(".errorMessages_"+$(this).attr("id"));
		        var value = input.val();
		        var dname = input.data("display-name");
		        if( type != 'hidden' || (needValidation && needValidation == 'true')) {
		        	var isMandatory = input.attr('data-mandatry');
		        	if(isMandatory == 'true') {
		        		var placeHolder = input.attr('placeHolder');
		        		if(!value || value == "") {
		        			pass = false;
		        			showMessage("Invalid Value","Please provide "+dname,errE);
		        			return false;
		        		}
		        		
		        		var validationType = input.attr('data-validation');
		        		var length = input.attr('data-length');
		        		var regex = input.attr('data-regex');
		        		if(validationType == 'NUMBER') {
		        			regex = '^[0-9]+$';
		        		} else if(validationType == 'NUMBER' || validationType == 'PHONE') {
		        			regex = '^[0-9]+$';
		        			length = 10;
		        		} else if(validationType == 'ALPHANUMBERIC') {
		        			regex = '^[0-9][a-z][A-Z]+$';
		        		} else if(validationType == 'PRICE') {
		        			regex = '^[0-9],+$';
		        		}
		        		if(regex) {
		        			var re = new RegExp(regex);
		        			if(!re.test(value)) {
		        				pass = false;
		        				showMessage("Invalid Input","Please provide a valid "+dname,errE);
		        				return false;
		        			}
		        		}
		        		if(length) {
		        			if(value.length!= length) {
		        				showMessage("Invalid Input","Please Provide correct size input for "+dname,errE);
		        				return;
		        			}
		        		}
		        	}
		        }
		    }
		);

	if(!pass) {
		return false;
	}
	$('form select').each(
		    function(index){  
		        var input = $(this);
		        var type = input.attr('type');
		        var value = input.val();
		        var errE = $(".errorMessages_"+$(this).attr("id"));
		        var dname = input.data("display-name");
		        if( type != 'hidden') {
		        	var isMandatory = input.attr('data-mandatry');
		        	if(isMandatory == 'true') {
		        		var placeHolder = input.attr('placeHolder');
		        		if(!value || value == "") {
		        			pass = false;
		        			showMessage("Invalid Value","Please provide "+placeHolder,errE);
		        			return false;
		        		}

		        		var validationType = input.attr('data-validation');
		        		var regex = input.attr('data-regex');
		        		if(validationType == 'NUMBER') {
		        			regex = '^[0-9]+$';
		        		} else if(validationType == 'NUMBER' || validationType == 'PHONE') {
		        			regex = '^[0-9]+$';
		        		} else if(validationType == 'ALPHANUMBERIC') {
		        			regex = '^[0-9][a-z][A-Z]+$';
		        		} else if(validationType == 'PRICE') {
		        			regex = '^[0-9],+$';
		        		} else if(validationType == 'STRING') {
		        			regex = '^[a-z][A-Z]+$';
		        		}
		        		if(regex) {
		        			var re = new RegExp(regex);
		        			if(!re.test(value)) {
		        				pass = false;
		        				return false;
		        				showMessage("Invalid Input","Please Provide correct size input for "+dname,errE);
		        			}
		        		}
		        		
		        	}
		        }
		    }
		);
	if(!pass) {
		return false;
	}
	$('form textarea').each(
		    function(index){  
		        var input = $(this);
		        var type = input.attr('type');
		        var value = input.val();
		        var errE = $(".errorMessages_"+$(this).attr("id"));
		        var dname = input.data("display-name");
		        if( type != 'hidden') {
		        	var isMandatory = input.attr('data-mandatry');
		        	if(isMandatory == 'true') {
		        		var placeHolder = input.attr('placeHolder');
		        		if(!value || value == "") {
		        			pass = false;
		        			showMessage("Invalid textarea","Please Provide correct input for "+dname,errE,true);
		        			return false;
		        		}
		        	}
		        }
		    }
		);
	return pass;
}
function showMessage(heading, description,errE){
	
	if(errE) {
		errE.empty().html("<span>"+heading+"&nbsp;"+description+"</span>").show();
	}
	// setTimeout(function(){errE.slideDown();},5111);
}


function submitContactForm(formId){
	$(".errorMessages").hide();
	if(validateContentForm(formId)) {

		var $el = $(".register-reporter");
		var $form = $el.find("#"+formId);
		var redirecturl = $form.attr("data-redirect");

		var on_behalf = $form.attr("data-on-behalf");
		var byAgent  = $form.attr("data-by-agent");
		var uid = $form.attr("data-uid");
		if(byAgent && byAgent!="undefined" && uid){
			on_behalf=uid;
		}
		var checkBoxes = $(".checkbox_type");
		for(var i=0;i<checkBoxes.length;i++){
			var $ele = $(checkBoxes[i]);
			var name = $ele.attr("data-name");
			var items = $("input.checkbox_input_"+name+"[type='checkbox']:checked");
			var val = "";
			for(var k=0;k<items.length;k++){
				var vall = $(items[k]).val();
				if(vall){
					if(val){
						val = val+","+vall;
					} else {
						val = vall;
					}
				}
			}
			$ele.val(val);
		}
		var url = window.Constants.url.xhrJoinUs ? window.Constants.url.xhrJoinUs :  "/xhr/admin/submitJoinUsForm"; // the script where you handle the form input. // the script where you handle the form input.
		if(on_behalf && on_behalf!="undefined"){
			url=url+"?on_behalf="+on_behalf;
		}
		var content_type=$form.attr("data-content-type");
		if(content_type && content_type.length){
			url=url+"?content_type_name="+content_type;
		}
    	var options = {
            'contentType' : 'application/x-www-form-urlencoded; charset=utf-8'
        };
        Utils.showLoader(5000);
        Hocalwire.Services.post(url,$form.serialize(),options).then(
            function(data){
            	Utils.hideLoader();
            	console.log("error code:"+data.errorCode);
                if(data.errorCode == 0) {
       				$(".errorHandling").html("<span class='success'>your form has been successfully submitted</span>");             
       				if(redirecturl && redirecturl!="undefined"){
       					if(on_behalf && on_behalf!="undefined"){
       						if(redirecturl.indexOf("?")>-1){
           						redirecturl = redirecturl+"&on_behalf="+on_behalf;
           					} else {
           						redirecturl = redirecturl+"?on_behalf="+on_behalf;
           					}
       					}

       					var urlVars = Utils.getUrlVars();
				        for(var k in urlVars){
				            if(redirecturl.indexOf(k)<0){
				            	redirecturl = redirecturl + "&"+k+"="+urlVars[k];
				            }
				        }
				        if(data.contentId && data.contentId!="null" && data.contentId!="undefined"){
				        	redirecturl = redirecturl + "&contentId="+data.contentId;
				        }
				        if(data.userId && data.userId!="null" && data.userId!="undefined"){
				        	redirecturl = redirecturl + "&userId="+data.userId;
				        }
       					window.location=redirecturl;
       				} else {

       				}
                } else {
                    $(".errorHandling").html("<span class='error'>something went wrong</span>");
                }
                $(".errorHandling").show();
            },

            function(e) {
            	Utils.hideLoader();
                $(".errorHandling").html("<span class='error'>something went wrong</span>");
                $(".errorHandling").show();
            }
        );
	}
}

$("body").on("click",".js-submit-register-form",function(){
		submitContactForm("myForm");
});