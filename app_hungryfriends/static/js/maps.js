function locations(latSW, lngSW, latNE, lngNE) {
  var response= { 
	"type": "FeatureCollection",
	"features": []
	};
  
//	addPointWithName(response,(lngSW+lngNE)/2.0,(latSW+latNE)/2.0, 'middle',"restaurant");
//	addPointWithName(response,lngSW+(lngNE-lngSW)/3,(latSW+latNE)/2.0, 'left',"restaurant");
	
	addPointWithName(response,-84.38929818916326, 33.77172719931528 ,'The Varsity',"restaurant")
	addPointWithName(response,-84.38444875526433, 33.7789865020589 ,'Vortex',"restaurant")
	addPointWithName(response,-84.39929209995275, 33.781705163672704 ,'Papa Johns',"restaurant")
	addPointWithName(response,-84.40781616020207, 33.78535349211609,'Cook out',"restaurant")
	 

	return response
}
	

function addPointWithName(json,lng, lat, name,type){
	var point= {
			"type": "Feature",
			"properties": {"name":name, "type":type},
			"geometry": {
					"type": "Point",
					"coordinates": [lng , lat]
					}
			};
	json.features.push(point);
}

function addPoint(json,lng, lat,type){
	var point= {
			"type": "Feature",
			"properties": {"type":type},
			"geometry": {
					"type": "Point",
					"coordinates": [lng , lat]
					}
			};
	json.features.push(point);
}
	 
 function initMap() {
        var mapDiv = document.getElementById('map');
         map = new google.maps.Map(mapDiv, {
          center: {lat: 33.749, lng: -84.388},
          zoom: 12
        }); 

	  
	  
	google.maps.event.addListener(map, 'bounds_changed', function() {
		NElat=map.getBounds().getNorthEast().lat();
		NElng=map.getBounds().getNorthEast().lng();
		SWlat=map.getBounds().getSouthWest().lat();
		SWlng=map.getBounds().getSouthWest().lng();
		U=locations(SWlat, SWlng, NElat, NElng);
		map.data.forEach(function(feature){map.data.remove(feature)});
		map.data.addGeoJson(U);	
      });

	google.maps.event.addListenerOnce(map, 'idle', function() {
		map.data.forEach(function(feature){
			map.data.addListener('click', function(event){
					var feature= event.feature;
					details = document.getElementById('details');
					details.innerHTML = feature.getProperty('name')+'</br>'+feature.getGeometry().get().lat()+'</br>'+feature.getGeometry().get().lng();

					});		
			  
  });
  });

	};  