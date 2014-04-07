from django.conf.urls import patterns, url

from Geoloc import views

urlpatterns = patterns('',
    url(r'^$', views.home),
    url(r'^last_positions', views.last_positions)
)