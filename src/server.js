const http = require('http');
const config = require('./config');
const app = require('./app');
const socketio = require('socket.io');
const oh = require('./util/objectHolder');
const EventManager = require('./events');
const server = http.createServer(app);
const io = socketio(server);

oh.add('socket', io);

io.on('connection', (socket) => {
  const logger = oh.get('logger');
  logger.info('a user connected');

  new EventManager(socket, logger).connect();

  socket.on('disconnect', () => {
    logger.info('user disconnected');
  });
});

server.listen(config.env.port, () => {
  console.log(`listening on http://localhost:${config.env.port}`);
});
