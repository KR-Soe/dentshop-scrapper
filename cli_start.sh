#!/bin/bash

export NODE_ENV=production
export API_LOGIN=18e471655ecb112469964198b07e676e
export API_AUTH_TOKEN=09d1ef21ed1a6660b314f65f70beb412
export PINO_LOG_LEVEL=debug
export APP_PORT=9090
export MAIL_OWNER=dospuntodos2021@gmail.com
export MAIL_PASSWORD=dospuntodos20212022
export MAIL_USER=dospuntodos2021@gmail.com
export SYNC_FILTER_PRODUCTS=off

directory_name=$(dirname $BASH_SOURCE)
format_date=$(date +"%Y-%m-%d")
logfile="/tmp/$format_date-log.log"
errorfile="/tmp/$format_date-errors.log"

cd $directory_name

node src/cli.js | ./node_modules/.bin/pino-pretty -t > $logfile 2> $errorfile
# node src/cli.js | ./node_modules/.bin/pino-pretty -t
