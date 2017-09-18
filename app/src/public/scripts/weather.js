(function() {

	Hocalwire.Services.Weather = {};
	Hocalwire.Services.Weather.getWeather = function(lat,lng,callback){
	 	if(lat && lng){
	 		var now = new Date();
	        var time = now.getTime();
	        time += 1*24*3600 * 1000; //for a week
	        now.setTime(time);
		 	Hocalwire.Services.GlobalService.setCookie("loc_latitude",lat,{"path":"/","expires":now.toUTCString()});
		 	Hocalwire.Services.GlobalService.setCookie("loc_longitude",lng,{"path":"/","expires":now.toUTCString()});
		 	getWeather(callback);
	 	} else {
	 		var lat = Hocalwire.Services.GlobalService.getCookie("loc_latitude");
		 	var lng = Hocalwire.Services.GlobalService.getCookie("loc_longitude");
		 	if(lat&&lng){
		 		getWeather(callback);
		 	} else {
		 		Utils.getMyLocation({
		 			"success" : function(data){
		 				Hocalwire.Services.GlobalService.setCookie("loc_latitude",data.latitude,{"path":"/","expires":now.toUTCString()});
			 			Hocalwire.Services.GlobalService.setCookie("loc_longitude",data.longitude,{"path":"/","expires":now.toUTCString()});
			 			getWeather(callback);
		 			},
		 			"error" : function(data){
		 				callback(data);
		 			}
		 		});
		 	}
	 		
	 	}
	 };
	function getWeather(callback) {
	var latitude = Hocalwire.Services.GlobalService.getCookie("loc_latitude");
	var longitude = Hocalwire.Services.GlobalService.getCookie("loc_longitude");
	
	var loc_conditions = Hocalwire.Services.GlobalService.getCookie('loc_conditions');
	var loc_conditions_img = Hocalwire.Services.GlobalService.getCookie('loc_conditions_img');
	var loc_temp = Hocalwire.Services.GlobalService.getCookie('loc_temp');
	var loc_humidity = Hocalwire.Services.GlobalService.getCookie('loc_humidity');
	
	if (loc_conditions && loc_conditions_img) {
		callback({"condition":loc_conditions, "loc_condition_image":loc_conditions_img, "loc_temp":loc_temp,"loc_humidity": loc_humidity});
	} else {
		var url = "http://ws.geonames.org/findNearByWeatherJSON?lat=" + latitude + "&lng=" + longitude + "&callback=?";
		$.getJSON(url, function(data) {
			var clouds = data.weatherObservation.clouds;
			var weather = data.weatherObservation.weatherCondition;
			var temp = data.weatherObservation.temperature;
			var humidity = data.weatherObservation.humidity;
			
			var conditions_img = getConditions(clouds, weather);
			
			var conditions = '';
			if (weather == 'n/a') {
				if (clouds == 'n/a') {
					conditions = 'fine';
				} else {
					conditions = clouds;
				}
			} else {
				conditions = weather;
			}
			var now = new Date();
	        var time = now.getTime();
	        time += 15*60 * 1000; //for 15 mins
	        now.setTime(time);

			Hocalwire.Services.GlobalService.setCookie("loc_conditions",conditions,{"path":"/","expires":now.toUTCString()});
			Hocalwire.Services.GlobalService.setCookie("loc_conditions_img",conditions_img,{"path":"/","expires":now.toUTCString()});
			Hocalwire.Services.GlobalService.setCookie("loc_temp",temp,{"path":"/","expires":now.toUTCString()});
			Hocalwire.Services.GlobalService.setCookie("loc_humidity",humidity,{"path":"/","expires":now.toUTCString()});
			callback({"condition":conditions, "loc_condition_image":conditions_img, "loc_temp":temp,"loc_humidity": humidity});
		});
	}
}

function getConditions(clouds, weather) {
	if (weather == 'n/a') {
		switch (clouds) {
			case 'n/a':
				return 'sunny.gif';
			case 'clear sky':
				return 'sunny.gif';
			case 'few clouds':
				return 'partly_cloudy.gif';
			case 'scattered clouds':
				return 'partly_cloudy.gif';
			case 'broken clouds':
				return 'partly_cloudy.gif';
			default:
				return 'cloudy.gif';
		}
	} else {
		weather = weather.replace('light ', '').replace('heavy ', '').replace(' in vicinity', '');
		switch(weather) {
			case 'drizzle':
				return 'rain.gif';
			case 'rain':
				return 'rain.gif';
			case 'snow':
				return 'snow.gif';
			case 'snow grains':
				return 'sleet.gif';
			case 'ice crystals':
				return 'icy.gif';
			case 'ice pellets':
				return 'icy.gif';
			case 'hail':
				return 'sleet.gif';
			case 'small hail':
				return 'sleet.gif';
			case 'snow pellets':
				return 'sleet.gif';
			case 'unknown precipitation':
				return 'rain.gif';
			case 'mist':
				return 'mist.gif';
			case 'fog':
				return 'fog.gif';
			case 'smoke':
				return 'smoke.gif';
			case 'volcanic ash':
				return 'smoke.gif';
			case 'sand':
				return 'dust.gif';
			case 'haze':
				return 'haze.gif';
			case 'spray':
				return 'rain.gif';
			case 'widespread dust':
				return 'dust.gif';
			case 'squall':
				return 'flurries.gif';
			case 'sandstorm':
				return 'dust.gif';
			case 'duststorm':
				return 'dust.gif';
			case 'well developed dust':
				return 'dust.gif';
			case 'sand whirls':
				return 'dust.gif';
			case 'funnel cloud':
				return 'flurries.gif';
			case 'tornado':
				return 'storm.gif';
			case 'waterspout':
				return 'storm.gif';
			case 'showers':
				return 'storm.gif';
			case 'thunderstorm':
				return 'thunderstorm.gif';
			default:
				if (weather.indexOf("rain")) {
					return 'rain.gif';
				} else if (weather.indexOf("snow")) {
					return 'snow.gif';
				} else if (weather.indexOf("thunder")) {
					return 'thunderstorm.gif';
				} else if (weather.indexOf("dust")) {
					return 'dust.gif';
				} else {
					return 'sunny.gif';
				}
		}
	}
}
	
})();

