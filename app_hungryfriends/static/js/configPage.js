//this script runs the main webpage


coordinatesList=[];   	
friendsMarkersList= { 
	"type": "FeatureCollection",
	"features": []
};						//keeps the markers on the map where the friends are located
restaurantsMarkersList=[];	//keeps the markers on the map where restaurants are located
doneAdding=false;			//define which stage we are at: done adding participants or not
searchRadius=2;				//size of the search box on yelp
searchRadiusIncrement=2;	//increment to change the searchRadius from when expanding or narrowing down the search
friendsLocationList=[]		//keeps the location of the friends



//get the results from the backend
var loadedValues = false;
var backendReply;

function getPoints() {
	var rep=[]
		map.data.forEach(function(f){
			rep.push(f.getGeometry().j) 
		})
	return rep;
}



//this function updates the map view
function updateRestaurantsView() {
	
	
	if (doneAdding){
		// backendReply=locations($( "#cuisine1" ).val(),$( "#cuisine2" ).val(), $( "#cuisine3" ).val(),searchRadius,friendsLocationList,$('#slider').slider("option", "value"));
		$.ajax({
            url:'http://hungry-friends.herokuapp.com/search',
		method:'POST',
		async: true,
		data:JSON.stringify({
			locations:friendsLocationList,
			cuisines:[$( "#cuisine1" ).val(), $( "#cuisine2" ).val(), $( "#cuisine3" ).val()],
			preference:$('#slider').slider("option", "value"),
			radius:searchRadius
		})
		// data: JSON.stringify({"locations":[[-84.41992901611333,33.7729757712983],[-84.35607098388677,33.78381975012868],[-84.32791851806645,33.74100658604575],[-84.35366772460942,33.70731187187089],[-84.43434857177739,33.732155865935056]],"cuisines":["burgers","indpak","arabian"],"preference":8,"radius":2})
		}).success(function(data, errors) {
			loadedValues = true;
			backendReply = data;

			
			
			
			restaurantsMarkersList=backendReply.restaurantList;
			console.log(backendReply)
			boundingBox=backendReply.boundingBox;
			extremeScores = backendReply.extremeScores;
			
			//we delete all the restaurant markers currently shown on the map (but not the friends markers)
			map.data.forEach(function(feature){ff=feature; if (feature.getProperty("type")=="restaurant") {map.data.remove(feature)}});

			// var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(restaurantsMarkersList));

			// $('<a href="data:' + input + '" download="data.json">download JSON</a>').appendTo('body');

			//we add the restaurant markers for the results we just got from the back-end
			map.data.addGeoJson(restaurantsMarkersList);
			//we adapt the view to the box containing the results we just got
			map.fitBounds(backendReply.boundingBox);
			
			
			var heatMapZip = []
			map.data.forEach(function(feature){
				if (feature.getProperty("type")=="restaurant"){
					x= 40-(feature.getProperty("globalScore")-extremeScores[1])/(extremeScores[0]-extremeScores[1])*20;
					y= 1.5*x;
					map.data.overrideStyle(feature, {icon: {
						url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+feature.getProperty('globalRank')+'|FF0000|000000',
					scaledSize: new google.maps.Size(x, y)}})
					
					
					var hotSpot = feature.getGeometry().j;
					console.log(feature, feature.getGeometry());
					heatMapZip.push({location: hotSpot, weight: feature.getProperty('locationScore')});
					// var color =[  "#ff0000","#00ff00","#0000FF"  ];

				}

				
				//display info about a restaurant when clicked on its marker
				map.data.addListener('click', function(event){
					var feature= event.feature;
					document.getElementById('name').innerHTML = "<h2>"+feature.getProperty('name')+"</h2>";
					document.getElementById('photo').innerHTML = '<img src="'+feature.getProperty('image_url')+'" alt="'+feature.getProperty('name')+'">';
					var address = feature.getProperty('display_address')[0];
					for (i=1; i<feature.getProperty('display_address').length; i++){
						address+='</br>'+feature.getProperty('display_address')[i];

					}
					document.getElementById('address').innerHTML ='<a href="https://www.google.com/maps/place/'+feature.getGeometry().j.lat()+','+feature.getGeometry().j.lng()+'" target="_blank">'+address+'</a>';
					document.getElementById('phone').innerHTML = feature.getProperty('display_phone');


				});		
			});

			
			
						heatMapZip = []

			var polygon_points = []
			backendReply.centroid_distances.forEach(function(value){
				point = value[0]
				polygon_points.push(new google.maps.LatLng(point[0], point[1]))
				heatMapZip.push({location: new google.maps.LatLng(point[0], point[1])})
			})

			// /console.log(new google.maps.LatLng(37.782551, -122.445368));

			heatmap = new google.maps.visualization.HeatmapLayer({
						data: heatMapZip,
						radius: 300,
						dissipating: true,
						opacity: 0.5
					});
	          		// heatmap.set('gradient', color);
					// rate = (feature.getProperty('locationScore')-extremeScores[3])/(extremeScores[2]-extremeScores[3]);
					// console.log(rate);
					// var gradient = [
					// 	'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 0)',
					// 	'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 1)'];
					var gradient = [
								    'rgba(0, 255, 0, 0)',
								    'rgba(0, 255, 10, 1)',
								    'rgba(0, 191, 255, 1)',
								    'rgba(0, 127, 255, 1)',
								    'rgba(0, 63, 255, 1)',
								    'rgba(0, 0, 255, 1)',
								    'rgba(0, 0, 223, 1)',
								    'rgba(0, 0, 191, 1)',
								    'rgba(0, 0, 159, 1)',
								    'rgba(0, 0, 127, 1)',
								    'rgba(63, 0, 91, 1)',
								    'rgba(127, 0, 63, 1)',
								    'rgba(191, 0, 31, 1)',
								    'rgba(255, 0, 0, 1)'
  									]
					heatmap.set('gradient', gradient);
					heatmap.setMap(map);


				var polygonMask = new google.maps.Polygon({
				map:map,
				strokeColor: '#000000',
				strokeOpacity: 0.5,
				strokeWeight: 2,
				fillColor: '#CACACA',
				fillOpacity: 0.5,
				paths: [[
				    new google.maps.LatLng(-85.1054596961173, -180),
				    new google.maps.LatLng(85.1054596961173, -180),
				    new google.maps.LatLng(85.1054596961173, 180),
				    new google.maps.LatLng(-85.1054596961173, 180),
				    new google.maps.LatLng(-85.1054596961173, 0)],
				    polygon_points.reverse()]
				});

		});
	}
	else{
		//if we are not done adding participants, we delete the marker at the former center of the map and add it at the new center
        map.data.remove(center);
        f= { 
            "type": "FeatureCollection",
            "features": []
        };
        addPoint(f,map.getCenter().lng(),map.getCenter().lat(),'center');
        center=map.data.addGeoJson(f)[0];
    }

};



didValuesLoad = function(){
	console.log("coming here");
}


//called when click on "Expand search area" buttom
function expandSearchArea(){
	searchRadius+= searchRadiusIncrement;
	updateRestaurantsView()
}


//called when click on "Narrow search area" buttom
function narrowSearchArea(){
	searchRadius-= searchRadiusIncrement;
	updateRestaurantsView()
} 


//initialisation of the map
function initAutocomplete() {
	var mapDiv = document.getElementById('map');
	map = new google.maps.Map(mapDiv, {
		center: {lat: 33.749, lng: -84.388}, //center on Atlanta ! 
		zoom: 12
	}); 

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	
	var f= { 
		"type": "FeatureCollection",
		"features": []
	};
	addPoint(f,map.getCenter().lng(),map.getCenter().lat(),'center');
	
	center=map.data.addGeoJson(f)[0];
	
	//when the map is moved and we are not done adding, we update the location of the center marker
	map.addListener('bounds_changed', function(){
		if(!doneAdding){
			searchBox.setBounds(map.getBounds());
			updateRestaurantsView();
		}});

	
	var markers = [];
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		// Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			var icon = {
				url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			markers.push(new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			}));

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});
}


//add a marker at the center of the map to the friends markers list
function addToList() {
	coordinatesList.push(map.getCenter());
	addPoint(friendsMarkersList,map.getCenter().lng(),map.getCenter().lat(),"friend");
	var f2= { 
		"type": "FeatureCollection",
		"features": []
	};
	friendsLocationList.push([map.getCenter().lng(),map.getCenter().lat()]);
	addPoint(f2,map.getCenter().lng(),map.getCenter().lat(),'center');
	f2=map.data.addGeoJson(f2)[0];
	map.data.overrideStyle(f2, {icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'});
}


//called when all friend locations are entered (changes the view by deleting some buttons and forms)
function doneAddingFunction() {
	doneAdding=true;
	var div = document.getElementById('doneAdding');
	div.innerHTML = "";
	var details = document.getElementById('details');
	details.style.display = 'none';  
	expand.style.display = 'inline';
	narrow.style.display = 'inline';
	preferenceButton.style.display = 'inline';
	map.data.remove(center)
		updateRestaurantsView();
}


//define the auto-complete forms for cuisine types
$(function() {
	$( "#cuisine1" ).autocomplete({
		source: allTags
	});
	$( "#cuisine2" ).autocomplete({
		source: allTags
	});
	$( "#cuisine3" ).autocomplete({
		source: allTags
	});
});
