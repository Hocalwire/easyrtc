function RecordManager(){
    var initOptions = {};
    var self = this;
    this.outsocket=null;
    this.signalsocket=null;
    this.blobs = [];
    self.defaults = {
        outputFileName:"out.mp4",
        streamId : "DEFALUT_STREAM_"+new Date().getTime(),
        outStreamType : "REMOTE", //or "LOCAL"
        recordingType : "CAMERA",//SCREEN,RECORDED,CAMERA_VIDEO,CAMERA_AUDIO
        saveType : "REMOTE_SAVE",//REMOTE_EMIT,LOCAL_EMIT,SAVE_EMIT
        socketDomain : "https://thamaraisite.vocalwire.com",
        signalDomain : "https://thamaraisite.vocalwire.com",
        timeSlice : 500, //500 millisecond blobs
        width : 500,
        height: 500,
    }
    if(window.screen.width < 768){
        self.defaults.width = 300;
        self.defaults.height=300;
    }
    this.init = function(options){
        
        socketConnect(options.socketServer || self.defaults['socketDomain'],options.signalServer || self.defaults['signalDomain'])
        setup(options);
    }
    var setup = function(options,callback){
        self.outStreamType = options.outStreamType || self.defaults.outStreamType;
        self.recordingType = options.recordingType || self.defaults.recordingType;
        self.saveType = options.saveType || self.defaults.saveType;
        self.options = options;
        self.outputFileName = self.options.outputFileName || self.defaults.outputFileName;
        self.originalOutputFileName = self.options.originalOutputFileName || "original_"+self.outputFileName;
        self.streamId = self.options.streamId || self.defaults.streamId;
        setupRecording(callback);
    } 
    var socketConnect = function(url,singalurl){
        self.outsocket = io.connect(url);
        if(singalurl!=url){
            self.signalsocket = io.connect(singalurl);
        } else {
            self.signalsocket = self.outsocket;
        }
        self.waitingForBlob=false;
        self.outsocket.on('moreData', requestedMoreData);
    }
    var setupRecording = function(callback){
        switch(self.recordingType){
            case "CAMERA" :
                setupCameraRecording(callback);
                break;
            case "SCREEN" :
                setupScreenRecording(callback);
                break;
            case "RECORDED" :
                setupRecordedRecording(callback);
                break;
            case "RECORDED" :
                setupCameraVideoRecording(callback);
                break;
            case "RECORDED" :
                setupCameraAudioRecording(callback);
                break;
        }
    }
    function setupCameraRecording(callback){
        if(self.options.player){
            var player = videojs(self.options.player.elementId,
                {
                        controls: true,
                        width:self.options.player.width || self.defaults.width,
                        height: self.options.player.height || self.defaults.height,
                        plugins: {
                            record: {
                                audio: true,
                                video: true,
                                timeSlice: self.options.player.timeSlice || self.defaults.timeSlice,
                                maxLength: self.options.player.maxDuration || 600, //in minutes
                                debug: true
                            }
                        }
                    });
                    // error handling
                    player.on('deviceError', function()
                    {
                        console.log('device error:', player.deviceErrorCode);
                    });
                    player.on('error', function(error)
                    {
                        console.log('error:', error);
                    });
                    // user clicked the record button and started recording
                    player.on('startRecord', function()
                    {
                        console.log('started recording!');
                        uploadStart();
                    });
                    // user completed recording and stream is available
                    player.on('finishRecord', function()
                    {
                    // the blob object contains the recorded data that
                    // can be downloaded by the user, stored on server etc.
                    console.log('finished recording: ', player.recordedData);
                     // uploadCommentVideo(player.recordedData);
                    saveBlobForTimestamp(player);
                    uploadComplete();
                    });
                    player.on('timestamp', function()
                    {
                        saveBlobForTimestamp(player);
                    });
                
        }
    }
    function setupScreenRecording(){
        
    }
    function setupRecordedRecording(){
        
    }
    function setupCameraVideoRecording(){
        
    }
    function setupCameraAudioRecording(){
        
    }

    var setupRemoteOutStream = function(){
        switch(self.recordingType){
            case "REMOTE_SAVE" : 
            break;
        }
    }
    function uploadStart(){
        if (self.outsocket) {
            self.outsocket.emit('uploadStart', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId});
        }
    }
    function uploadResumed(){
        if (self.outsocket) {
            self.outsocket.emit('uploadResume', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId});
        }
    }
    function uploadBlob(data,timestamp){
        if (self.outsocket) {
            self.outsocket.emit('uploadData', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"timestamp":data.timestamp,"data":data.data,"streamId":self.streamId});
        }
    }
    function uploadComplete(){
        if (self.outsocket) {
            self.outsocket.emit('uploadComplete', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId});
        }
    }
    function requestedMoreData(data){
        var timestamp = data.timestamp;
        if(self.blobs.length){
            var b = self.blobs[0];
            if(timestamp && b.timestamp!=timestamp){
                // alert("something seriously wrong");
            }
            uploadBlob(b);
            self.blobs = self.blobs.splice(0,1);
            self.waitingForBlob=false;
        } else {
            self.waitingForBlob=true;
        }
    }
    function saveBlobForTimestamp(player){
        var recordedData = player.recordedData;
        var allTimestamps = player.allTimestamps;
        var currentTimestamp = player.currentTimestamp;
        if(recordedData.length){
            var blob = recordedData[recordedData.length-1]; 
            var bb = new Blob([blob], {type: 'video/mp4'});
            var item = {"data":bb,"timestamp":currentTimestamp};
            self.blobs.push(item);
            self.blobs = self.blobs.sort(function(a,b){
                return (a['timestamp']-b['timestamp']);
            });
            if(self.waitingForBlob){
                requestedMoreData(self.blobs[0]);
            }    
        }
        
    }

}
function captureScreen(cb) {
        getScreenId(function (error, sourceId, screen_constraints) {
            navigator.getUserMedia(screen_constraints, cb, function (error) {
              console.error('getScreenId error', error);
              alert('Failed to capture your screen. Please check Chrome console logs for further information.');
            });
        });
    }
function captureAudioVideo(cb) {
    navigator.getUserMedia({audio: true, video: true}, cb, function (error) {});
}

function captureAudio(cb) {
    navigator.getUserMedia({audio: true, video: false}, cb, function (error) {});
}
function captureVideo(cb) {
    navigator.getUserMedia({audio: false, video: true}, cb, function (error) {});
}
function captureAudioVideoFromElement(elementId,loop,callback){
    var video1 = document.getElementById(elementId);
    video1.onplay = function() {
      // Set the source of one <video> element to be a stream from another.
      var stream = video1.captureStream();
      cb(stream);
    };
    if (typeof video1.loop == 'boolean' || loop)
      {
          video1.loop = true;
      }
      else
      {
          video1.addEventListener('ended', function() {
              this.currentTime = 0;
              this.play();
          }, false);
      }
      video1.play();
}

var config = {
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://webrtcweb.com:9559/',
            defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');

        var channel = config.channel || defaultChannel;
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        socket.on('connect', function () {
            if (config.callback) config.callback(socket);
        });

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRemoteStream: function (media) {
        var video = media.video;
        video.setAttribute('controls', true);
        video.setAttribute('id', media.stream.id);
        videosContainer.insertBefore(video, videosContainer.firstChild);
        video.play();
    },
    onRemoteStreamEnded: function (stream) {
        var video = document.getElementById(stream.id);
        if (video) video.parentNode.removeChild(video);
    },
    onRoomFound: function (room) {
        var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
        if (alreadyExist) return;

        var tr = document.createElement('tr');
        tr.innerHTML = '<td><strong>' + room.roomName + '</strong> shared a conferencing room with you!</td>' +
            '<td><button class="join">Join</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);

        var joinRoomButton = tr.querySelector('.join');
        joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
        joinRoomButton.setAttribute('data-roomToken', room.broadcaster);
        joinRoomButton.onclick = function () {
            this.disabled = true;

            var broadcaster = this.getAttribute('data-broadcaster');
            var roomToken = this.getAttribute('data-roomToken');
            captureUserMedia(function () {
                conferenceUI.joinRoom({
                    roomToken: roomToken,
                    joinUser: broadcaster
                });
            });
        };
    }
};

var conferenceUI = conference(config);
var videosContainer = document.getElementById('videos-container') || document.body;
var roomsList = document.getElementById('rooms-list');

document.getElementById('setup-new-room').onclick = function () {
    this.disabled = true;
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: 'Anonymous'
        });
    });
};

function captureUserMedia(callback) {
    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);
    videosContainer.insertBefore(video, videosContainer.firstChild);

    getUserMedia({
        video: video,
        onsuccess: function (stream) {
            config.attachStream = stream;
            video.setAttribute('muted', true);
            callback();
        }
    });
}