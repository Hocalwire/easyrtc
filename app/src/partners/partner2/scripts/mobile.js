(function(ua) {
    var mobileObj = {
        Mobile: false,
        iOS: false,
        iPhone: false,
        iPad: false,
        Android: false,
        webOS: false,
        Mac: false,
        Windows: false,
        Other: true,
    };

    function ver(re, index, replaceA, replaceB) {
        var v = re.exec(ua);
        if(v === null || typeof v !== 'object' || typeof v.length !== 'number') {
            return true;
        } else if(typeof v.length === 'number' && v.length >= (index + 1)) {
            if(replaceA && replaceB) return v[index].replace(replaceA, replaceB);
            else return v[index];
        } else {
            return true;
        }
    }

    if (/mobile/i.test(ua)) {
        mobileObj.Mobile = true;
    }

    if (/like Mac OS X/.test(ua)) {
        mobileObj.iOS       = ver(/CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/, 2, /_/g, '.');
        mobileObj.iPhone    = /iPhone/.test(ua);
        mobileObj.iPad      = /iPad/.test(ua);
    }

    if (/Android/.test(ua)) {
        mobileObj.Android = ver(/Android ([0-9\.]+)[\);]/, 1);
    }

    if (/webOS\//.test(ua)) {
        mobileObj.webOS = ver(/webOS\/([0-9\.]+)[\);]/, 1);
    }

    if (/(Intel|PPC) Mac OS X/.test(ua)) {
        mobileObj.Mac = ver(/(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/, 2, /_/g, '.');
    }

    if (/Windows NT/.test(ua)) {
        mobileObj.Windows = ver(/Windows NT ([0-9\._]+)[\);]/, 1);
    }

    for(var key in mobileObj) {
        if(key !== 'Other' && key !== 'Mobile' && mobileObj[key] !== false) {
            mobileObj.Other = false;
        }
    }

    window.Hocalwire.MOBILE_DETAILS = mobileObj;

}(window.navigator.userAgent));
