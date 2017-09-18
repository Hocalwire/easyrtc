(function() {
    function Promise(fn) {
          var state = 'pending';
          var value;
          var deferred = null;

          function resolve(newValue) {
            if(newValue && typeof newValue.then === 'function') {
              newValue.then(resolve, reject);
              return;
            }
            state = 'resolved';
            value = newValue;

            if(deferred) {
              handle(deferred);
            }
          }

          function reject(reason) {
            state = 'rejected';
            value = reason;

            if(deferred) {
              handle(deferred);
            }
          }

          function handle(handler) {
            if(state === 'pending') {
              deferred = handler;
              return;
            }

            var handlerCallback;

            if(state === 'resolved') {
              handlerCallback = handler.onResolved;
            } else {
              handlerCallback = handler.onRejected;
            }

            if(!handlerCallback) {
              if(state === 'resolved') {
                handler.resolve(value);
              } else {
                handler.reject(value);
              }

              return;
            }

            var ret = handlerCallback(value);
            handler.resolve(ret);
          }

          this.then = function(onResolved, onRejected) {
            return new Hocalwire.Promise(function(resolve, reject) {
              handle({
                onResolved: onResolved,
                onRejected: onRejected,
                resolve: resolve,
                reject: reject
              });
            });
          };

          fn(resolve, reject);

    }
    Hocalwire.Promise = Promise;
})();
