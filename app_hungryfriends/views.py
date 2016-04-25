from django.shortcuts import render
from django.http import HttpResponse, Http404
import numpy
import math

# Create your views here.
def index(request):
    return render(request, 'app_hungryfriends/index.html')

def search_yelp(request):
	
	data = json.loads(request.GET.get('data', None))

	locations = data['locations']

	# getting list of points that make convex hull
	hull = qhull(locations)

	# deleting last point because it is the same as the first
	hull = hull[:-1]

	centroid = centeroidnp(hull)

	# obtained in metres
	radius = smallest_radius(centroid, polygon)

	restaurants = client.search_by_coordinates(__, params)




def smallest_radius(centroid, polygon):
	radius_list = [distance_on_unit_sphere(centroid, point) for point in polygon]
	min_radius = min(radius_list)
	return min_radius

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