const logger = require('../../util/logger');
const ProductRepository = require('../../repositories/ProductRepository');
const RevenueRepository = require('../../repositories/RevenueRepository');
const CategoryRepository = require('../../repositories/CategoryRepository');
const TempProductsRepository = require('../../repositories/TempProductsRepository');
const SyncService = require('../../services/SyncService');
const JumpsellerService = require('../../services/JumpsellerService');
const CacheService = require('../../services/CacheService');
const emailService = require('../../services/mailer');
const container = require('./ioc');

container.add('emailService', emailService);
container.add('logger', logger);

container.register('productRepository', () => new ProductRepository());
container.register('revenueRepository', () => new RevenueRepository());
container.register('categoryRepository', () => new CategoryRepository());
container.register('tempProductsRepository', () => new TempProductsRepository());
container.register('cacheService', () => new CacheService());

container.register('syncService', () => {
  const mailService = container.get('emailService');
  return new SyncService(logger, socket, mailService);
});

container.register('jumpsellerService', () => {
  const tempProductsRepository = container.get('tempProductsRepository');
  const cacheService = container.get('cacheService');

  return new JumpsellerService(logger, tempProductsRepository, cacheService);
});


module.exports = container;
