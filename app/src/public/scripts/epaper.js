'use strict';
(function() {
    var $el = $("body");
    var dateSelected;
    var epaperRoot = $el.attr("epaper-root") || $("#epaper-filter-data").attr("epaper-root") || "/epaper";
    bindEvents();
    function bindEvents(){
        var dateSelector = $el.find('#epaper-datepicker');
        for(var i=0;i<dateSelector.length;i++){
            var element =  dateSelector[i];
            var maxDateS = new Date();
            var picker = new Pikaday({
                field: element,
                format: 'D MMM YYYY',
                maxDate : maxDateS,
                onSelect: function(d) {
                    dateSelected = Utils.getStringFromDateHiphen(d,true);
                    
                }
            });    
        }
        var $apply = $el.find(".js-apply-epaper-button");
        $apply.on("click",function(){
            // var date = dateSelector.val();
            var location = $("#epaper-location").val();
            var date = dateSelected || $('#epaper-publish-date').val();
            selectEpaper(date,location);
        });
        
    };
    function selectEpaper(dateValue,locationVal){
        if(!epaperRoot) {
            epaperRoot  ="/epaper";
        }
        if(locationVal){
            epaperRoot = epaperRoot+"/"+locationVal;
        }
        if(dateValue){
            epaperRoot = epaperRoot+"/"+dateValue;
        }
        window.location=epaperRoot;
    }
    

})();