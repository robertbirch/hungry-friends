coordinatesList=[];
friendsMarkersList= { 
	"type": "FeatureCollection",
	"features": []
};
restaurantsMarkersList=[];
doneAdding=false;
searchRadius=2;
searchRadiusIncrement=2;
friendsLocationList=[]

var loadedValues = false;
var backendReply;

function getPoints() {
	var rep=[]
		map.data.forEach(function(f){
			rep.push(f.getGeometry().j) 
		})
	return rep;
}

function updateRestaurantsView() {
	if (doneAdding){

		// backendReply=locations($( "#cuisine1" ).val(),$( "#cuisine2" ).val(), $( "#cuisine3" ).val(),searchRadius,friendsLocationList,$('#slider').slider("option", "value"));
		$.ajax({
			url:'http://localhost:8000/search',
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

			map.data.forEach(function(feature){ff=feature; if (feature.getProperty("type")=="restaurant") {map.data.remove(feature)}});

			// var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(restaurantsMarkersList));

			// $('<a href="data:' + input + '" download="data.json">download JSON</a>').appendTo('body');

			map.data.addGeoJson(restaurantsMarkersList);
			map.fitBounds(backendReply.boundingBox);
			ddata=map.data;
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

				map.data.addListener('click', function(event){
					var feature= event.feature;
					document.getElementById('name').innerHTML = "<h2>"+feature.getProperty('name')+"</h2>";
					document.getElementById('photo').innerHTML = '<img src="'+feature.getProperty('image_url')+'" alt="'+feature.getProperty('name')+'">';
					//					document.getElementById('LkS').innerHTML = 'Liking Score: '+feature.getProperty('likingScore');
					//					document.getElementById('LoS').innerHTML = 'Location Score: '+feature.getProperty('locationScore');
					//					document.getElementById('GS').innerHTML = 'Global Score: '+feature.getProperty('globalScore');
					var address = feature.getProperty('display_address')[0];
					for (i=1; i<feature.getProperty('display_address').length; i++){
						address+='</br>'+feature.getProperty('display_address')[i];

					}
					document.getElementById('address').innerHTML ='<a href="https://www.google.com/maps/place/'+feature.getGeometry().j.lat()+','+feature.getGeometry().j.lng()+'" target="_blank">'+address+'</a>';
					document.getElementById('phone').innerHTML = feature.getProperty('display_phone');


				});
				/*				content = '<div style="float:center"> 	<div id="name'+feature.getProperty('globalRank')+'">'
								content+= "<h2>"+feature.getProperty('name')+"</h2>";
								content+= '</div><table><th><div id="photo'+feature.getProperty('globalRank')+'">';
								content+= '<img src="'+feature.getProperty('image_url')+'" alt="'+feature.getProperty('name')+'">';
								content+= '</div></th><th><div><div id="address'+feature.getProperty('globalRank')+'">';
								var address;
								if(feature.getProperty('display_address')!=undefined){
								address = feature.getProperty('display_address')[0];}
								for (i=1; i<feature.getProperty('display_address').length; i++){
								address+='</br>'+feature.getProperty('display_address')[i];
								}
								content+= '<a href="https://www.google.com/maps/place/'+feature.getGeometry().j.lat()+','+feature.getGeometry().j.lng()+'" target="_blank">'+address+'</a>';
								content+='</div><div id="phone'+feature.getProperty('globalRank')+'">';
								content+='</div></div></th></table></div>'; 
								$(content).appendTo(document.getElementById('details2'));
								*/			
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

function expandSearchArea(){
	searchRadius+= searchRadiusIncrement;
	updateRestaurantsView()
}

function narrowSearchArea(){
	searchRadius-= searchRadiusIncrement;
	updateRestaurantsView()
} 

function initAutocomplete() {
	var mapDiv = document.getElementById('map');
	map = new google.maps.Map(mapDiv, {
		center: {lat: 33.749, lng: -84.388},
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
