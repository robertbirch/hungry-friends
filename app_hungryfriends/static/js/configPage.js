coordinatesList=[];
 friendsMarkersList= { 
	"type": "FeatureCollection",
	"features": []
	};
friendsLocations=[];
restaurantsMarkersList=[];
 doneAdding=false;
 searchRadius=2;
 searchRadiusIncrement=2;


	function getPoints() {
	  var rep=[]
	  map.data.forEach(function(f){
		 rep.push(f.getGeometry().j) 
	  })
	return rep;
	}
 
   function updateRestaurantsView() {
    if (doneAdding){
/*		NElat=map.getBounds().getNorthEast().lat();
		NElng=map.getBounds().getNorthEast().lng();
		SWlat=map.getBounds().getSouthWest().lat();
		SWlng=map.getBounds().getSouthWest().lng();
		backendReply=locations(SWlat, SWlng, NElat, NElng,$( "#cuisine1" ).val(),$( "#cuisine2" ).val(), $( "#cuisine3" ).val(),searchRadius);
*/		
		backendReply=locations($( "#cuisine1" ).val(),$( "#cuisine2" ).val(), $( "#cuisine3" ).val(),searchRadius,friendsLocations);
		restaurantsMarkersList=backendReply.restaurantList;
		boundingBox=backendReply.boundingBox;
		extremeScores = backendReply.extremeScores;
		map.data.forEach(function(feature){ff=feature; if (feature.getProperty("type")=="restaurant") {map.data.remove(feature)}});
		map.data.addGeoJson(restaurantsMarkersList);
		ddata=map.data;
		map.data.forEach(function(feature){
			if (feature.getProperty("type")=="restaurant"){
				x= 40-(feature.getProperty("globalScore")-extremeScores[1])/(extremeScores[0]-extremeScores[1])*20;
				y= 1.5*x;
				map.data.overrideStyle(feature, {icon: {
					url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+feature.getProperty('globalRank')+'|FF0000|000000',
				scaledSize: new google.maps.Size(x, y)}})
				
				
				var hotSpot = feature.getGeometry().j;
				var heatMapZip = [ {location: hotSpot, weight: feature.getProperty('locationScore')} ];
				var color =[ "#ff0000",    "#00ff00" ];

				heatmap = new google.maps.visualization.HeatmapLayer({
					data: heatMapZip,
					radius: 90,
					dissapating: true
				});
          
				rate = (feature.getProperty('locationScore')-extremeScores[3])/(extremeScores[2]-extremeScores[3]);
				var gradient = [
					'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 0)',
					'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 1)'];
				heatmap.set('gradient', gradient);
				heatmap.setMap(map);
			}
				
		})		
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
	
	function expandSearchArea(){
		searchRadius+= searchRadiusIncrement;
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
	friendsLocations,push(map.getCenter().lat());
	friendsLocations,push(map.getCenter().lng());	
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
	map.data.remove(center)

	google.maps.event.addListenerOnce(map, 'idle', function() {
		map.data.forEach(function(feature){
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
			  
		});
	});
	updateRestaurantsView();
	
}

	expand = document.getElementById('expand');
	expand.style.display = 'none';  
	expand.style.display = 'none';  

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