function locations(cuisine1, cuisine2, cuisine3,searchRadius,friendsLocation) {
 		response= {
	"restaurantList":{ 
		"type": "FeatureCollection",
		"features": [		
			{
				"type": "Feature",
				"properties": {
						"likingScore":12,
						"locationScore":1,
						"globalScore":5,
						"globalRank": 2,
						"name":"Yeah! Burger",
						"url":"http://www.yelp.com/biz/yeah-burger-atlanta?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=8_IetmWvrKXrq5tvUd_Usg",
						"image_url":"https://s3-media3.fl.yelpcdn.com/bphoto/r7McwP_a49RSGuTUyRQZPQ/ms.jpg",
						"display_phone":"+1-404-496-4393",
						"display_address":["1168 Howell Mill Rd","Ste E","Westside / Home Park","Atlanta, GA 30318"],
						
						"type":"restaurant",
					},
				"geometry": {
						"type": "Point",
						"coordinates": [-84.41226 , 33.78551]
						}
			},
			{
				"type": "Feature",
				"properties": {
						"likingScore":12,
						"locationScore":14,
						"globalScore":13,
						"globalRank": 1,
						"name":"Cook-Out",
						"url": "http://www.yelp.com/biz/cook-out-atlanta-4?utm_campaign=yelp_api&utm_medium=api_v2_search&utm_source=8_IetmWvrKXrq5tvUd_Usg",
						"image_url": "https://s3-media4.fl.yelpcdn.com/bphoto/4r4T22HzKF23dvOzkzaH1w/ms.jpg", 
						"display_phone": "+1-404-815-1801", 
						"display_address": ["1800 Northside Dr SW","Westside / Home Park","Atlanta, GA 30318"], 
						
						"type":"restaurant",
						
					},
				"geometry": {
						"type": "Point",
						"coordinates": [ -84.4077989877427 , 33.7858644889448]
						}
			}
		]
	},
	"boundingBox":{
		"lngsw":-84.40,
		"latsw":33.75,
		"lngne":-84.30,
		"latne":34.75,
	},
	"extremeScores": [5,13,1,14,1,12],
}
	

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