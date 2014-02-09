#!/bin/bash
#
# Mets à jours les sources depuis le dépot .git
# Package avec Maven
# Copie le jar dans le home
# Lance le serveur en arrière plan avec nohup
#
#  !!! Prévoir d'ajouter sa clé ssh à bitbucket pour le pull !!!
#
#

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

if [ ! -d projet-raid ]
then
	echo 'Clone du repo';
    git clone git@bitbucket.org:teamtcprojetraid/projet-raid.git;
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

