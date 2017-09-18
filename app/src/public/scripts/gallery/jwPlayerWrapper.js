(function() {
    function jwPlayer(options) {
        var playerObject = {};
        playerObject.selector = options.divId;
        playerObject.file = options.file;
        playerObject.image = options.image;
        playerObject.title = options.title?options.title:"Video";
        playerObject.width = options.width?options.width:'100%';
        playerObject.aspectRatio = options.aspectRatio?options.aspectRatio:'16:9';
        doSetup();
        function doSetup() {
            jwplayer(playerObject.selector).setup(playerObject);
        }

    }

    jwPlayer.initJwPlayer = function(options) {
        new jwPlayer({'divId':options.divId,'file':options.fileName,'image':options.image,'title':options.title,'width':options.width,'aspectRatio':options.aspectRatio});
    }

    Proptiger.jwPlayer = jwPlayer;
})();
