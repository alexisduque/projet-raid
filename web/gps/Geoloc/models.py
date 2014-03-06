from django.db import models

# Create your models here.
from django.db import models

class Tracker(models.Model):
	nom = models.CharField(maxlength=50)
	date = models.DateField()

