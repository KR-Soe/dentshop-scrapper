const EventTypes = require('../events/eventTypes');


class SyncService {
  constructor({ container, logger, socket, filterProductsByCategories }) {
    this.logger = logger;
    this.socket = socket;
    this.emailService = container.get('emailService');
    this.productsRepository = container.get('productRepository');
    this.jumpsellerService = container.get('jumpsellerService');
    this.categoryRepository = container.get('categoryRepository');
    this.cacheService = container.get('cacheService');
    this.errorRepository = container.get('errorRepository');
    this.filterProductsByCategories = filterProductsByCategories || false;
  }

  async startSync() {
    this._attachEventListeners();

    let productsToUse;

    if (this.filterProductsByCategories) {
      const categoriesToFetch = await this.categoryRepository.findAll();
      productsToUse = await this.productsRepository.findByRegisteredCategories(categoriesToFetch);
    } else {
      productsToUse = await this.productsRepository.findAll();
    }

    const categoriesToFetchOrCreate = productsToUse.map(product => product.category);

    this.logger.info('trying to syncronize the products on jumpseller');

    await this.cacheCategoriesAndProducts();
    await this.saveNewCategories(categoriesToFetchOrCreate);
    await this.saveNewProducts(productsToUse);

    this._detachEventListeners();

    const platformsCount = this.jumpsellerService.platformsCount;

    this.socket.emit(EventTypes.SYNC_NOTIFY, {
      message: 'tarea terminada, por favor revisa los productos y categorias actualizados'
    });

    await this.emailService.sendEmail(productsToUse, platformsCount);
    return true;
  }

  async cacheCategoriesAndProducts() {
    this.logger.info('getting all categories and products from jumpseller');
    this.socket.emit(EventTypes.SYNC_NOTIFY, {
      message: 'rescatando los productos anteriormente guardados en jumpseller'
    });

    const [jumpsellerCategories, jumpsellerProducts] = await Promise.all([
      this.jumpsellerService.findAllCategories(),
      this.jumpsellerService.findAllProducts()
    ]);

    this.logger.info('now adding new categories and products to mongo');
    this.socket.emit(EventTypes.SYNC_NOTIFY, {
      message: 'revisando si hay categorias nuevas para agregar a jumpseller'
    });
    this.socket.emit(EventTypes.SYNC_NOTIFY, {
      message: 'preparando los productos y categorias'
    });

    this.cacheService.cacheCategories(jumpsellerCategories);
    this.cacheService.cacheProducts(jumpsellerProducts);
  }

  async saveNewCategories(categoriesToFetchOrCreate) {
    this.logger.info('getting all categories from products');
    this.socket.emit(EventTypes.SYNC_NOTIFY, {
      message: 'agrupando las categorias de los productos nuevos'
    });
    this.logger.info('initializing fetch/creation of categories');

    const totalCategories = categoriesToFetchOrCreate.length;
    this.logger.info('there are %d categories to process', totalCategories);

    for (let i = 0; i < totalCategories; i++) {
      this.logger.debug('processing category %d of %d', i + 1, totalCategories);
      this.socket.emit(EventTypes.SYNC_NOTIFY, {
        message: `procesando posible categoria ${i + 1} de ${totalCategories}`,
        updateLastNotification: true
      });
      await this.jumpsellerService.fetchOrAddCategory(categoriesToFetchOrCreate[i]);
    }

    this.socket.emit(EventTypes.SYNC_NOTIFY, { message: 'categorias guardadas' });
  }

  async saveNewProducts(productsToUse) {
    const totalProducts = productsToUse.length;

    this.logger.info('There are %d products to process', totalProducts);

    for (let i = 0; i < totalProducts; i++) {
      this.logger.debug('processing product %d of %d', i + 1, totalProducts);
      this.socket.emit(EventTypes.SYNC_NOTIFY, {
        message: `procesando producto ${i + 1} de ${totalProducts}`,
        updateLastNotification: true
      });

      try {
        await this.jumpsellerService.updateOrAddProduct(productsToUse[i]);
        await this.productsRepository.remove(productsToUse[i]);
      } catch(err) {
        console.log('err', err);
        this.logger.error(err);
      }
    }
  }

  _attachEventListeners() {
    this._onNotifySync = (message) => {
      this.socket.emit(EventTypes.SYNC_NOTIFY, {
        message,
        updateLastNotification: true
      });
    };

    this._onNotifyError = (url, payload) => {
      console.log('this is the error', payload);
      console.log('this is the nigga', url);
    };

    this.jumpsellerService.on(EventTypes.SYNC_NOTIFY, this._onNotifySync);
    this.jumpsellerService.on(EventTypes.SYNC_ERROR, this._onNotifyError);
  }

  _detachEventListeners() {
    this.jumpsellerService.removeListener(EventTypes.SYNC_NOTIFY, this._onNotifySync);
    this.jumpsellerService.removeListener(EventTypes.SYNC_ERROR, this._onNotifyError);
  }
}


module.exports = SyncService;
