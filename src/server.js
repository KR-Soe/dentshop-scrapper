const http = require('http');
const config = require('./config');
const app = require('./app');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', require('./events'));

server.listen(config.env.port, () => {
  console.log(`listening on http://localhost:${config.env.port}`);
});
