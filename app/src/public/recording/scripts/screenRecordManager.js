
var socket;
var $content = $("#content");
var partner = $content.data("query-partner");
var domain = $content.data("query-root");
domain = domain.replace("http://","https://");
var blobs = [];
var $page = $("#live-record-page")
var streamName = $page.data("outstream-path") || "outstream.mp4";
var fileName = $page.data("outfile-path") || "output.mp4";
var mediaIds = $page.data("mediaids") || "hello.mp4";
var streamId = $page.data("streamid") || "12345";
var player = {};

function captureScreen(cb) {
    getScreenId(function (error, sourceId, screen_constraints) {
        navigator.getUserMedia(screen_constraints, cb, function (error) {
          console.error('getScreenId error', error);
          alert('Failed to capture your screen. Please check Chrome console logs for further information.');
        });
    });
}
function captureCamera(cb) {
    navigator.getUserMedia({audio: true, video: true}, cb, function (error) {});
}

$("#capture").on("click",function(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        captureScreen(function(screen) {
            captureCamera(function(camera) {
          
                window.recorder = RecordRTC([screen, camera], {

                    mimeType: 'video/webm\;codecs=h264',
                    timeSlice : 2000,
                    type : "video",
                    onTimeStamp : function(a,b){
                        player.allTimestamps = b;
                        player.currentTimestamp = a;

                        var internal = window.recorder.getInternalRecorder().mediaRecorder;
                        var blobs = internal.getArrayOfBlobs();
                        player.recordedData = internal.getArrayOfBlobs();
                        if(player.recordedData) {
                                saveBlobForTimestamp(player);
                        }
                     },
                    previewStream: function(s) {
                        $("#preview-video")[0].muted = true;
                        $("#preview-video")[0].src = URL.createObjectURL(s);
                    }
                });
                window.recorder.startRecording();
                uploadStart();

              
            });
        });
});

    socket = io.connect(domain);
    var waitingForBlob=false;
    if(socket){
        socket.on('moreData', requestedMoreData);

    }
    
    function uploadStart(){
        if (socket) {
            socket.emit('uploadStart', {"name":fileName,"streamName":streamName,"streamId":streamId});
        }
    }
    function uploadResumed(){
        if (socket) {
            socket.emit('uploadResume', {"name":fileName,"streamName":streamName,"streamId":streamId});
        }
    }
    function uploadBlob(data,timestamp){
        if (socket) {
            socket.emit('uploadData', {"name":fileName,"streamName":streamName,"timestamp":data.timestamp,"data":data.data,"streamId":streamId});
        }
    }
    function uploadComplete(){
        if (socket) {
            socket.emit('uploadComplete', {"name":fileName,"streamName":streamName,"streamId":streamId});
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


