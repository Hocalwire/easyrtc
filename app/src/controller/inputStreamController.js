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
        socket.on('uploadThumbData', function(data) {
            onUploadThumbData(socket,data);
        });
    });
}
function onUploadStart(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var fileRoot = data.fileRoot || "src/data/uploads/";
    var mkdirp = require('mkdirp');
    mkdirp(fileRoot, function(err) { 
        if(err){
            logger.error("====================================Error in creating Folder path:"+fileRoot);
            return;
        }
        var filepath = path.join(fileRoot, filename);
        var filepath1 = path.join(fileRoot, "original_"+filename);
        var ind = filename.indexOf(".mp4");
        var thumbName = filename.substring(0,ind)+".jpg";

        var filepathThumb = path.join(fileRoot, thumbName);
        var logStream = fs.createWriteStream(filepath1, {'flags': 'a'});
        var originalStream = fs.createWriteStream(filepath, {'flags': 'a'});
        var thumbStream = fs.createWriteStream(filepathThumb, {'flags': 'a'});
        writeStreams[filepath] = {"thumbStream":thumbStream,"fileRoot":fileRoot,"state":"STARTED","outStream":logStream,"accessToken":data.accessToken,"originalStream":originalStream,"filename":filename,"streamId":data.streamId,"postId":data.postId};
        var s = writeStreams[filepath];
        s.partner = data.partner || "allytech";
        s.accessToken=data.accessToken;
        s.streamId=data.streamId;
        s.ptitle=data.title;
        s.pdescription=data.description;
        socket.emit('moreData', { 'timestamp' : 0});
        if(data.streamId){
            postToSocial.sendStateRDM(data.streamId,"","PROCESSING",s.partner,"",true); 
        }
    });
}
function onUploadPause(){

}
function onUploadResume(){

}
function onUploadComplete(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join(data.fileRoot || 'src/data/uploads/' , filename);
    var s  = writeStreams[filepath];
    setTimeout(function(){
        if(s && s.logStream) {
            s.logStream.end();
        }
        if(s && s.originalStream) {
            s.originalStream.end();
        }
        s.state="ENDED";    
    },60*1000);
    
}
function emitFileAsHLS(){
    var cmd = 'ffmpeg';

    var args = [
        '-re', 
        '-i', mp4path,
        '-acodec','libmp3lame',
        '-s', '640x480', 
        '-ar','44100',
        '-b:a','128k',
        '-pix_fmt','yuv420p',
        '-profile:v','baseline',
        '-s','426x240',
        '-bufsize','6000k',
        '-vb','400k',
        '-maxrate','1500k', 
        '-deinterlace','-vcodec',
        'libx264','-preset', 
        'slow','-g', 
        '30','-r','30','-f', 'flv',rtmpurl
    ];
    var callback = function(){
        console.log("===========================================");
        console.log("command finished   -------------");
    }
    postToSocial.runCommand(cmd,args,callback,streamId,partner);
}
function onUploadThumbData(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join(data.fileRoot || 'src/data/uploads/', filename);
    var s  = writeStreams[filepath];

    if(s && s.state=="ENDED"){
        return;
    }
    if(s && s.thumbStream) {
        s.thumbStream.write(new Buffer(data.data));
        s.end();
    }
    
    
}
function onUploadData(socket,data){
    var fs = require("fs");
    var filename = data.name;
    var filepath = path.join(data.fileRoot || 'src/data/uploads/', filename);
    var s  = writeStreams[filepath];

    if(s && s.state=="ENDED"){
        return;
    }
    if(s && s.logStream) {
        s.logStream.write(new Buffer(data.data));
    }
    if(s && s.originalStream) {
        s.originalStream.write(new Buffer(data.data));
    }
    if(s && s.state!="RUNNING"){
        s.state="RUNNING";
        if(data.hlsName){
            emitFileAsHLS(filepath,data.hlsName)
        }
    }
    if(s && data.streamId){
            postToSocial.sendStateRDM(data.streamId,"","LIVE",s.partner,"",true); 
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


