from django.shortcuts import render
from django.http import HttpResponse, Http404
from yelp.client import Client
from yelp.oauth1_authenticator import Oauth1Authenticator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.staticfiles.templatetags.staticfiles import static
import os
from scipy.spatial.distance import euclidean
import json
import numpy
import math

# Create your views here.
@csrf_exempt
def index(request):
    return render(request, 'app_hungryfriends/index.html')

@csrf_exempt
def search_yelp(request):
    data = json.loads(request.body)
    locations = data['locations']
    cuisines = data['cuisines']
    print locations
    # getting list of points that make convex hull
    hull = qhull(locations)

    # deleting last point because it is the same as the first
    polygon = hull[:-1]

    centroid = centeroidnp(hull)

    # obtained in metres
    #radius, distance_from_centroid = smallest_radius(centroid, polygon)
    radius, distance_from_centroid = average_radius(centroid, polygon)

    app_dir = os.path.dirname(__file__)
    filepath = os.path.join(app_dir, 'config_yelp.json')
    client = authenticate(filepath)
    params = {}
    params['term'] = 'restaurants'
    params['category_filter'] = ','.join(cuisines)
    params['radius_filter'] = radius
    params['sort'] = 2

    print ','.join(cuisines)
    print
    pref = float(data['preference'])/10

    new_centroid = [centroid[1], centroid[0]]
    response = client.search_by_coordinates(new_centroid[0], new_centroid[1], **params)
    rest_json = build_json(response.businesses, cuisines, new_centroid, pref, distance_from_centroid)
    rest_json['boundingBox'] = getBoundingBox(response.businesses)
    #print rest_json, "========================="
    return HttpResponse(json.dumps(rest_json), content_type="application/json")
    # assign_scores(restaurants)

def authenticate(config_json):
    with open(config_json) as cred:
        creds = json.load(cred)
        auth = Oauth1Authenticator(**creds)
        return Client(auth)

def getBoundingBox(restaurants):
    lats = []
    lngs = []
    for rest in restaurants:
        lats.append(rest.location.coordinate.latitude)
        lngs.append(rest.location.coordinate.longitude)

    lats = sorted(lats)
    lngs = sorted(lngs)
    boundingbox = {"east": lngs[-1], 
                   "west": lngs[0], 
                   "south": lats[0],
                   "north": lats[-1]}
    return boundingbox

def build_json(restaurants, cuisines, centroid, pref, distance_from_centroid):
    if type(centroid) != list:
        raise ValueError('centroid must be a list of lat long')
    if pref < 0 or pref > 1:
        raise ValueError('pref must be a decimal between 0 and 1')
    if len(restaurants) == 0:
        raise ValueError("You didn't give me any restaurants!")
    
    ratingImportance = 0.8
    reviewImportance = 0.2

    restaurants = restaurants[:10]

    max_rc = 0
    max_rating = 0
    for rest in restaurants:
        max_rc = rest.review_count if rest.review_count > max_rc else max_rc
        max_rating = rest.rating if rest.rating > max_rating else max_rating

    dist = []
    ys_list = []
    for rest in restaurants:
        rest.yelpScore = (rest.review_count*reviewImportance/max_rc) + \
                (rest.rating*ratingImportance/max_rating)
        ys_list.append(rest.yelpScore)
        coord = [rest.location.coordinate.latitude, \
                rest.location.coordinate.longitude]
        rest.distance = euclidean(centroid, coord) 
        dist.append(rest.distance) 

    max_dist = sorted(dist)[-1]
    ls_list = []
    for rest in restaurants:
        rest.locationScore = 1 - float(rest.distance)/max_dist
        ls_list.append(rest.locationScore)

    ys_list = sorted(ys_list)
    ls_list = sorted(ls_list)

    gs_list = []
    for rest in restaurants:
        rest.globalScore = ((1-pref)*rest.yelpScore) + (pref*rest.locationScore)
        gs_list.append(rest.globalScore)

    gs_list = sorted(gs_list)
    
    for rest in restaurants:
        rest.globalRank = len(restaurants) - gs_list.index(rest.globalScore) 

    ret = {}
    ret['restaurantList'] = {'type': 'FeatureCollection'}
    ret['extremeScores'] = [gs_list[0], gs_list[-1], ls_list[0], ls_list[-1], 
            ys_list[0], ys_list[-1]]

    features = []
    for rest in restaurants:
        properties = {}
        geometry = {"type":"Point"}
        properties['type'] = 'restaurant'
        properties['tipcolor'] = cuisines.index(rest.categories[0].alias)
        properties['likingScore'] = rest.yelpScore
        properties['locationScore'] = rest.locationScore
        properties['globalScore'] = rest.globalScore
        properties['globalRank'] = rest.globalRank
        properties['name'] = rest.name
        properties['url'] = rest.url
        properties['image_url'] = rest.image_url
        properties['display_address'] = rest.location.display_address
        coords = rest.location.coordinate
        geometry['coordinates'] = [coords.longitude, coords.latitude]
    
        newRest = {}
        newRest['type'] = 'Feature'
        newRest['properties'] = properties
        newRest['geometry'] = geometry
        features.append(newRest)
        
    ret = {}
    ret['restaurantList'] = {'type': 'FeatureCollection'}
    ret['extremeScores'] = [gs_list[0], gs_list[-1], ls_list[0], ls_list[-1], 
            ys_list[0], ys_list[-1]]    
    ret['restaurantList'].update({"features": features})
    ret['centroid'] = centroid
    ret['centroid_distances'] = distance_from_centroid
    return ret

def smallest_radius(centroid, polygon):
    radius_list = [distance_on_unit_sphere(centroid, point) for point in polygon]
    min_radius = min(radius_list)
    new_radius_list = [[[point[1], point[0]], radius] for point, radius in zip(polygon, radius_list)]
    return min_radius, new_radius_list

def average_radius(centroid, polygon):
    radius_list = [distance_on_unit_sphere(centroid, point) for point in polygon]
    avg_radius = float(sum(radius_list))/len(radius_list)
    new_radius_list = [[[point[1], point[0]], radius] for point, radius in zip(polygon, radius_list)] 
    return avg_radius, new_radius_list

def distance_on_unit_sphere(p0, p1):
    lat1, long1 = p0[0], p0[1]
    lat2, long2 = p1[0], p1[1]

    # Convert latitude and longitude to 
    # spherical coordinates in radians.
    degrees_to_radians = math.pi/180.0
         
    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians
         
    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians
         
    # Compute spherical distance from spherical coordinates.
         
    # For two locations in spherical coordinates 
    # (1, theta, phi) and (1, theta', phi')
    # cosine( arc length ) = 
    #    sin phi sin phi' cos(theta-theta') + cos phi cos phi'
    # distance = rho * arc length
     
    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) +
        math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )
 
    # Remember to multiply arc by the radius of the earth 
    # in your favorite set of units to get length.

    # 6373 converts to km, 1000 to get metres
    return arc*6373*1000

def distance(p0, p1):
    return math.sqrt((p0[0] - p1[0])**2 + (p0[1] - p1[1])**2)

def centeroidnp(arr):
    arr = numpy.array(arr)
    length = arr.shape[0]
    sum_x = numpy.sum(arr[:, 0])
    sum_y = numpy.sum(arr[:, 1])
    return sum_x/length, sum_y/length

def qhull(sample):
    sample = numpy.array(sample)
    link = lambda a,b: numpy.concatenate((a,b[1:]))
    edge = lambda a,b: numpy.concatenate(([a],[b]))

    def dome(sample,base): 
        h, t = base
        dists = numpy.dot(sample-h, numpy.dot(((0,-1),(1,0)),(t-h)))
        outer = numpy.repeat(sample, dists>0, axis=0)
        
        if len(outer):
            pivot = sample[numpy.argmax(dists)]
            return link(dome(outer, edge(h, pivot)),
                        dome(outer, edge(pivot, t)))
        else:
            return base

    if len(sample) > 2:
        axis = sample[:,0]
        base = numpy.take(sample, [numpy.argmin(axis), numpy.argmax(axis)], axis=0)
        return link(dome(sample, base),
                    dome(sample, base[::-1]))
    else:
        return sample
