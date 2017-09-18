"use strict";

var http = require('http');
var https = require('https');
var Promise = require('promise');

var Constants = require("src/locales/Constants");
var RDM = require("src/libs/RDM");
var logger = require('src/libs/logger');
var requestStartCount=0;
var requestCompleteCount=0;
var app;
var socket = require("socket.io");
var io;

module.exports.setup = function(expressApp) {
    app = expressApp;
    io = socket(app);
};

function saveAndTransmitStream(req,res,next){
	io.on("connection",function(socket){
		socket.on("stream",function(image){
			socket.broadcast.emit('stream',image);
		});
	});
}

function readStream(req,res,next){

}
function writeStream(req,res,next){

}
function handleReadStream(req,res,next){
	var params = req.query;
	var path = "src/public/videoStreams/"+params.id;
  	var stat = fs.statSync(path);
  	var total = stat.size;
	if (req.headers['range']) {
		var range = req.headers.range;
		var parts = range.replace(/bytes=/, "").split("-");
		var partialstart = parts[0];
		var partialend = parts[1];

		var start = parseInt(partialstart, 10);
		var end = partialend ? parseInt(partialend, 10) : total-1;
		var chunksize = (end-start)+1;
		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

		var file = fs.createReadStream(path, {start: start, end: end});
		res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
		file.pipe(res);
	} else {
		console.log('ALL: ' + total);
		res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
		fs.createReadStream(path).pipe(res);
	}
