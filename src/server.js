const http = require('http');
const config = require('./config');
const app = require('./app');
const socketio = require('socket.io');
const oh = require('./util/objectHolder');
const server = http.createServer(app);
const io = socketio(server);

oh.add('socket', io);
io.on('connection', require('./events'));

server.listen(config.env.port, () => {
  console.log(`listening on http://localhost:${config.env.port}`);
});
