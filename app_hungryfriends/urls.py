from django.conf.urls import url
import view

urlpatterns = [
    url(r'^$', view.index, name='index'),
]
