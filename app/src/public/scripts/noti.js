(function() {
    var initalized=false;
    var isPushEnabled = false;
    var partner;
    var domain;
    if(!window.Nofication){
        window.Nofication = {};
    }
    window.initialiseScriptsBinding = function() {
        if (initalized) {
            return;
        }
        partner = $("body").attr("data-partner");
        domain = $("body").attr("data-domain");
        function getOs(){
            var e = navigator.userAgent,
            t = void 0,
            n = e.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            return /trident/i.test(n[1]) ? (t = /\brv[ :]+(\d+)/g.exec(e) || [], "IE " + (t[1] || "")) : "Chrome" === n[1] && (t = e.match(/\bOPR\/(\d+)/), null != t) ? "Opera " + t[1] : (n = n[2] ? [n[1], n[2]] : [navigator.appName, navigator.appVersion, "-?"], t = e.match(/version\/([.\d]+)/i), null != t && n.splice(1, 1, t[1]), n.join(" "))
        }
        function getDevice(){
          var e = navigator.userAgent;
          return e.match(/Android/i) || e.match(/webOS/i) || e.match(/iPhone/i) || e.match(/iPad/i) || e.match(/iPod/i) || e.match(/BlackBerry/i) || e.match(/Windows Phone/i) ? "Phone" : "PC"
        }
        function init(){
            
            var pushButton = document.querySelector('.js-push-button');
            pushButton.addEventListener('click', function() {
                if (isPushEnabled) {
                  window.Nofication.unsubscribe();
                } else {
                  window.Nofication.subscribe();
                }
            });


            
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/partner-services/enable-notification/'+partner+"/service-worker.js")
                .then(window.Nofication.initialiseState);
            } else {
                console.log('Service workers aren\'t supported in this browser.');
            }
        }


        function sendSubscriptionToServer(subscription,isRemove) {
          if(!subscription || !subscription.endpoint){
            return;
          }
          var endpointSections = subscription.endpoint.split('/');
          var subscriptionId = endpointSections[endpointSections.length - 1];

          var data = {"id":subscriptionId,"partner":partner,"remove":(isRemove || false)};
          if(window.navigator && window.navigator.userAgent){
              data["user agent"] = window.navigator.userAgent;
          }
          var success = function(){
              console.log("subscribed to notification");
          }
          var fail = function(){
            console.log("subscribed to notificatiion failed");
          }
          window.ga('common.send', 'event', partner+"-noti", "sent-to-server", "data---"+subscriptionId);    
          Hocalwire.Services.post("/xhr/admin/send-desktop-notification-data",data)
              .then(function() {
                  success();
              },
              function() { 
                  fail();
              }
          );
        }



        window.Nofication.unsubscribe =function() {
          var pushButton = document.querySelector('.js-push-button');
          pushButton.disabled = true;
         
          navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.getSubscription().then(
              function(pushSubscription) {
                // Check we have a subscription to unsubscribe
                if (!pushSubscription) {
                  // No subscription object, so set the state
                  // to allow the user to subscribe to push
                  isPushEnabled = false;
                  pushButton.disabled = false;
                  pushButton.textContent = 'Enable';
                  return;
                }

                sendSubscriptionToServer(pushSubscription,true);
                pushSubscription.unsubscribe().then(function() {
                  pushButton.disabled = false;
                  pushButton.textContent = 'Enable';
                  window.ga('common.send', 'event', partner+"-noti", "unsubscribed", "partner");
                  isPushEnabled = false;
                }).catch(function(e) {
                  sendSubscriptionToServer(pushSubscription,true);
                  console.log('Unsubscription error: ', e);
                  pushButton.disabled = false;
                });
              }).catch(function(e) {
                console.log('Error thrown while unsubscribing from ' +
                  'push messaging.', e);

              });
          });
        }

        window.Nofication.subscribe = function() {
          // Disable the button so it can't be changed while
          // we process the permission request
          var pushButton = document.querySelector('.js-push-button');
          pushButton.disabled = true;

          navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
              .then(function(subscription) {
                // The subscription was successful
                isPushEnabled = true;
                pushButton.textContent = 'Disable';
                pushButton.disabled = false;
                var fetchLocation = function(){
                    var success = function(d){
                        var lat = d.latitude;
                        var lng = d.longitude;
                        window.location = domain+"/user/set-my-location?lat="+lat+"&lng="+lng;
                    }
                    
                    var fail = function(d){
                        window.location = domain;
                    }
                    Utils.getMyLocation({"success":success,"error":fail});
                }
                fetchLocation();
                // setTimeout(function(){
                //   window.location = domain;
                //   window.ga('common.send', 'event', partner+"-noti", "subscribed", "partner");
                // },1000);

                // TODO: Send the subscription subscription.endpoint
                // to your server and save it to send a push message
                // at a later date
                return sendSubscriptionToServer(subscription);
              })
              .catch(function(e) {
                if (Notification.permission === 'denied') {
                  // The user denied the notification permission which
                  // means we failed to subscribe and the user will need
                  // to manually change the notification permission to
                  // subscribe to push messages
                  console.log('Permission for Notifications was denied');
                  pushButton.disabled = true;
                } else {
                  // A problem occurred with the subscription, this can
                  // often be down to an issue or lack of the gcm_sender_id
                  // and / or gcm_user_visible_only
                  console.log('Unable to subscribe to push.', e);
                  pushButton.disabled = false;
                  pushButton.textContent = 'Enable';
                }
              });
          });
        }
        function setupPageUI(element){
            $(".error-element").addClass("hide");
            element.removeClass("hide");
        }
        // Once the service worker is registered set the initial state
        window.Nofication.initialiseState = function() {
          // Are Notifications supported in the service worker?
          var head = document.head;
          var noManifest = true;
          // Walk through the head to check if a manifest already exists
          for (var i = 0; i < head.childNodes.length; i++) {
              if (head.childNodes[i].rel === 'manifest') {
                  noManifest = false;
                  break;
              }
          }
          // If there is no manifest already, add one.
          if (noManifest) {
              var manifest = document.createElement('link');
              manifest.rel = 'manifest';
              manifest.href = "/partner-services/enable-notification/"+partner+"/manifest.json";
              document.head.appendChild(manifest);
          }
            var os = getOs();
            var device = getDevice();
          if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            setupPageUI($("#not-chrome-desktop"));
            return;
          }

          // Check the current Notification permission.
          // If its denied, it's a permanent block until the
          // user changes the permission
          if (Notification.permission === 'denied') {
            setupPageUI($("#disabled-notifications-desktop"));
            return;
          }

          // Check if push messaging is supported
          if (!('PushManager' in window)) {
            setupPageUI($("#not-chrome-desktop"));
            return;
          }

          // We need the service worker registration to check for a subscription
          navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
            // Do we already have a push message subscription?
            serviceWorkerRegistration.pushManager.getSubscription()
              .then(function(subscription) {
                // Enable any UI which subscribes / unsubscribes from
                // push messages.
                var pushButton = document.querySelector('.js-push-button');
                pushButton.disabled = false;

                if (!subscription) {
                  window.Nofication.subscribe();
                }
               
              })
              .catch(function(err) {
                console.log('Error during getSubscription()', err);
              });
          });
        }

       init(); 
    }
})();
