 (function() {
	if($(".flowplayer-widget").flowplayer) {
		$(".flowplayer-widget").flowplayer();
	} else {
		setTimeout(function(){
			$(".flowplayer-widget").flowplayer();
		},5000);
	}
})();
 