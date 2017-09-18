// Using zepto, that's why assigning $ to jQuery for error fallback
window.jQuery = $;


window.Hocalwire = {
    Services: {}
};

function showLoading() {
    "use strict";
    $('.ui-loader-new').addClass("show");
}

function hideLoading() {
    "use strict";
    // return;
    $('.ui-loader-new').removeClass("show");
    $('.ui-loader').removeClass("show");
}

function showError(text) {
    "use strict";
    $('.ui-loader h4').text(text);
    $('.ui-loader').addClass('ui-loader-verbose ui-loader-textonly show');
}

function showAjaxLoadingError() {
    "use strict";
    showError('Error Loading Page');

    setTimeout(function() {
        hideLoading();
    }, 800);
}
function scrollToTop(){
    if($("body").scrollTop){
        $("body").scrollTop(0);
    }
    if(window.scroll){
        window.scroll(0,0);
    }
    if(document.documentElement && document.documentElement.scrollTop){
        document.documentElement.scrollTop = 0;
    }

}

var logger = {
    log: function() {
        "use strict";
        if (console) {
            return console.log.apply(console, arguments);
        }
    },

    error: function() {
        "use strict";
        if (console) {
            return console.error.apply(console, arguments);
        }
    }
};
