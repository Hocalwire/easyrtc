'use strict';
 (function() {
    var notifcationTimeoutId = "";
    var notifcationTimeoutDuration = (30*1000);
    var notiEnabled = false;
    var initalized=window.showNotifications ? false : true;
    window.enableNotifications = function(){
        if(initalized){
              return;
        }
        checkForNotificationPermission();
    }
    function checkForNotificationPermission(){
        if(Notification && Notification.requestPermission){
            try {
                Notification.requestPermission().then(function(result) {
                  if(result && result=="granted"){
                    checkForNotification();  
                  }
                },function(e){
                    
                });
            }catch(e){

            }
        }
    }
    function showNotifications(noti){
        
        var notification = new Notification(noti.pname, {
          icon: noti.mediaUrl,
          body: noti.title,
        });

        notification.onclick = function () {
          window.open(noti.url,"_blank");
        };

        
    }
    function checkForNotification(){
            var url = "/xhr/admin/getNotification"; // the script where you handle the form input.
            
            Hocalwire.Services.get(url).then(
                function(data){
                    if(data.errorCode == 0) {
                        var noti = JSON.parse(data.noti);
                        showNotifications(noti);
                    } 
                    if(notifcationTimeoutId){
                        clearTimeout(notifcationTimeoutId);
                    }
                    notifcationTimeoutId = setTimeout(checkForNotification,notifcationTimeoutDuration);
                },

                function(e) {
                    if(notifcationTimeoutId){
                        clearTimeout(notifcationTimeoutId);
                    }
                    notifcationTimeoutId = setTimeout(checkForNotification,notifcationTimeoutDuration);
                }
            );
            
    }
})();