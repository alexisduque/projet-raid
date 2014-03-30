# Create your views here.
from django.http import HttpResponse


def home(request):
    text = """<h1>Bienvenue sur notre site web !</h1>
            <p>Les crepes bretonnes ça tue des mouettes en plein vol !</p>"""
    return HttpResponse(text)

from django.shortcuts import render_to_response
from models import Tracker


def last_positions(request):
    liste_trackers = Tracker.objects.order_by('created_date')[10]
    return render_to_response('last_positions.html', {'liste_trackers': liste_trackers})

