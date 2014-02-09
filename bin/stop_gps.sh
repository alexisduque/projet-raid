#!/bin/bash
#
# Stop le server lancé en arrière plan
#

echo 'Le serveur sera stoppé ...';
for KILLPID in `ps ax | grep 'srv-collecte' | grep -v 'grep' | awk ' { print $1;}'`; do 
  echo 'Serveur PID :' $KILLPID;
  kill -9 $KILLPID;
  echo 'Server stoppé';
done
