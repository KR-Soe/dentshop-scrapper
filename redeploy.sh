./node_modules/.bin/pm2 stop server
./node_modules/.bin/pm2 delete server

git fetch
git pull

export NODE_ENV=production
export API_LOGIN=18e471655ecb112469964198b07e676e
export API_AUTH_TOKEN=09d1ef21ed1a6660b314f65f70beb412
export PINO_LOG_LEVEL=debug
export APP_PORT=9090
export MAIL_OWNER=dospuntodos2021@gmail.com
export MAIL_PASSWORD=dospuntodos20212022
export MAIL_USER=dospuntodos2021@gmail.com
export SYNC_FILTER_PRODUCTS=off
export SYNC_AUTO_UPDATE_PRICES=off
export SYNC_WITHOUT_CATEGORY=on

./node_modules/.bin/pm2 start src/server.js
