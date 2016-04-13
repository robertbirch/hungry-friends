from django.shortcuts import render
from django.htpp import HttpResponse, Http404

# Create your views here.
def index(request):
    return render(request, 'app_hungryfriends/index.html")
