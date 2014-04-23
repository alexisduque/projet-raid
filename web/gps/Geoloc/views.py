# coding=utf-8

# Create your views here.
from django.http import HttpResponse
from django.shortcuts import render_to_response
from models import GpsPositions


def home(request):
    return render_to_response('index.html')


def last_positions(request):
    gpsPositions = GpsPositions.objects.all()
    return render_to_response('last_positions.html', {'positions': gpsPositions})


