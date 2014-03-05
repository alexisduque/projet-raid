# Create your views here.
from django.http import HttpResponse
def home(request):
  text = """<h1>Bienvenue sur notre site web !</h1>
            <p>Les crepes bretonnes ça tue des mouettes en plein vol !</p>"""
  return HttpResponse(text)
