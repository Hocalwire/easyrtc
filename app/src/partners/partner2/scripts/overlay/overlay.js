(function() {
    "use strict";

    var section;
    var position; // to store the position of main element which remains clickable after the overlay
    var zIndex; // to store the z-index of main element which remains clickable after the overlay
    var sectionZIndex = []; // to store the z-indexes of all the elements whom we want clickable even after overlay
    var sectionPositions = []; // to store the positions of all the elements whom we want clickable even after overlay
    var otherSections=[]; // to store elements whom we want clickable even after overlay

    /*
        Function Arguements

            callback : function to be executed at closing of overlay
            overlayColor : color of the overlay
            section: main element which remains clickable after the overlay
            otherSections: other elements whom we want clickable even after overlay

        Function Definition

            On calling this function, an overlay div is added just above the div whom we want to make clicable even after the overlay.


    */

    function showOverlay (options) {
        var callback = options.callback,
        overlayColor = options.overlayColor? options.overlayColor:'rgba(0,0,0,0.6)',
        zIndexOverlay = 899,
        zIndexSection = 999;
        section = options.section;
        otherSections = options.otherSections ? options.otherSections : [];
        $('body').css({'overflow':'hidden'});
        if($('.pt-common-overlay').length <= 0){
            $('<div class="pt-common-overlay" style="width:100%;height:100%;top:0;bottom:0;right:0;left:0;"></div>').insertBefore( $( section ) );
        }
        $('.pt-common-overlay').css({'z-index': zIndexOverlay,'position':'fixed', 'background-color': overlayColor, 'display':'block'});
        position = $(section).css('position');
        zIndex = $(section).css('z-index');
        $(section).css({'z-index': zIndexSection, 'position' : position=='static'?'relative':position});
        if(otherSections.length) {
            for(var i=0;i<otherSections.length;i++) {
                sectionPositions[i] = $(otherSections[i]).css('position');
                sectionZIndex[i] = $(otherSections[i]).css('z-index');

                $(otherSections[i]).css({'z-index': zIndexSection, 'position' :sectionPositions[i]=='static'?'relative':sectionPositions[i]});
            }
        }
        $(document).on('click', '.pt-common-overlay', function(){
            hideOverlay(callback);
        });
    }


    /*
        Function Arguements

            callback : function to be executed at closing of overlay

        Function Definition

            On calling this function, overlay is removed.


    */

    function hideOverlay(callback){
        if($('.pt-common-overlay').length){
            setTimeout(function(){
                $('.pt-common-overlay').css({'z-index': '','position':'', 'display':'none'});
                $(section).css({'z-index': zIndex, 'position' : position});
                if(otherSections.length) {
                    for(var i=0;i<otherSections.length;i++) {
                        $(otherSections[i]).css({'z-index': sectionZIndex[i], 'position' : sectionPositions[i]});
                    }
                }
                $('.pt-common-overlay').remove();
                $('body').attr('style','');
                if(typeof callback === 'function'){
                    callback();
                }
            }, 0);
        }
    }
    function hideOverlayOnAjax(callback){
        $('body').attr('style','');
    }

    $.showOverlay = showOverlay;
    $.hideOverlay = hideOverlay;
    $.hideOverlayOnAjax = hideOverlayOnAjax;
})();

