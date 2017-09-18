#!/bin/bash
cd /opt/pwebsite
node=`ps -ef | grep node | grep 'bin/www' | awk '{print $2}'`
echo ${node}
kill -9 ${node};
export NODE_ENV=production && nohup sh run.sh >/dev/null 2>&1 &
