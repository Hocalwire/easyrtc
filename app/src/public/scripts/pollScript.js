function RDM(action,partner,app,sessionId){
	this.rdAttr = { };
	var that = this;
	//constructor
	var initialize = function(action,app,partner) {

		
		if(action) that.rdAttr.action = action;
		that.rdAttr.sessionId = sessionId;
		that.rdAttr.app = app;
		that.rdAttr.partner = partner;
		that.rdRows = {};
	};
	
	
	this.setRDMAttribute = function(key, value) {
		this.rdAttr[key] = value || "";
		return this;
	};
	
	
	this.setRDMProperty = function(id, key, value) {
		var row = this.rdRows[id];
		if(!row) this.rdRows[id]= {};
		row = this.rdRows[id];
		if(!row['id']) row['id']=id;
		//if(!row['deviceType']) row['deviceType']=RDAdapter.platform;
		row[key] = value||"";
		return this;
	};

	//Returns a <zebra> attribute value.
	this.getRDMProperty = function(id,key) {
		var row = this.rdRows[id];
		if(!row) return "";
		return row[key];
	};

	this.getRDMAttribute = function(key,defaultV) {
		return (this.rdAttr[key] || defaultV|| "");
	};
	

	this.getRMDRow = function(id)
	{
		var row = this.rdRows[id];
		if(!row) this.rdRows[id] = {};
		return this.rdRows[id];

	};
	this.setRMDRow = function(id,object)
	{
		return (this.rdRows[id] =object);

	};

	
	
	//Returns an XML String representation of the zebra.
	this.toXML = function() {
		var rdAtributes = "";
		
		for (var attr in this.rdAttr) rdAtributes += " "+attr+"='"+this.rdAttr[attr]+"'";
		
		var rdRows = "";
		for (var key in this.rdRows) {
			var row = this.rdRows[key];
			rdRows +="<property ";
			for(var name in row)
			{
				rdRows += "\t" + name + "='"+row[name]+"'";
			}
			rdRows +="/>";
		}

		

		return "<?xml version='1.0' encoding='UTF-8'?>" +
			"<rdm " + rdAtributes  + ">" +
				rdRows+"" +
			"</rdm>";
	};
	initialize(action,null,partner);
};
RDM.parse =  function(rdmString){
	// logger.info("rdm parse called for string"+rdmString);
	var time = new Date().getTime();
	if(!rdmString|| rdmString.length== 0) return null;
	var xmlDoc,parser;
	if(DOMParser) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(rdmString, "text/xml");
	}
	// if(!parser){
	// 	return new RDM("");
	// }
	
	var rdAttrNode = xmlDoc.getElementsByTagName("rdm")[0];
	
	if(!rdAttrNode || !rdAttrNode.getAttribute("action")|| rdAttrNode.getAttribute("action").length==0) return new RDM(""); //no action in RDM defined.
	var rdm = new RDM("");
	
	var ignoreDecode = rdmString.indexOf("MULTIPLE_RDM") >-1 || rdmString.indexOf("UPDATE_SKETCH_MULTIPLE") >-1;
	
	RDM.parseAttr(rdm,rdAttrNode);
	
	var rowList = xmlDoc.getElementsByTagName("property");
	
	RDM.parseRows(rdm,rowList,ignoreDecode);
	return rdm;
}
RDM.parseRows =  function(rdm,nodeList,ignoreDecode){
		var id;
		if(nodeList) {
			for(var i=0; i<nodeList.length; i++) {
				if(!nodeList[i].getAttribute("id")) id=new Date().getTime()+"";
				else id = nodeList[i].getAttribute("id");
				var row = rdm.getRMDRow(id);
				var nodeProperties = nodeList[i].attributes;
				for(var j=0; j<nodeProperties.length; j++) 
				{
					if(ignoreDecode) 
						row[nodeProperties[j].nodeName] = nodeProperties[j].text||nodeProperties[j].textContent||"";					
					else {
						try{
							row[nodeProperties[j].nodeName] = decodeURIComponent(nodeProperties[j].text||nodeProperties[j].textContent||"");					
						} catch(e){
							row[nodeProperties[j].nodeName] = nodeProperties[j].text||nodeProperties[j].textContent||"";						
						}
					}
				}
					
			}

		}
	

}
RDM.parseAttr =  function(rdm,node){
		var attr = node.attributes;
		for(var i=0; i<attr.length; i++) {
			rdm.setRDMAttribute(attr[i].nodeName, attr[i].nodeValue);					
		}
	
};
function PollManager(){
	this.sessionId ="";
	this.app="hocal";
	this.partner="";
	this.pollDuration=100;
	this.pollDurationDisconnected=1500;
	this.pollDurationConnected=100;
	this.platform="WEB";
	this.pollUrl = "";
	this.finalPollUrl = "";
	this.currState = "";
	this.pollTimeout = 45*1000;
	this.pollTimeoutObject=0;
	
 	this.pollRequestAjaxObject = "";
 	this.eventListeners = {

 	};
 	
 	this.dispatchEvent = function(event,rdm){
		var obj = this.eventListeners[event];
		if(obj){
			obj(rdm);
		}
	};

 	var that = this;
 	this.getPollUrl = function(){
 		var url = that.pollUrl+"command=getData"+
				"&sessionId=" + that.sessionId +
				"&app=" + that.app +
				"&partner=" + that.partner;
		return url;
	}
 	this.poll = function(){
 		if(that.isPaused){
 			return;
 		}
 		var pollUrl = that.pollUrlFinal;
        var formData = {};
       	if(that.pollRequestAjaxObject){
       		that.pollRequestAjaxObject.abort();
       	}
        that.pollRequestAjaxObject = $.ajax({
            data: formData,
            type: 'POST',
            async:false,
            url: pollUrl,
            cache: false,
            contentType: false,
            processData: false,
           	timeout : that.pollTimeout,
           	async:true,
            xhr: function()
            {
             
                var myXhr = $.ajaxSettings.xhr();
                return myXhr;
                
            },
            success: function(respsonse) {
                that.proccessResponse(respsonse);
            },
            error : function(XHR, textStatus, errorThrown) {
	            if(that.pollRequestAjaxObject){
		       		that.pollRequestAjaxObject.abort();
		       	}
              that.proccessResponse("DISCONNECTED\nEMPTY");  
            }
        });
            
    	if(that.pollTimeoutObject){
    		clearTimeout(that.pollTimeoutObject);
    	}
 		that.pollTimeoutObject=setTimeout(function(){
 			that.poll();
 		},that.pollDuration);
 	};
 	this.proccessResponse = function(response){
 		if(!response || response == "") return; //response is blank
		response = response.replace(/^[\s]+/, "").replace(/[\s]+$/, ""); //trim whitespaces
		if(response == "") return;
		var responseLines = response.split("\n");
        var state = responseLines.shift();
        if(state!=that.currState){
        	if(that.stateCallback){
        		that.stateCallback(that.currState,state);
        	}
        }
        that.currState=state;
        if(that.currState!="WAITING"){
        	that.pollDuration = that.pollDurationDisconnected;
        } else {
        	that.pollDuration = that.pollDurationConnected;
        }
        //LINE2: process command
        switch(responseLines.shift()) {
            case "EMPTY":
            break;
            case "MESSAGE":
            
            if(responseLines.length > 0) 
		    {
			var description = responseLines.shift();
			var details;
			if(responseLines.length ==2)
			{
				if(responseLines[0] == responseLines[1])
				{
					details = responseLines[0];
				}
				else
				{
					details =  responseLines.join("\n"); 
				}
			}else
			{
	                     details =  responseLines.join("\n");
			}

			that.processRDM(description,details);
	    }
            break;
        }
		        
 	}
 	this.processRDM = function(description,details){
		switch(description) {
		    case "RDM":
				var rdm = RDM.parse(details);
			    if(rdm) {
					that.dispatchEvent("RDM_RECEIVED", rdm);
					that.rdmCallback(rdm);
			    }
			    break;
			            
		    default:
        }
 	}
};
var pollObject = null;
PollManager.init = function(options){
	if(!pollObject){
		pollObject = new PollManager();
	}
	for(var k in options){
		pollObject[k] = options[k];
	}
	pollObject.pollUrlFinal = pollObject.getPollUrl();
	pollObject.isPaused=false;
	pollObject.poll();
}
PollManager.destroy = function(){
	pollObject=null;
}
PollManager.addListner = function(key,obj){
	pollObject.eventListeners[key]=obj;
}
PollManager.removeListener = function(options){
	delete pollObject.eventListeners[key];
}
PollManager.startPolling = function(options){
	pollObject.isPaused=false;
	pollObject.poll();
}
PollManager.stopPolling = function(options){
	pollObject.isPaused=true;
}
