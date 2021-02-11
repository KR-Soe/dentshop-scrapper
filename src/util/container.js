const container = require('@opencasa/ioc');
const logger = require('../util/logger');
const ProductRepository = require('../repositories/ProductRepository');
const RevenueRepository = require('../repositories/RevenueRepository');
const CategoryRepository = require('../repositories/CategoryRepository');
const TempProductsRepository = require('../repositories/TempProductsRepository');
const ErrorsRepository = require('../repositories/ErrorsRepository');
const JumpsellerService = require('../services/JumpsellerService');
const CacheService = require('../services/CacheService');
const EmailService = require('../services/EmailService');
const PricingService = require('../services/PricingService');

container.add('logger', logger);
container.register('emailService', () => new EmailService());
container.register('productRepository', () => new ProductRepository());
container.register('revenueRepository', () => new RevenueRepository());
container.register('categoryRepository', () => new CategoryRepository());
container.register('tempProductsRepository', () => new TempProductsRepository());
container.register('errorRepository', () => new ErrorsRepository());
container.register('cacheService', () => new CacheService());
container.register('pricingService', () => new PricingService(1.5));

container.register(
  'jumpsellerService',
  (logger, tempProductsRepository, cacheService, pricingService) => {
    return new JumpsellerService(
      logger,
      tempProductsRepository,
      cacheService,
      pricingService
    );
  },
  ['logger', 'tempProductsRepository', 'cacheService', 'pricingService']
);

async function injectAsyncDependencies() {
  const revenueRepository = container.get('revenueRepository');

  revenueRepository.emitter.on('dbConnection:injected', async () => {
    const currentRevenue = await revenueRepository.getCurrentRevenue();
    const pricingService = container.get('pricingService');
    pricingService.setRevenue(currentRevenue.value);
  });
}

injectAsyncDependencies();

module.exports = container;
