#!/bin/bash
cd ~
if [ -f srv*.jar ]
then
	echo 'Suppression du jar';
    rm srv*.jar;
fi

if [ ! -d logs ]
then
	echo 'Creation du repertoire logs';
    mkdir logs;
fi

cd projet-raid
echo 'Pulling repo ...'
git pull
echo 'Pulling done'

cd srv_collecte/Srv_Collecte/srv-collecte/
echo 'Maven cleaning and packaging ...'
mvn clean package
echo 'Packaging done'
cp target/srv-collecte*.jar ~

cd ~
#java -jar srv-collecte-1.0.0-SNAPSHOT.jar
nohup java -jar srv-collecte-1.0.0-SNAPSHOT.jar > logs/gps.out 2> logs/gps.err < /dev/null &

echo 'Collect Serer started'

