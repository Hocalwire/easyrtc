
(function() {
    "use strict";

    var AnalyticsService = {

        // Function to send GA event request
        sendGAEvent: function (category, action, label, value, non_int) {

            label = category + '-' + label +'-'+ Hocalwire.PageLoader.getCurrentActivePage();
            label = label.toUpperCase();

            if(value !== undefined) {
                if(non_int !== undefined) {
                    window.ga('send', 'event', category, action, label, value, {'nonInteraction': non_int});
                } else {
                    window.ga('send', 'event', category, action, label, value, {'nonInteraction': 1});
                }
            } else {
                window.ga('send', 'event', category, action, label);
            }
        },

       

        //capitalize the first character of a string
        capitaliseFirstLetter: function ( str ) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    };

    Hocalwire.Services.AnalyticsService = AnalyticsService;

})();
