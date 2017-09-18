if(!window.NotificationAPI){
    window.NotificationAPI = {};
}
window.NotificationAPI.get_browser_info = function(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],d = 'desktop'; 
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ) {
        d = 'mobile';
    }
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'ie',version:(tem[1]||''),device:d};
    }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'opera', version:tem[1],device:d};}
        }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {name: M[0].toLowerCase(),version: M[1],device:d};
}

window.NotificationAPI.setCookieVal = function(c_name,value,exdays)
{
    var current = new Date();
    var exdate=new Date(current.getTime() + 86400000*exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString() + ';path=/;');
    document.cookie=c_name + "=" + c_value;
}

window.NotificationAPI.getCookieVal = function(c_name)
{
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name)
        {
            return unescape(y);
        }
    }
    return '';
}


window.NotificationAPI.__showSubscribePopup = function(){
    var partner = $("#content").attr("data-partner");
    
    var id = document.getElementById('hocalwire_partner_push_div');
    if(id){
        window.ga('common.send', 'event', partner+"-noti", "show", "dialog");
        document.getElementById('noti_subscribe_dialog').style.display='block';
    }
}

window.NotificationAPI.closeDialog = function(cday){
    window.NotificationAPI.setCookieVal(__cname,'yup',cday);
    document.getElementById('noti_subscribe_dialog').style.display='none';
}


window.NotificationAPI.allowNoti = function() {
    var partner = $("#content").attr("data-partner");
    document.getElementById('__emsg').innerHTML = '';
    window.NotificationAPI.closeDialog(180);
    window.ga('common.send', 'event', partner+"-noti", "allowed", "dialog");
    // var partner = document.getElementById('hocalwire_partner_push_div').getAttribute("data-partner");
    // var domain = document.getElementById('hocalwire_partner_push_div').getAttribute("data-domain");
    // setTimeout(function(){
    //     var height = 500;
    //     var width = 800;
    //     if($("#hidden_element_for_desktop").is(":visible")){
            
    //     } else if($("#hidden_element_for_tablet").is(":visible")){
    //         height=400;
    //         width=600;
    //     } else {
    //         width=300;
    //         height=300;
    //     }
        
    //     var finalUrl  = 'https://hocalwire.com/partner-services/enable-notification/'+partner+'?domain_name='+domain+"&partner="+partner;
    //     window.location=finalUrl;
    //     // window.open(finalUrl,"_blank");//"Subscribe for Desktop Notificatiions","height="+height+",width="+width);
    // },1);    
    return false;
}
var __cname = 'hocalwire_partner_news_alert';
var __matchid = '';
var __cday = 120;
var browser=window.NotificationAPI.get_browser_info();

// document.getElementById("allow_noti_dialog_btn").onclick = window.NotificationAPI.allowNoti;
if(((browser.name == 'chrome' && browser.version >= 43) || (browser.device != 'mobile' && browser.name == 'firefox' && browser.version >= 44))){
    var cval = window.NotificationAPI.getCookieVal(__cname) || '';
    if (cval == '') {
        setTimeout(window.NotificationAPI.__showSubscribePopup, 3000);
    }
}