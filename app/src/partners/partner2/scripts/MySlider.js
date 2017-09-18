/*
	To create a silder, first create object of MySLider ie: var o  = new MySlider(); o.createSlider(<element id>,<callback function>);
*/
function MySlider() {
	this.rangeMax =0;
	this.rangeMin = 0;
	this.mA = null;
	this.sA = null;
	this.totalSteps =0;
	this.callBack = null;
	this.createSlider = function(elementId,callback) {
			if(callback)
				this.callBack = callback;
			setupHTML(elementId,this);
			
	}
	function initValues(elem,referenceObj) {
		
		var totalSteps = 100;
		
		referenceObj.rangeMin = parseInt(elem.attr("min"));
		referenceObj.rangeMax=parseInt(elem.attr("max"));
	}
	function validateParams(refO){
		//Add code here to validate wrong values passed in div
		return true;
	}
	function bindListeners(curr,referenceObj) { 
		var slider=$("#range_slider_"+curr);
		var that = referenceObj;
	
		slider.on("input",function(e,a,b){
			var index=$(this).val();
			
			if(that.callBack)
				that.callBack(index);
		});
		slider.trigger('input');
	}
	function setupHTML(id,refO)
	{
			var e = $("#"+id);
			var initValue = e.attr("value");
			if(!initValue) initValue = 0;
			initValues(e,refO);
			validateParams(refO);
			var curr = new Date().getTime();
			var html = "<input type='range' step='1' value='"+initValue+"' style='width: 100%' min='"+refO.rangeMin+"' max='"+refO.rangeMax+"' id='range_slider_"+curr+"'/>";
			var insertE = $(html);
			e.after(insertE);
			e.hide();
			bindListeners(curr,refO);
	}
	
		
	
};