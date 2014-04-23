# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#     * Rearrange models' order
#     * Make sure each model has one field with primary_key=True
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [appname]'
# into your database.
from __future__ import unicode_literals

from django.db import models


class GpsPositions(models.Model):
    id = models.CharField(max_length=30)
    time_stp = models.DateTimeField()
    longitude = models.DecimalField(max_digits=22, decimal_places=6)
    latitude = models.DecimalField(max_digits=22, decimal_places=6)
    altitude = models.DecimalField(max_digits=22, decimal_places=2)
    speed = models.DecimalField(null=True, max_digits=10, decimal_places=0, blank=True)
    heading = models.DecimalField(null=True, max_digits=10, decimal_places=0, blank=True)
    created_date = models.DateTimeField()
    nbsat = models.IntegerField()
    class Meta:
        db_table = 'gps_positions'

class Location(models.Model):
    tracker = models.TextField(blank=True) # This field type is a guess.
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)
    speed = models.SmallIntegerField(null=True, blank=True)
    heading = models.SmallIntegerField(null=True, blank=True)
    time = models.DateField(null=True, blank=True)
    id_tracker = models.ForeignKey('Tracker', null=True, db_column='id_tracker', blank=True)
    class Meta:
        db_table = 'location'

class Path(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    name = models.CharField(max_length=32, blank=True)
    description = models.CharField(max_length=128, blank=True)
    class Meta:
        db_table = 'path'

class Person(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    firstname = models.CharField(max_length=32, blank=True)
    lastname = models.CharField(max_length=32, blank=True)
    blood_group = models.CharField(max_length=4, blank=True)
    phone = models.CharField(max_length=16, blank=True)
    id_team = models.ForeignKey('Team', null=True, db_column='id_team', blank=True)
    id_role = models.ForeignKey('Role', unique=True, null=True, db_column='id_role', blank=True)
    class Meta:
        db_table = 'person'

class Poi(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    rank = models.SmallIntegerField(null=True, blank=True)
    name = models.CharField(max_length=32, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)
    id_path = models.ForeignKey(Path, null=True, db_column='id_path', blank=True)
    id_point_type = models.SmallIntegerField(null=True, blank=True)
    class Meta:
        db_table = 'poi'

class Role(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    name = models.CharField(max_length=16)
    class Meta:
        db_table = 'role'

class Sim(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    imsi = models.CharField(max_length=16, blank=True)
    phone = models.CharField(max_length=16, blank=True)
    operator = models.CharField(max_length=32, blank=True)
    model = models.CharField(max_length=16, blank=True)
    class_field = models.SmallIntegerField(null=True, db_column='class', blank=True) # Field renamed because it was a Python reserved word.
    class Meta:
        db_table = 'sim'

class Team(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    pseudo = models.CharField(max_length=16, blank=True)
    name = models.CharField(max_length=32, blank=True)
    company = models.CharField(max_length=32, blank=True)
    class Meta:
        db_table = 'team'

class Tracker(models.Model):
    id = models.SmallIntegerField(primary_key=True)
    manufacturer = models.CharField(max_length=32, blank=True)
    model = models.CharField(max_length=32, blank=True)
    id_person = models.ForeignKey(Person, unique=True, null=True, db_column='id_person', blank=True)
    id_sim = models.ForeignKey(Sim, unique=True, null=True, db_column='id_sim', blank=True)
    class Meta:
        db_table = 'tracker'

