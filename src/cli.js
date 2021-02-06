const { waitFor } = require('./util/timers');
const container = require('./util/container');
const SyncService = require('./services/SyncService');

async function main() {
  await waitFor(1000);

  const logger = container.get('logger');
  const emailService = container.get('emailService');
  const productRepository = container.get('productRepository');
  const categoryRepository = container.get('categoryRepository');
  const cacheService = container.get('cacheService');
  const jumpsellerService = container.get('jumpsellerService');

  const socket = {
    emit: () => null
  };

  const syncService = new SyncService({
    logger,
    socket,
    emailService,
    productRepository,
    jumpsellerService,
    categoryRepository,
    cacheService
  });

  syncService.startSync();
}

main();
