# coding=utf-8

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from models import Tracker


def home(request):
    return render_to_response('index.html')


def last_positions(request):
    liste_trackers = Tracker.objects.order_by('created_date')[10]
    return render_to_response('last_positions.html', {'liste_trackers': liste_trackers})

