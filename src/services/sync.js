const productsRepository = require('../repositories/products');
const jumpsellerService = require('./jumpseller');


class SyncService {
  constructor(logger, socket) {
    this.logger = logger;
    this.socket = socket;
  }

  async startSync() {
    jumpsellerService.setLogger(this.logger);
    const productsToUse = await productsRepository.findAll();
    const categoriesToFetchOrCreate = productsToUse.map(product => product.category);

    this.logger.info('trying to syncronize the products on jumpseller');

    await this.cacheCategoriesAndProducts();
    await this.saveNewCategories(categoriesToFetchOrCreate);
    await this.saveNewProducts(productsToUse);

    await productsRepository.deleteAll();

    socket.emit('notify', { message: 'tarea terminada, por favor revisa los productos y categorias actualizados' });
    return true;
  }

  async cacheCategoriesAndProducts() {
    this.logger.info('getting all categories and products from jumpseller');
    this.socket.emit('notify', { message: 'rescatando los productos anteriormente guardados en jumpseller' });

    const [jumpsellerCategories, jumpsellerProducts] = await Promise.all([
      jumpsellerService.findAllCategories(),
      jumpsellerService.findAllProducts()
    ]);

    this.logger.info('now adding new categories and products to mongo');
    this.socket.emit('notify', { message: 'revisando si hay categorias nuevas para agregar a jumpseller' });
    this.socket.emit('notify', { message: 'preparando los productos y categorias' });

    jumpsellerService.cacheCategories(jumpsellerCategories);
    jumpsellerService.cacheProducts(jumpsellerProducts);
  }

  async saveNewCategories(categoriesToFetchOrCreate) {
    this.logger.info('getting all categories from products');
    this.socket.emit('notify', { message: 'agrupando las categorias de los productos nuevos' });
    this.logger.info('initializing fetch/creation of categories');

    const totalCategories = categoriesToFetchOrCreate.length;

    for (let i = 0; i < totalCategories; i++) {
      this.logger.debug('processing category %d of %d', i + 1, totalCategories);
      this.socket.emit('notify', {
        message: `procesando posible categoria ${i + 1} de ${totalCategories}`,
        updateLastNotification: true
      });
      const cat = categoriesToFetchOrCreate[i];
      await jumpsellerService.fetchOrAddCategory(cat);
    }

    this.socket.emit('notify', { message: 'categorias guardadas' });
  }

  async saveNewProducts(productsToUse) {
    const totalProducts = productsToUse.length;

    for (let i = 0; i < totalProducts; i++) {
      this.logger.debug('processing product %d of %d', i + 1, totalProducts);
      this.socket.emit('notify', {
        message: `procesando producto ${i + 1} de ${totalProducts}`,
        updateLastNotification: true
      });

      try {
        await jumpsellerService.updateOrAddProduct(productsToUse[i]);
      } catch(err) {
        this.logger.error(err);
      }
    }
  }
}

module.exports = (logger, socket) => {
  const service = new SyncService(logger, socket);
  return service.startSync();
};
