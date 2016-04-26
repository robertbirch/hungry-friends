
function locations(cuisine1, cuisine2, cuisine3,searchRadius,friendsLocation,sliderValue) {
	var response;
	console.log(friendsLocation)
	$.when(
	$.ajax({
		url:'http://localhost:8000/search',
		method:'POST',
		async: false,
		data:JSON.stringify({
			locations:friendsLocation,
			cuisines:[cuisine1, cuisine2, cuisine3],
			preference:sliderValue,
			radius:searchRadius
		})

	}).success(function(data, errors) {

			response = data;
	// 		backendReply = data;
	// 		restaurantsMarkersList=backendReply.restaurantList;
	// 		boundingBox=backendReply.boundingBox;
	// 		extremeScores = backendReply.extremeScores;
	// 		map.data.forEach(function(feature){ff=feature; if (feature.getProperty("type")=="restaurant") {map.data.remove(feature)}});
	// 		map.data.addGeoJson(restaurantsMarkersList);
	// 		ddata=map.data;
	// 		map.data.forEach(function(feature){
	// 			if (feature.getProperty("type")=="restaurant"){
	// 				x= 40-(feature.getProperty("globalScore")-extremeScores[1])/(extremeScores[0]-extremeScores[1])*20;
	// 				y= 1.5*x;
	// 				map.data.overrideStyle(feature, {icon: {
	// 					url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld='+feature.getProperty('globalRank')+'|FF0000|000000',
	// 				scaledSize: new google.maps.Size(x, y)}})
					
					
	// 				var hotSpot = feature.getGeometry().j;
	// 				var heatMapZip = [ {location: hotSpot, weight: feature.getProperty('locationScore')} ];
	// 				var color =[  "#ff0000","#00ff00"    ];

	// 				heatmap = new google.maps.visualization.HeatmapLayer({
	// 					data: heatMapZip,
	// 					radius: 90,
	// 					dissapating: true
	// 				});
	          
	// 				rate = (feature.getProperty('locationScore')-extremeScores[3])/(extremeScores[2]-extremeScores[3]);
	// 				var gradient = [
	// 					'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 0)',
	// 					'rgba('+Math.round(255*rate)+', '+Math.round(255*(1-rate))+', 0, 1)'];
	// 				heatmap.set('gradient', gradient);
	// 				heatmap.setMap(map);
	// 			}

	// 			map.data.addListener('click', function(event){
	// 					var feature= event.feature;
	// 					document.getElementById('name').innerHTML = "<h2>"+feature.getProperty('name')+"</h2>";
	// 					document.getElementById('photo').innerHTML = '<img src="'+feature.getProperty('image_url')+'" alt="'+feature.getProperty('name')+'">';
	// //					document.getElementById('LkS').innerHTML = 'Liking Score: '+feature.getProperty('likingScore');
	// //					document.getElementById('LoS').innerHTML = 'Location Score: '+feature.getProperty('locationScore');
	// //					document.getElementById('GS').innerHTML = 'Global Score: '+feature.getProperty('globalScore');
	// 					var address = feature.getProperty('display_address')[0];
	// 					for (i=1; i<feature.getProperty('display_address').length; i++){
	// 						address+='</br>'+feature.getProperty('display_address')[i];
							
	// 					}
	// 					document.getElementById('address').innerHTML ='<a href="https://www.google.com/maps/place/'+feature.getGeometry().j.lat()+','+feature.getGeometry().j.lng()+'" target="_blank">'+address+'</a>';
	// 					document.getElementById('phone').innerHTML = feature.getProperty('display_phone');
						
				  
			// });	
			// })		
			console.log("Test 1");
			return response;
			

	}).error(function(data) {
		console.log(data)
	})).done( function(){
		
		console.log("Test 2");
		return response;
  //your code to be executed after 1 second\
  		
		
	}
	);

	// setTimeout(function() {
	// 	console.log(response)
 //  		return response
	// }, 5000);
// 	response= {
// 	"restaurantList":{ 
// 		"type": "FeatureCollection",
// 		"features": [		
// 			{
// 				"type": "Feature",
// 				"properties": {
// 						"likingScore":12,
// 						"locationScore":1,
// 						"globalScore":5,
// 						"globalRank": 2,
// 						"name":"Yeah! Burger",
// 						"url":"http://www.yelp.com/biz/yeah-burger-atlanta?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=8_IetmWvrKXrq5tvUd_Usg",
// 						"image_url":"https://s3-media3.fl.yelpcdn.com/bphoto/r7McwP_a49RSGuTUyRQZPQ/ms.jpg",
// 						"display_phone":"+1-404-496-4393",
// 						"display_address":["1168 Howell Mill Rd","Ste E","Westside / Home Park","Atlanta, GA 30318"],
						
// 						"type":"restaurant",
// 					},
// 				"geometry": {
// 						"type": "Point",
// 						"coordinates": [-84.41226 , 33.78551]
// 						}
// 			},
// 			{
// 				"type": "Feature",
// 				"properties": {
// 						"likingScore":12,
// 						"locationScore":14,
// 						"globalScore":13,
// 						"globalRank": 1,
// 						"name":"Cook-Out",
// 						"url": "http://www.yelp.com/biz/cook-out-atlanta-4?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=8_IetmWvrKXrq5tvUd_Usg",
// 						"image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/4r4T22HzKF23dvOzkzaH1w/ms.jpg", 
// 						"display_phone": "+1-404-815-1801", 
// 						"display_address": ["1800 Northside Dr SW","Westside / Home Park","Atlanta, GA 30318"], 
						
// 						"type":"restaurant",
						
// 					},
// 				"geometry": {
// 						"type": "Point",
// 						"coordinates": [ -84.4077989877427 , 33.7858644889448]
// 						}
// 			}
// 		]
// 	},
// 	"boundingBox":{
// 		"lngsw":-84.40,
// 		"latsw":33.75,
// 		"lngne":-84.30,
// 		"latne":34.75,
// 	},
// 	"extremeScores": [5,13,1,14,1,12],
// }
	
	console.log("Test 3");

	// return response
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