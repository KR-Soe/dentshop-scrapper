#!/bin/bash

export NODE_ENV=production
export API_LOGIN=18e471655ecb112469964198b07e676e
export API_AUTH_TOKEN=09d1ef21ed1a6660b314f65f70beb412
export PINO_LOG_LEVEL=info
export APP_PORT=9090

./node_modules/.bin/pm2 start src/server.js
