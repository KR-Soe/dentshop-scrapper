const http = require('http');
const app = require('./app');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const oh = require('./util/objectHolder');
const syncService = require('./services/sync');

oh.add('socket', io);

io.on('connection', (socket) => {
  const logger = oh.get('logger');
  logger.info('a user connected');

  socket.on('startSync', () => {
    logger.info('starting with the sync !!!');

    syncService(oh.get('logger'), oh.get('socket'))
      .then(result => {
        logger.info(result);
      });
  });

  socket.on('disconnect', () => {
    logger.info('user disconnected');
  });
});

server.listen(9090, () => {
  console.log('listening on http://localhost:9090');
});
