(function() {
    "use strict";
    var $cookies = {};

    var GlobalService = {
        setUpCookies: function() {
            var c = document.cookie.split('; ');
            var cc;
            $cookies = {};
            for(var i=c.length-1; i>=0; i--){
                cc= c[i].split('=');
               $cookies[cc[0]] = cc[1];
            }
        },

        getCookie: function( name ) {
            this.setUpCookies();
            return $cookies[name];
        },

        setCookie: function( name, value, options ) {
            if(!name) {
                return "";
            }
            
            if (name ) {
                $cookies[ name ] = value;
                if(options){
                    var str = "";
                    for(var k in options){
                        str+=";" + k+"="+options[k];
                    }
                    document.cookie=name+"="+value + str;
                } else {
                    document.cookie=name+"="+value;
                }
                
            }
        }
    };

    Hocalwire.Services.GlobalService = GlobalService;
    
})();
