from django.db import models

# Create your models here.
from django.db import models

class Tracker(models.Model):
	model = models.CharField(maxlength=50)
	id = models.IntegerField()

class Person(models.Model):
	id = models.IntegerField()
	firstname = models.CharField(32)
	lastname = models.CharField(32)

class Location(models.Model):
	tracker = models.ForeignKey(Tracker)
	latitude = models.DecimalField()
	longitude = models.DecimalField()
	time = models.DateField()
