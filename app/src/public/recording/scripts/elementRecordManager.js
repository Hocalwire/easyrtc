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

var elementToShare = document.getElementById('toCaptureWrapper');
var canvas2d = document.getElementById('toCaptureCanvas');
var context = canvas2d.getContext('2d');
canvas2d.width = elementToShare.clientWidth;
canvas2d.height = elementToShare.clientHeight;
canvas2d.style.top = 0;
canvas2d.style.left = 0;
canvas2d.style.zIndex = -1;
var myAudio;
(document.body || document.documentElement).appendChild(canvas2d);
var isRecordingStarted = false;
var isStoppedRecording = false;
(function looper() {
    if(!isRecordingStarted) {
        return setTimeout(looper, 500);
    }
    html2canvas(elementToShare, {
        grabMouse: false,
        onrendered: function(canvas) {
            context.clearRect(0, 0, canvas2d.width, canvas2d.height);
            context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);
            if(isStoppedRecording) {
                return;
            }
            setTimeout(looper, 1);
        }
    });
})();
window.recorder = new RecordRTC(canvas2d, {
        type: 'canvas',
        timeSlice : 2000,
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
$('#top_carousel').lightSlider({
            gallery:true,
            item:1,
            thumbItem:5,
            slideMargin: 0,
            speed:500,
            auto:true,
            loop:true,
            onSliderLoad: function() {
                $('.image-slider-gallery').removeClass('cS-hidden');
            }  
        });
function playBulletin(callback){
    
    uploadStart();
    callback();
}
function playBackground(callback){
    myAudio = new Audio('/recording/data/bulletin-music.mp3'); 
    if (typeof myAudio.loop == 'boolean')
    {
        myAudio.loop = true;
    }
    else
    {
        myAudio.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        }, false);
    }
    myAudio.play();
    callback();
}
function startRecording(){
    isStoppedRecording = false;
    isRecordingStarted = true;
    playBulletin(function() {
        playBackground(function(){
            window.recorder.startRecording();
        });
        
    });
}
function querySelectorAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
}
document.getElementById('start').onclick = function() {
    startRecording();
};
document.getElementById('stop').onclick = function() {
    
    isStoppedRecording = true;
    window.recorder.stopRecording(function() {
        uploadComplete();

    });
};
window.onbeforeunload = function() {
    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
};
