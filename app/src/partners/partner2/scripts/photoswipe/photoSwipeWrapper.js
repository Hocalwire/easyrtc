"use strict";
var photoSwipeObject;
var photoSwipeWrapperObject;
function PhotoSwipeWrapper(options) {
    this.options = options;
    this.opt = options.opt ? options.opt : {};
    this.opt.shareEl = false;
    this.opt.loop = false;
    this.opt.isClickableElement = function() {
        return false;
    };
    this.opt.pinchToClose = false;
    this.items = options.items;
    this.photoSwipeProps = {'index':1};
    this.photoSwipeSelector = this.options.photoSwipeSelector? this.options.photoSwipeSelector:".pswp";
    this.closeCallback = options.closeCallback ? options.closeCallback : null;
    this.thumbSelector = options.thumbSelector ? options.thumbSelector : '';
    initPhotoSwipe(this); //initialize photo-swipe
    function initPhotoSwipe(refObj){
        var $elem = $(refObj.photoSwipeSelector)[0];
        photoSwipeObject = new PhotoSwipe($elem, PhotoSwipeUI_Default, refObj.items, refObj.opt);
        photoSwipeObject.listen('close', function(){
            if(refObj.closeCallback && typeof refObj.closeCallback === 'function'){
                refObj.closeCallback();
            }
        });
        photoSwipeObject.listen('afterChange', function() {
            if(refObj.thumbSelector){
                var $smallE = $(refObj.thumbSelector);
                PhotoSwipeWrapper.lazyLoad10ImagesFromIndex(photoSwipeObject.getCurrentIndex(),this.thumbSelector);
                PhotoSwipeWrapper.highlightBottomPhotoSwipe(photoSwipeObject.getCurrentIndex(),$smallE,"carouselIndicator-");
            }
        });
    }
}

PhotoSwipeWrapper.initPhotoSwipe = function(photoSwipeLargeSelector, items, options, closeCallback) {
    if(!items || !items.length){
        return;
    }
    photoSwipeWrapperObject = new PhotoSwipeWrapper({'photoSwipeSelector':photoSwipeLargeSelector, 'items': items, 'opt': options, 'closeCallback': closeCallback});
    return photoSwipeObject;
};

PhotoSwipeWrapper.initPhotoSwipeWithThumb = function(photoSwipeLargeSelector, items, options, photoSwipeSmallSelector, closeCallback) {
    if(!items || !items.length){
        return;
    }
    photoSwipeWrapperObject = new PhotoSwipeWrapper({'photoSwipeSelector':photoSwipeLargeSelector, 'items': items, 'opt': options, 'closeCallback': closeCallback, 'thumbSelector': photoSwipeSmallSelector});
    if(!photoSwipeSmallSelector) {
        return;
    }
    var $smallE = $(photoSwipeSmallSelector);
    PhotoSwipeWrapper.lazyLoad10ImagesFromIndex(0,photoSwipeSmallSelector);
    PhotoSwipeWrapper.highlightBottomPhotoSwipe(0,$smallE,"carouselIndicator-");
    PhotoSwipeWrapper.addThumbHorizonListener(photoSwipeSmallSelector);
    return photoSwipeObject;
};

PhotoSwipeWrapper.addThumbHorizonListener = function(selector){
    var $e =$(selector);
    var lastPos = 0;
    $e.on('scroll', function(){
        var curr = $e.scrollLeft();
        var index = curr/80;
        if(curr - lastPos > 80 || lastPos-curr < 80) { //scrolling right
            PhotoSwipeWrapper.lazyLoad10ImagesFromIndex(parseInt(index),selector);
        }
        lastPos=curr;
    });
};

PhotoSwipeWrapper.lazyLoad10ImagesFromIndex = function(index,selector) {
    var negInitIndex = index-7;
    var sIndex;
    var eIndex;
    if(negInitIndex < 0 ){
        sIndex=0;
    }
    else{
        sIndex=negInitIndex;
    }
    eIndex = sIndex+14;
    for(var i=sIndex;i<eIndex;i++){
        Utils.lazyLoadImage(selector+" .carouselIndicator-"+i+" img");
    }
};

PhotoSwipeWrapper.highlightBottomPhotoSwipe = function(index,elem,prefix) {
    var topE = elem;
    var el = topE.find(" ."+prefix+index + " img");
    if(!el.length){
        return;
    }
    var all = topE.find("img");
    all.removeClass("hightlightElement");
    el.addClass("hightlightElement");
    var position = PhotoSwipeWrapper.getScrollPosition(topE,el);
    if(position !== null && position >= 0){
        topE.scrollLeft(position);
    }
};

PhotoSwipeWrapper.getScrollPosition = function(parentE,viewE){
    var docViewLeft = 0;
    var docViewRight = parentE.width();
    var elemLeft = viewE.offset().left;
    var elemRight = elemLeft + viewE.width();
    if((docViewLeft < elemLeft) && (docViewRight > elemRight)){
        return null;
    }else{
        return parentE.scrollLeft() + elemLeft;
    }
};
PhotoSwipeWrapper.trackingWithVideoPlay = function(){
    if(!photoSwipeObject.currItem.videoSource){
        return;
    }
    Hocalwire.Services.AnalyticsService.sendGAEvent(
            'gallery',
            'viewedFull',
            photoSwipeObject.currItem.category + "-" + photoSwipeObject.currItem.title
        );

    setTimeout(function(){
        photoSwipeObject.zoomTo(photoSwipeObject.currItem.initialZoomLevel);
    },200);
    setTimeout(function(){
        if(photoSwipeObject.currItem.category === 'video-walkthrough'){
            PhotoSwipeWrapper.openInJWPlayer(photoSwipeObject.currItem.videoSource);
        }else{
            window.open(photoSwipeObject.currItem.videoSource, '_blank');
        }
    },300);
};
PhotoSwipeWrapper.openInJWPlayer = function(source){
    Utils.loadJWPlayer(function(){
        Utils.playVideo(source, photoSwipeObject.currItem.src);
    });
};
PhotoSwipeWrapper.showPhotoSwipe = function(index) {
    index = index ? parseInt(index) : 0;
    photoSwipeObject.init();
    photoSwipeObject.framework.bind(photoSwipeObject.scrollWrap,'pswpTap',function() {
        if(event.target.tagName && event.target.tagName.toLowerCase() === 'img'){
            PhotoSwipeWrapper.trackingWithVideoPlay();
        }
    });
    photoSwipeObject.listen('imageLoadComplete', function() {
        Hocalwire.Services.AnalyticsService.sendGAEvent(
            'gallery',
            'viewedZoom',
            photoSwipeObject.currItem.category + "-" + photoSwipeObject.currItem.title
        );
    });
    photoSwipeObject.goTo(index);
};
