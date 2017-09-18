(function() {
    $.fn.scrollToAnimate = function(target, duration) {
        var $el = this;
        var el  = $el[0];
        var startPosition = el.pageYOffset;
        var delta = target - startPosition;

        var startTime = Date.now();

        function scroll() {
            var fraction = Math.min(1, (Date.now() - startTime) / duration);

            el.scrollTo(0, delta * fraction + startPosition);

            if(fraction < 1) {
                setTimeout(scroll, 50);
            }
        }
        scroll();
    };
})();
