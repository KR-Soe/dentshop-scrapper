const config = require('../config');
const container = require('../util/container');
const EventManager = require('./EventManager');
const SyncService = require('../services/SyncService');


const createSocketHandler = (socket) => {
  const logger = container.get('logger');

  logger.info('a user connected');

  const syncService = new SyncService({
    container,
    socket,
    logger,
    socket,
    filterProductsByCategories: config.features.syncFilterProducts
  });

  const eventManager = new EventManager({
    container,
    socket,
    logger,
    syncService
  });

  eventManager.connect();

  socket.on('disconnect', () => {
    logger.info('user disconnected');
  });
};


module.exports = createSocketHandler;
