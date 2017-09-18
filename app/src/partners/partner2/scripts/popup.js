
(function() {
    "use strict";

    
    var isSelfStateAltered = false;
    var hashChange = false;

    /**
     * stores callback for current popup hide event
     * @type {Function}
     */
    var callbackAfterPopupChange;
    var callbackAfterHashChange;

    /**
     * Mantains a stack of currently opened popup selectors
     * @type {Array}
     */
    var popupStack = [];
    var hashStack = [];

    var pageSelector = '[data-role="page"]';
    var footerSelector = '#js-footer';
    var popupCommonSelector = '[data-role="popup"]';
    var pageHideClassName = "";

    /**
     * returns the top element in the stack
     * @return {String} top popup selector
     */
    popupStack.top = function() {
        if (this.length) {
            return this[this.length - 1];
        }
    };

    hashStack.top = function() {
        if (this.length) {
            return this[this.length - 1]['hash'];
        }
    };

    /**
     * Clear the stack
     */
    popupStack.empty = function() {
        this.length = 0;
    };

    hashStack.empty = function() {
        this.length = 0;
    };

    /**
     * Opens popup above the page/popup
     * @param  {String}   popupSelector Class or ID of popup selector
     * @param  {Function} callback      Function to be called after popup opens
     */
    $.openPopup = function(popupSelector, callback,ignoreHideTopPopup) {
        var hashFinal;
        var previousHash = History.getHash();

        var hashJoin = previousHash ? '&' : '';
        if(window.location.href.indexOf("?")>-1 && hashJoin.indexOf("&")<0){
            hashJoin = "&"+hashJoin;
        }
        var $popup = $(popupSelector + popupCommonSelector);

        if (!$popup.length || popupStack.top() === popupSelector) { return; }

        hashFinal = previousHash + hashJoin + Utils.toCamelCase(popupSelector.replace(/#|\.|\s/g, ''));
        isSelfStateAltered = true;
        window.location.hash = hashFinal;

        $popup.removeClass('hide');
        setTimeout(function() { $popup.scrollTop(0); }, 0); // move popup to top

        if (!popupStack.top()) {
            $(pageSelector).addClass(pageHideClassName);

            $(footerSelector).addClass(pageHideClassName);
            $("#popup-container").removeClass("hide");
        } else {
            if(!ignoreHideTopPopup){
                $(popupStack.top() + popupCommonSelector).addClass('hide');
            }
        }

        showPopupContainer(popupSelector);

        // dispatch popupopen event
        EventsManager.dispatchEvent(EventsManager.events.POPUP_CHANGE, {selector: popupSelector});

        popupStack.push(popupSelector);

        if (typeof callback === "function") { callback(); }
    };

    /**
     * Hides the currently opened popup and shows the last popup opened or
     * the page
     * @return {Boolean} returns true if there were any popup to hide otherwise false
     */
    $.hidePopup = function(callback) {
        callbackAfterPopupChange = callback;

        if (popupStack.top()) {
            hidePopup();
            isSelfStateAltered = true;

            // remove hash from url (simply go back in history)
            History.back();

            return true;
        }

        return false;
    };

    // hash-change binding on DOM Ready event
    $(function() {
        $(window)
            .on('hashchange', hashChangeHandler)
            .on('statechange', closeAllPopups);

        init();
    });

    function hashChangeHandler (e) {
        // ignore if changed by this popup library
        var newLength;
        var oldLength;
        if(e.newURL && e.oldURL){
            newLength = e.newURL.length;
            oldLength = e.oldURL.length;
            if(newLength < oldLength){
                hashChanged(e.oldURL);
            } else {
                hashChanged(e.newURL);
            }
        } else if (e.originalEvent && e.originalEvent.newURL && e.originalEvent.oldURL){
            newLength = e.originalEvent.newURL.length;
            oldLength = e.originalEvent.oldURL.length;
            if(newLength < oldLength){
                hashChanged(e.originalEvent.oldURL);
            } else {
                hashChanged(e.originalEvent.newURL);
            }
        }
    }

    function hashChanged (url) {
        var lastIndexAmp = url.lastIndexOf('&');
        if(lastIndexAmp > -1){
            if (url[lastIndexAmp+1] ==='_'){
                hashChangeOnBrowserBack();
            } else {
                popupChangeOnBrowserBack();
            }
        } else {
            if(url[url.lastIndexOf('#')+1] === '_'){
                hashChangeOnBrowserBack();
            } else {
                popupChangeOnBrowserBack();
            }
        }
    }

    function popupChangeOnBrowserBack() {
        // ignore if changed by this popup library
        if (isSelfStateAltered) {
            isSelfStateAltered = false;

            if (typeof callbackAfterPopupChange === "function") {
                callbackAfterPopupChange();
                callbackAfterPopupChange = null;
            }

            return;
        }

        hidePopup();
    }

    function hashChangeOnBrowserBack() {
        // ignore if changed by this popup library
        if (hashChange) {
            hashChange = false;

            if (typeof callbackAfterHashChange === "function") {
                callbackAfterHashChange();
                callbackAfterHashChange = null;
            }

            return;
        }

        hideHash();
    }

    /**
     * Hides currently opened popup if any
     */
    function hidePopup() {
        var currentPopupSelector = popupStack.pop();
        $(currentPopupSelector + popupCommonSelector).addClass('hide');
        
        if (popupStack.top()) {
            var newPopupSelector = popupStack.top() + popupCommonSelector;
            $(newPopupSelector).removeClass('hide');
            showPopupContainer(newPopupSelector);

            // dispatch event
            EventsManager.dispatchEvent(EventsManager.events.POPUP_CHANGE, {selector: popupStack.top()});
        } else {
            $(pageSelector).eq(0).removeClass("hide").removeClass("hidden-xs");

            $(footerSelector).eq(0).removeClass("hide").removeClass("hidden-xs");
            $("#popup-container").addClass("hide");

            // dispatch event
            EventsManager.dispatchEvent(EventsManager.events.POPUP_CHANGE);
        }
        EventsManager.dispatchEvent(EventsManager.events.POPUP_HIDE, {selector: currentPopupSelector});
    }

    function closeAllPopups() {
        var popupSelector;
        while (popupSelector = popupStack.pop()) {  // jshint ignore:line
            $(popupSelector + popupCommonSelector).addClass('hide');
        }

        $("#popup-container").addClass("hide");
    }

    function showPopupContainer(popupSelector) {
        // hide page-popup container if popup belongs to common-popup container
        if ($('#common-popup-container').find(popupSelector).length) {
            $('#page-popup-container').addClass('hide');
            $('#common-popup-container').removeClass('hide');
        } else {
            $('#page-popup-container').removeClass('hide');
            $('#common-popup-container').addClass('hide');
        }
    }

    /**
     * add hash and remove hash functions
     */
    $.addHash = function(hashString, callbackForBrowserBack,callback) {
        var hashFinal;
        var previousHash = History.getHash();
        var lastHashIndex = previousHash.lastIndexOf("&") + 1;
        var hashJoin = previousHash ? '&' : '';
        hashString = '_' + hashString;

        var o = {'hash':hashString,'callback':callbackForBrowserBack};

        if(previousHash === hashString|| previousHash.substring(lastHashIndex,previousHash.length) === hashString){
            return;
        }

        hashFinal = previousHash + hashJoin + Utils.toCamelCase(hashString.replace(/#|\.|\s/g, ''));
        hashChange = true;
        window.location.hash = hashFinal;

        EventsManager.dispatchEvent(EventsManager.events.HASH_CHANGE, {hash: hashString});

        hashStack.push(o);

        if (typeof callback === "function") { callback(); }
    };

    $.removeHash = function(callback) {
        callbackAfterHashChange = callback;

        if (hashStack.top()) {
            hideHash();
            hashChange = true;

            // remove hash from url (simply go back in history)
            History.back();

            return true;
        }

        return false;
    };

    function hideHash() {

        var topHash = hashStack.pop();
       
        if(topHash) {
            topHash['callback']();
        }
        if (hashStack.top()) {

            EventsManager.dispatchEvent(EventsManager.events.HASH_CHANGE, {hash: hashStack.top()['hash']});
        } else {
            $(pageSelector).eq(0).removeClass("hide").removeClass("hidden-xs");

            $(footerSelector).eq(0).removeClass("hide").removeClass("hidden-xs");

            EventsManager.dispatchEvent(EventsManager.events.HASH_CHANGE);
        }
        EventsManager.dispatchEvent(EventsManager.events.HASH_HIDE, {selector: topHash ? topHash['hash'] : ''});

    }


    /**
     * initialize listening common events for popups
     */
    function init () {
        $("#popup-container").on("click", ".popup-overlay", function() {
            $.hidePopup();
            return false;
        });

        // close popup on pressing esc key
        $(document).bind('keydown', function(e) {
            if (e.which == 27) {
                $.hidePopup();
            }
        });
    }

    $.closeAllPopups = closeAllPopups;

})();
