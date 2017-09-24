function Record(){
    var initOptions = {};
    var self = this;
    var socket=null;
    this.blobs = [];
    self.defaults = {
        outputFileName:"out.mp4",
        streamId : "DEFALUT_STREAM_"+new Date().getTime(),
        saveType : "REMOTE_SAVE",//REMOTE_EMIT,LOCAL_EMIT,SAVE_EMIT
        timeSlice : 500, //500 millisecond blobs,
        hlsPath : "",//out.m3u8
        width : 500,
        height: 500,
        partner:"allytech"
    }
    this.waitingForBlob=false;
    this.recorder;
    if(window.screen.width < 768){
        self.defaults.width = 300;
        self.defaults.height=300;
    }
    this.init = function(options){
        self.socket = options.socket;
        // socketConnect(options.socketServer || self.defaults['socketDomain'],options.signalServer || self.defaults['signalDomain'])
        setup(options);
    }
    var setup = function(options,callback){
        self.saveType = options.saveType || self.defaults.saveType;
        self.options = options;
        self.partner = options.partner || self.defaults.partner;
        self.outputFileName = self.options.outputFileName || self.defaults.outputFileName;
        self.originalOutputFileName = self.options.originalOutputFileName || "original_"+self.outputFileName;
        self.streamId = self.options.streamId || self.defaults.streamId;
        self.socket.on('moreData', requestedMoreData);
        self.fileRoot = "src/public/data/"+self.partner+"/";
        self.accessToken = "";
        self.postId="";
        setupRecording(callback);
    } 
    
    function getParameterByName(name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, '\\$&');
      var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    var setupRecording = function(callback){
        startRecordingNow(1);
    }

    function startRecordingNow(startInDuration){
      var count = startInDuration || 5;
      var intervalId = setInterval(function(){
        $("#stopRecording").html("starting in "+count+" seconds");
        count--;
        if(count<=0){
          startRecording();
          if(intervalId){
            clearInterval(intervalId);
          }
        }
      },1000);
    }
    function startRecording() {
        uploadStart();
        window.globalRecordingDimension = {"w":(self.options.width || self.defaults.width),"h":(self.options.height || self.defaults.height),"audioOnly":(self.options.audioOnly || false)};
        self.recorder = RecordRTC([self.options.initStream], {
            mimeType: 'video/webm\;codecs=h264',
            timeSlice : self.options.timeSlice || self.defaults.timeSlice,
            type : "video",
            onTimeStamp : function(a,b){
                var player = {};
                player.allTimestamps = b;
                player.currentTimestamp = a;
                var internal = self.recorder.getInternalRecorder().mediaRecorder;
                var blobs = internal.getArrayOfBlobs();
                player.recordedData = internal.getArrayOfBlobs();
                if(player.recordedData) {
                    saveBlobForTimestamp(player);
                }
                if(self.endTriggered){
                  var cTimeStamp = e.currentTimestamp;
                    if(cTimeStamp>endTriggeredTimeStamp){
                        if(self.recorder){
                          self.recorder.stopRecording();
                        }
                        var timeoutId = setInterval(function(){
                            if(!self.blobs.length) {
                                //all blobs transmitted, saved, you can close it now
                                uploadComplete();
                                setTimeout(function(){
                                    if(self.options.onRecordComplete){
                                        self.options.onRecordComplete();
                                    }
                                },1000);
                                clearInterval(timeoutId);
                            }
                        },1000);
                    }
                }
              

             },
            previewStream: function(s) {
                if(self.options.previewElementId){
                    $("#"+self.options.previewElementId)[0].muted = true;
                    $("#"+self.options.previewElementId)[0].src = URL.createObjectURL(s);    
                }
                
            }
        });
        
    }
    function endRecording() {
      self.endTriggered=true;
    }
    function uploadStart(){
            if (self.socket) {
                self.socket.emit('uploadStart', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId,"accessToken":self.accessToken,"partner":self.partner,"title":"","postId":"","fileRoot":"src/public/data/"+partner+"/"});
            }
        }
        function uploadResumed(){
            if (self.socket) {
                self.socket.emit('uploadResume', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId,"accessToken":self.accessToken,"partner":self.partner,"title":"","postId":"","fileRoot":"src/public/data/"+partner+"/"});
            }
        }
        function uploadBlob(data,timestamp){
            if (self.socket) {
                self.socket.emit('uploadData', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"timestamp":data.timestamp,"data":data.data,"streamId":self.streamId,"fileRoot":"src/public/data/"+partner+"/"});
            }
        }
        function uploadComplete(){
            if (self.socket) {
                self.socket.emit('uploadComplete', {"name":self.outputFileName,"streamName":self.originalOutputFileName,"streamId":self.streamId,"accessToken":self.accessToken,"partner":self.partner,"title":"","postId":"","fileRoot":"src/public/data/"+partner+"/"});
            }
        }
        var isSaving=false;
        function requestedMoreData(data){
            var timestamp = data.timestamp;
            if(blobs.length){
                if(isSaving){
                    setTimeout(function(){
                        var b = blobs.shift();
                        uploadBlob(b);
                        waitingForBlob=false;
                    },100);
                } else {
                    var b = blobs.shift();
                    uploadBlob(b);
                    waitingForBlob=false;
                }
                
            } else {
                waitingForBlob=true;
            }
        }

        function saveBlobForTimestamp(player){
            isSaving=true;
            var recordedData = player.recordedData;
            var allTimestamps = player.allTimestamps;
            var currentTimestamp = player.currentTimestamp;
            if(recordedData.length){
                var blob = recordedData[recordedData.length-1]; 
                var bb = new Blob([blob], {type: 'video/mp4'});
                var item = {"data":bb,"timestamp":currentTimestamp};
                blobs.push(item);
                blobs = blobs.sort(function(a,b){
                    return (a['timestamp']-b['timestamp']);
                });
                isSaving=false;
                if(waitingForBlob){
                    requestedMoreData(blobs[0]);
                }    
            } else {
                isSaving=false;
            }
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
};

