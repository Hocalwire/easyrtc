var MyMap = { 
	mapLoaded : false,
	map : null,
	lat : 28.63261,
	lng : 77.36716,
	address : "",
	geocoder : null,
	places : null,
	marker : null,
	mapJSLoaded : false,
	infowindow : null,
	setLocationOnCallback : false,
	setLocationData : {},
	loadMap : function(element,lat,lng){
		if(!element){
			alert("pass an element to insert map");
		}
		var html = "<input id="+'"search-map" onclick="$(this).val('+"'')"+'"/>'+
			'<div id="map-wrapper" style="width: 100%; height:98%;"> </div>';
		element.html(html);
		if(lat) {
			MyMap.lat = lat;
		}
		if(lng){
			MyMap.lng=lng;
		}

		if(MyMap.mapLoaded){
			MyMap.init();
		} else if(MyMap.mapJSLoaded){
			MyMap.mapLoaded = true;
			MyMap.init();
		} else {
			MyMap.loadMapOnConnection();
		}
	},
	setMapLocation : function(lat,lng){
		if(MyMap.mapLoaded){
			MyMap.lat = lat;
			MyMap.lng = lng;
			MyMap.selectPoint();
			setLocationOnCallback=false;
			setLocationData= {};
		} else {
			setLocationOnCallback=true;
			setLocationData['lat'] = lat;
			setLocationData['lng'] = lng;
		}
	},
	clearMap : function(){
		MyMap.mapLoaded = false;
		MyMap.map = null;
	},
	loadMapOnConnection : function(){
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=googleLoadCallbackOnConnection';
		document.body.appendChild(script);
	},
	init : function(){
		MyMap.getMap();
		if(MyMap.lat && MyMap.lng)
			MyMap.selectPoint();
		MyMap.addMyLocationButton(MyMap.map,MyMap.marker);
	},
	getMap : function(){
		if(MyMap.map) {
			if(MyMap.setLocationOnCallback && MyMap.setLocationData["lat"]){
				MyMap.lat = MyMap.setLocationData['lat'];
				MyMap.lng = MyMap.setLocationData['lng'];
				setLocationOnCallback=false;
				setLocationData= {};
				MyMap.selectPoint();
			}
			
			return MyMap.map;

		} else {
			var	zoomLevel = 14;
			var	map_id = "map-wrapper";
			var	inputId = "search-map";
			if(MyMap.setLocationOnCallback && MyMap.setLocationData["lat"]){

				MyMap.lat = MyMap.setLocationData['lat'];
				MyMap.lng = MyMap.setLocationData['lng'];
				setLocationOnCallback=false;
				setLocationData= {};
			}
			var	latLong = {lat:MyMap.lat, lng : MyMap.lng};

			var myLatlng = new google.maps.LatLng(latLong.lat,latLong.lng);

			var mapOptions = {
				zoom: zoomLevel,
				center: myLatlng,
				mapTypeControlOptions: {
				      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
				},
				disableDefaultUI: true, // a way to quickly hide all controls
				    mapTypeControl: true,
				    scaleControl: true,
				    zoomControl: true,
				    zoomControlOptions: {
				      style: google.maps.ZoomControlStyle.LARGE 
				    },
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};
			
			MyMap.map = new google.maps.Map(document.getElementById(map_id), mapOptions);
			var map = MyMap.map;
			var input = document.getElementById(inputId);
			map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

			var options = {                    
				types: ['geocode']
			};

			var autocomplete = new google.maps.places.Autocomplete(input, options);
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				var place = autocomplete.getPlace();
				var loc = place.geometry.location;
				map.setCenter(loc);
				map.panTo(loc);
				MyMap.lat = loc.lat();
				MyMap.lng = loc.lng();
				
				MyMap.selectPoint(place.formatted_address);
				
			});

			
			MyMap.map.mapTypeControl=false;	
			MyMap.geocoder = new google.maps.Geocoder();
			MyMap.places = new google.maps.places.PlacesService(map);
			MyMap.map.addListener('click', function(e) {
			    MyMap.lat = e.latLng.lat();
			    MyMap.lng = e.latLng.lng();
			    MyMap.setMapCenter();
			    MyMap.selectPoint();
			    
  			});
			return MyMap.map;
		}
	},
	getMarker : function(lat,lng){
		if(MyMap.marker) {
			MyMap.marker.setMap(null);
		}
		var myLatLng = new google.maps.LatLng(lat,lng);
		MyMap.marker = new google.maps.Marker({
				position: myLatLng,
				map: MyMap.map,
				draggable: true,
				animation:false
			});
			   
		MyMap.marker.setMap(MyMap.map);
		MyMap.marker.ignoreClick=false;
		return MyMap.marker;
        
	},
	showInfoWindow : function(address){
		if(MyMap.infowindow){
			MyMap.infowindow.close();
		}
		MyMap.address = address;
		MyMap.infowindow = new google.maps.InfoWindow({
	            content: "<span>"+address+"</span>"
	        });	
	        MyMap.infowindow.open(MyMap.map,MyMap.marker);
	        
	},
	selectPoint : function(address){
		MyMap.getMarker(MyMap.lat,MyMap.lng);
		google.maps.event.addListener(MyMap.marker, 'dragend', function() {
		      MyMap.lat = MyMap.marker.getPosition().lat();
		      MyMap.lng = MyMap.marker.getPosition().lng();
		      MyMap.setMapCenter();
		      MyMap.getAddressFromLatLng(MyMap.lat,MyMap.lng);
        	});
        	if(!address)
	        	MyMap.getAddressFromLatLng(MyMap.lat,MyMap.lng);
	        else {
	        	
	        	MyMap.showInfoWindow(address);
	        }
	},
	getAddressFromLatLng : function(lat,lng){
		var latlng = new google.maps.LatLng(lat, lng);
		var request = {
			location: latlng,
			radius: '100',
			types : ["shopping_mall","university","train_station","taxi_stand","subway_station","stadium","restaurant","post_office",
			"police","place_of_worship","park","museum","night_club","embassy","establishment","finance","fire_station","food",
			"funeral_home","gas_station","gym","hindu_temple","health","hospital","library","local_government_office","mosque","movie_theater",
			"department_store","church","casino","cafe","bus_station","bar","atm","bank","airport","amusement_park"]

		};
		MyMap.places.nearbySearch(request, function(results, status) {
			var name = "";
			if (status ==  google.maps.places.PlacesServiceStatus.OK) {
			    	var name = "";
			    	if(results.length>0){
			    		var r=results[0];
			    		name=r.vicinity;
			    	}
			    	MyMap.showInfoWindow(name);
		      
		    } else {
		      		MyMap.showInfoWindow(lat+" East,"+lng+" North.");
		    }
		});
	},
	setMapCenter : function(){
		var myLatlng = new google.maps.LatLng(MyMap.lat,MyMap.lng);
		MyMap.map.setCenter(myLatlng);
		
	},
	addMyLocationButton : function (map, marker) 
	{
	    var controlDiv = document.createElement('div');

	    var firstChild = document.createElement('button');
	    firstChild.style.backgroundColor = '#fff';
	    firstChild.style.border = 'none';
	    firstChild.style.outline = 'none';
	    firstChild.style.width = '28px';
	    firstChild.style.height = '28px';
	    firstChild.style.borderRadius = '2px';
	    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
	    firstChild.style.cursor = 'pointer';
	    firstChild.style.marginRight = '10px';
	    firstChild.style.padding = '0';
	    firstChild.title = 'Your Location';
	    controlDiv.appendChild(firstChild);

	    var secondChild = document.createElement('div');
	    secondChild.style.margin = '5px';
	    secondChild.style.width = '18px';
	    secondChild.style.height = '18px';
	    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
	    secondChild.style.backgroundSize = '180px 18px';
	    secondChild.style.backgroundPosition = '0 0';
	    secondChild.style.backgroundRepeat = 'no-repeat';
	    firstChild.appendChild(secondChild);

	    google.maps.event.addListener(map, 'center_changed', function () {
	        secondChild.style['background-position'] = '0 0';
	    });

	    firstChild.addEventListener('click', function () {
	        var imgX = '0',
	            animationInterval = setInterval(function () {
	                imgX = imgX === '-18' ? '0' : '-18';
	                secondChild.style['background-position'] = imgX+'px 0';
	            }, 500);

	        if(navigator.geolocation) {
	            navigator.geolocation.getCurrentPosition(function(position) {
	                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	                map.setCenter(latlng);
	                clearInterval(animationInterval);
	                secondChild.style['background-position'] = '-144px 0';
	                MyMap.lat = position.coords.latitude;
					MyMap.lng = position.coords.longitude
					MyMap.selectPoint();
	            });
	        } else {
	            clearInterval(animationInterval);
	            secondChild.style['background-position'] = '0 0';
	        }
	    });

	    controlDiv.index = 1;
	    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
	}
	
};
function googleLoadCallbackOnConnection(){
	MyMap.mapLoaded=true;
	MyMap.mapJSLoaded = true;
	MyMap.init();
}	