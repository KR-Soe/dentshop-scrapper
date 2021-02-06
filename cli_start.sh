#!/bin/bash

export NODE_ENV=production
export API_LOGIN=18e471655ecb112469964198b07e676e
export API_AUTH_TOKEN=09d1ef21ed1a6660b314f65f70beb412
export PINO_LOG_LEVEL=info
export APP_PORT=9090
export MAIL_OWNER=dospuntodos2021@gmail.com
export MAIL_PASSWORD=dospuntodos20212022
export MAIL_USER=dospuntodos2021@gmail.com

directory_name=$(dirname $BASH_SOURCE)
format_date=$(date +"%Y-%m-%d")
log_name="/tmp/$format_date-log.log"

cd $directory_name

node src/cli.js > $log_name
