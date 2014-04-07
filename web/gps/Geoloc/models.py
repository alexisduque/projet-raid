from django.db import models

# Create your models here.
from django.db import models

class Tracker(models.Model):
	model = models.CharField(max_length=50)
	id = models.IntegerField(primary_key=True)

class Person(models.Model):
	id = models.IntegerField(primary_key=True)
	firstname = models.CharField(max_length=32)
	lastname = models.CharField(max_length=32)

class Location(models.Model):
	tracker = models.ForeignKey(Tracker)
	latitude = models.FloatField()
	longitude = models.FloatField()
	time = models.DateField()
