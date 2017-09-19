"use strict";


var CommonUtils = require("src/libs/CommonUtils");
var Environment = require('src/models/Environment');
var url = require("url");
var logger = require('src/libs/logger');

var PartnerPropsModel = require('src/models/PartnerPropsModel');

var PartnerCatsModel = require('src/models/PartnerCategoriesModel');
var PartnerAuhtorsModel = require('src/models/PartnerAuthorsModel');
var PartnerStylingModel = require('src/models/PartnerStylingModel');
var PartnerContentModel = require('src/models/PartnerContentModel');
var PartnerNewsCacheModel = require('src/models/PartnerNewsCacheModel');
var PartnerContentTemplateModel = require('src/models/PartnerContentTemplateModel');

var isDevMode=false;
var viewapp;
var socketio;
var postToSocial = require("src/controller/postToSocial");


var Constants = require('src/locales/Constants');
var Utils = require('src/libs/Utils');
var logger = require('src/libs/logger');
var fs = require("fs");
var webshot = require('webshot');
var ioM = require('socket.io');
var ss = require('socket.io-stream');
var path = require('path');
var app;
module.exports.setup = function(viewapp) {
    app=viewapp;
    if(app.get('env')=="development"){
        isDevMode=true;
    }

};
module.exports.setupIO = function(socketServer) {
    socketio=socketServer
    setupReportingHandles();
    // setupSignalingServer();
};
var recordingData = {};
var writeStreams = {};
var Files;
var FileStreams = {};
var OutputStream = {};
function setupReportingHandles(){
    socketio.sockets.on('connection', function(socket) {
        socket.on('uploadStart', function(data) {
            onUploadStart(socket,data);
        });
        socket.on('uploadComplete', function(data) {
            onUploadComplete(socket,data);
        });
        socket.on('uploadData', function(data) {
            onUploadData(socket,data);
        });
    });
}
function onUploadStart(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join('src/data/uploads/', filename);
    var filepath1 = path.join('src/data/uploads/', "original_"+filename);
    var logStream = fs.createWriteStream(filepath, {'flags': 'a'});
    var originalStream = fs.createWriteStream(filepath1, {'flags': 'a'});
    writeStreams[filepath] = {"state":"STARTED","outStream":logStream,"accessToken":data.accessToken,"originalStream":originalStream,"filename":filename,"streamId":data.streamId,"postId":data.postId};
    var s = writeStreams[filepath];
    s.partner = data.partner || "allytech";
    s.accessToken=data.accessToken;
    s.streamId=data.streamId;
    s.ptitle=data.title;
    s.pdescription=data.description;
    socket.emit('moreData', { 'timestamp' : 0});
    // if(data.streamId){
    //     postToSocial.sendStateRDM(data.streamId,"","PROCESSING",s.partner); 
    // }
    
}
function onUploadPause(){

}
function onUploadResume(){

}
function onUploadComplete(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join('src/data/uploads/', filename);
    var s  = writeStreams[filepath];
    if(s.logStream) {
        s.logStream.end();
    }
    if(s.originalStream) {
        s.originalStream.end();
    }
    s.state="ENDED";
}
function onUploadData(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join('src/data/uploads/', filename);
    var s  = writeStreams[filepath];
    console.log("unupload data:");
    console.log(s);
    if(s.logStream) {
        s.logStream.write(new Buffer(data.data));
    }
    if(s.originalStream) {
        s.originalStream.write(new Buffer(data.data));
    }
    if(s.accessToken && s.state!="RUNNING"){
        s.state="RUNNING";
        var rtmpUrl = postToSocial.getRTMPFromPostId(s.postId);
        if(rtmpUrl){
            logger.error("making facebook live for video:"+path);
            setTimeout(function(){postToSocial.streamMP4ToRTMP("src/data/uploads/original_"+filename,rtmpUrl,s.streamId,s.partner);},10000);// (s.partner,s.accessToken,s.streamId,"original_"+filename,s.ptitle,s.pdescription);
        }
        
    }
    socket.emit('moreData', { 'timestamp' : data.timestamp});
    
}


var fs = require('fs');

var io;
var channels = {};
function setupSignalingServer(){
    io = require('socket.io').listen(app, {
        log: true,
        origins: '*:*'
    });

    io.set('transports', [
        // 'websocket',
        'xhr-polling',
        'jsonp-polling'
    ]);

    

    io.sockets.on('connection', function (socket) {
        var initiatorChannel = '';
        if (!io.isConnected) {
            io.isConnected = true;
        }

        socket.on('new-channel', function (data) {
            if (!channels[data.channel]) {
                initiatorChannel = data.channel;
            }

            channels[data.channel] = data.channel;
            onNewNamespace(data.channel, data.sender);
        });

        socket.on('presence', function (channel) {
            var isChannelPresent = !! channels[channel];
            socket.emit('presence', isChannelPresent);
        });

        socket.on('disconnect', function (channel) {
            if (initiatorChannel) {
                delete channels[initiatorChannel];
            }
        });
    });

}

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        var username;
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender) {
                if(!username) username = data.data.sender;
                
                socket.broadcast.emit('message', data.data);
            }
        });
        
        socket.on('disconnect', function() {
            if(username) {
                socket.broadcast.emit('user-left', username);
                username = null;
            }
        });
    });
}


