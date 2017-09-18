(function() {
	var picker = new Pikaday({
        field: $('.date-picker'),
        format: 'D MMM YYYY',
        onSelect: function() {
            console.log(this.getMoment().format('Do MMMM YYYY'));
        }
    });
})();