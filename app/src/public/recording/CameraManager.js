var vgaConstraints = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 360
    }
  },
  audio : true
};

function checkForMedia(){
	
}
function hasGetUserMedia() {
  if (Modernizr.getusermedia){
	  var gUM = Modernizr.prefixed('getUserMedia', navigator);
	 	return gUM;
	  //...
	} else {
		return false;
	}
}

function getAccessToVideo(errorCallback){
	
	  navigator.getUserMedia(vgaConstraints, function(localMediaStream) {
	    var video = $("#user-video")[0];
	    video.src = window.URL.createObjectURL(localMediaStream);

	    // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
	    // See crbug.com/110938.
	    video.onloadedmetadata = function(e) {
	      // Ready to go. Do some stuff.
	    };
	  }, errorCallback);
}