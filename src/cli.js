const { waitFor } = require('./util/timers');
const container = require('./util/container');
const SyncService = require('./services/SyncService');
const config = require('./config');

async function main() {
  await waitFor(1000);

  const logger = container.get('logger');
  logger.info('this is the cli configuration %j', config);

  const socket = {
    emit: () => null
  };

  const syncService = new SyncService({
    logger,
    socket,
    container,
    filterProductsByCategories: config.features.syncFilterProducts
  });

  await syncService.startSync();
  process.exit(0);
}

main();
