#!/bin/sh

cd /srv/projet-raid/
echo "#######Updating repository##########"
git pull
echo "#######Rebuilding Collect Server####"
cd srv_collecte/Srv_Collecte/srv-collecte
mvn install
echo "#######Launching Collect Server####"
kill -KILL $(cat /var/run/collect.pid)
java -jar target/Srv-Collecte.jar &> /var/log/collect.log &
echo $! > /var/run/collect.pid
echo "#######Updating Django Server####"
touch /etc/uwsgi.d/raid-django.ini
