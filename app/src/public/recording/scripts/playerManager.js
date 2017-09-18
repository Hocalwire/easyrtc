var socket;
var $content = $("#content");
var partner = $content.data("query-partner");
var domain = $content.data("query-root");
domain = domain.replace("http://","https://");
var blobs = [];
var $page = $("#live-record-page")
var streamName = $page.data("outstream-path");
var fileName = $page.data("outfile-path");
var mediaIds = $page.data("mediaids");
var streamId = $page.data("streamid");
var player = videojs("myVideo",
    {
            controls: true,
            width:375,
            height: 225,
            timeSlice :5,
            plugins: {
                record: {
                    audio: true,
                    video: true,
                    timeSlice: 5000,
                    maxLength: 600,
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
    function requestedMoreData(data){
        var timestamp = data.timestamp;
        if(blobs.length){
            var b = blobs[0];
            if(timestamp && b.timestamp!=timestamp){
                // alert("something seriously wrong");
            }
            uploadBlob(b);
            blobs = blobs.splice(0,1);
            waitingForBlob=false;
        } else {
            waitingForBlob=true;
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
            blobs.push(item);
            blobs = blobs.sort(function(a,b){
                return (a['timestamp']-b['timestamp']);
            });
            if(waitingForBlob){
                requestedMoreData(blobs[0]);
            }    
        }
        
    }