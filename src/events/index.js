const container = require('../util/container');
const EventManager = require('./EventManager');
const SyncService = require('../services/SyncService');


const createSocketHandler = (socket) => {
  const logger = container.get('logger');
  const emailService = container.get('emailService');
  const revenueRepository = container.get('revenueRepository');
  const categoryRepository = container.get('categoryRepository');
  const productRepository = container.get('productRepository');
  const jumpsellerService = container.get('jumpsellerService');
  const cacheService = container.get('cacheService');
  const pricingService = container.get('pricingService');

  logger.info('a user connected');

  const syncService = new SyncService({
    logger,
    socket,
    emailService,
    productRepository,
    jumpsellerService,
    categoryRepository,
    cacheService
  });

  const eventManager = new EventManager({
    socket,
    logger,
    syncService,
    revenueRepository,
    categoryRepository,
    pricingService
  });

  eventManager.connect();

  socket.on('disconnect', () => {
    logger.info('user disconnected');
  });
};


module.exports = createSocketHandler;
