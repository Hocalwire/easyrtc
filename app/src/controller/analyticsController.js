"use strict";

var apiHelper = require('src/libs/apiHelper');
var Constants = require('src/locales/Constants');

var Utils = require("src/libs/Utils");
var url = require("url");
var staticDataController = require("src/controller/helpers/staticDataController");
var db = {};
var Datastore = require('nedb');
var logger = require('src/libs/logger');


function initDB(){
    db.visitDb = new Datastore({ filename: 'src/data/visit_data.db', autoload: true });
    db.visitorDb = new Datastore({ filename: 'src/data/visitor_data.db', autoload: true });
    db.visitActionDb = new Datastore({ filename: 'src/data/visit_action_data.db', autoload: true });
    db.visitorActionDb = new Datastore({ filename: 'src/data/visitor_action_data.db', autoload: true });
}


function addOrUpateVisitRecord(req,res,props){

}
function addOrUpateVisitorRecord(req,res,props){

}


function addOrUpdateVisitAction(req,res,props){

}

function addOrUpdateVisitorAction(req,res,props){

}

function trackUserData(req,res,next){
	var path = req.pathname;
	var visitData = getVisitObject(req,res,next);
	db.visitDb.insert(visitData, function (err, newDoc) {   // Callback is optional
	  console.log("visit record inserted");
	});
}
function getVisitorObject(req,req,next){
	var data = req.body || req.query;
	var doc = {};
	// doc.ua = req.headers["user-agent"];
	doc.id = data.id;
	doc.parnter = data.partner;
	doc.url = data.url;
	var d = new Date();
	doc.timestamp = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000)); //concver to GMT timezone
	doc.contentCategory = data.category || "";
	doc.userId = data.userId;
	doc.location = { "address":data.location,"lat":data.lat,"lng":data.lng};
	return doc;

}
function getVisitObject(req,req,next){
	var data = req.body || req.query;
	var doc = {};
	doc.ua = req.headers["user-agent"];
	doc.id = data.id;
	doc.parnter = data.partner;
	doc.url = data.url;
	var d = new Date();
	doc.timestamp = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000)); //concver to GMT timezone
	doc.contentCategory = data.category || "";
	doc.userId = data.userId;
	doc.location = { "address":data.location,"lat":data.lat,"lng":data.lng};
	return doc;

}

module.exports.trackUserData=trackUserData;
