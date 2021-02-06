const logger = require('../../util/logger');
const ProductRepository = require('../../repositories/ProductRepository');
const RevenueRepository = require('../../repositories/RevenueRepository');
const CategoryRepository = require('../../repositories/CategoryRepository');
const TempProductsRepository = require('../../repositories/TempProductsRepository');
const JumpsellerService = require('../../services/JumpsellerService');
const CacheService = require('../../services/CacheService');
const EmailService = require('../../services/EmailService');
const container = require('./ioc');

container.add('logger', logger);

container.register('emailService', () => new EmailService());
container.register('productRepository', () => new ProductRepository());
container.register('revenueRepository', () => new RevenueRepository());
container.register('categoryRepository', () => new CategoryRepository());
container.register('tempProductsRepository', () => new TempProductsRepository());
container.register('cacheService', () => new CacheService());

container.register('jumpsellerService', () => {
  const tempProductsRepository = container.get('tempProductsRepository');
  const cacheService = container.get('cacheService');

  return new JumpsellerService(logger, tempProductsRepository, cacheService);
});


module.exports = container;
