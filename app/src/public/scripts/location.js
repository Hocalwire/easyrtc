(function() {
    var initalized=false;
    var isPushEnabled = false;
    var partner;
    if(!window.Nofication){
        window.Nofication = {};
    }
    window.initialiseScriptsBinding = function() {
        if (initalized) {
            return;
        }
        var partner = $("body").attr("data-partner");
        var domain = $("body").attr("data-domain");
        window.ga('common.send', 'event', "location", "opened", partner);  
        var pushButton = document.querySelector('.js-push-button');
        pushButton.addEventListener('click', function() {
            window.ga('common.send', 'event', partner+"-location", "clicked", "btn");
            fetchLocation();
        });
        var noThanksBtn = document.querySelector('.js-no-thanks');
        noThanksBtn.addEventListener('click', function() {
            window.ga('common.send', 'event', partner+"-location", "clicked", "no-btn");
            window.location = domain+"/user/set-my-location?lat=0&lng=0";
        });
        
        var fetchLocation = function(){
          var success = function(d){
              var lat = d.latitude;
              var lng = d.longitude;
              setTimeout(function(){
                window.location = domain+"/user/set-my-location?lat="+lat+"&lng="+lng;
              },1000);  
          }
          
          var fail = function(d){
              $("#error-box").show();
          }
          Utils.getMyLocation({"success":success,"error":fail});
        }
        fetchLocation();

    }
})();
