(function($) {
    // Used by colorslider.js
     ['width', 'height'].forEach(function(dimension) {
        var offset, Dimension = dimension.replace(/./, function(m) { return m[0].toUpperCase() });
        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;
            if (elem) {
                var size = elem[dimension]();
                var sides = {'width': ['left', 'right'], 'height': ['top', 'bottom']};
                sides[dimension].forEach(function(side) {
                    if (margin) size += parseInt(elem.css('margin-' + side), 10);
                });
                return size;
            } else {
                return null;
            }
       };
    });

    $.fn.extend = function(obj) {
        $.extend($.fn, obj);
    };

}($));
