"use strict";
var Constants = require("src/locales/Constants");

var mobileAgent = require('mobile-agent');
var logger = require('src/libs/logger');
var DOMParser = require('xmldom').DOMParser;
var Utils = require("src/libs/Utils");
function RDM(action,partner){
	this.rdAttr = { };
	var that = this;
	//constructor
	var initialize = function(action,app,partner) {

		logger.log("this is"+that+"attr"+that.rdAttr+"partner:"+partner);
		if(action) that.rdAttr.action = action;
		that.rdAttr.sessionId = partner ? Constants.getPartnerSessionId(partner) : Constants.sessionId;
		that.rdAttr.app = app || Constants.app;
		that.rdAttr.partner = partner || Constants.partner;
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
		
		for (var attr in this.rdAttr) rdAtributes += " "+attr+"='"+Utils.xmlEncodeChars(this.rdAttr[attr])+"'";
		
		var rdRows = "";
		for (var key in this.rdRows) {
			var row = this.rdRows[key];
			rdRows +="<property ";
			for(var name in row)
			{
				console.log(row[name]);
				rdRows += "\t" + name + "='"+Utils.xmlEncodeChars(row[name])+"'";
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

module.exports = RDM;