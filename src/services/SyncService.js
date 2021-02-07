class SyncService {
  constructor({
    logger,
    socket,
    emailService,
    productRepository,
    jumpsellerService,
    categoryRepository,
    cacheService
  }) {
    this.logger = logger;
    this.socket = socket;
    this.emailService = emailService;
    this.productsRepository = productRepository;
    this.jumpsellerService = jumpsellerService;
    this.categoryRepository = categoryRepository;
    this.cacheService = cacheService;
  }

  async startSync() {
    const disposeListener = this.jumpsellerService.addListener((message) => {
      this.socket.emit('sync:notify', {
        message,
        updateLastNotification: true
      })
    });
    const categoriesToFetch = await this.categoryRepository.findAll();
    const productsToUse = await this.productsRepository.findByRegisteredCategories(categoriesToFetch);
    const categoriesToFetchOrCreate = productsToUse.map(product => product.category);

    this.logger.info('trying to syncronize the products on jumpseller');

    await this.cacheCategoriesAndProducts();
    await this.saveNewCategories(categoriesToFetchOrCreate);
    await this.saveNewProducts(productsToUse);

    disposeListener();

    this.socket.emit('sync:notify', { message: 'tarea terminada, por favor revisa los productos y categorias actualizados' });
    await this.emailService.sendEmail(productsToUse);

    return true;
  }

  async cacheCategoriesAndProducts() {
    this.logger.info('getting all categories and products from jumpseller');
    this.socket.emit('sync:notify', { message: 'rescatando los productos anteriormente guardados en jumpseller' });

    const [jumpsellerCategories, jumpsellerProducts] = await Promise.all([
      this.jumpsellerService.findAllCategories(),
      this.jumpsellerService.findAllProducts()
    ]);

    this.logger.info('now adding new categories and products to mongo');
    this.socket.emit('sync:notify', { message: 'revisando si hay categorias nuevas para agregar a jumpseller' });
    this.socket.emit('sync:notify', { message: 'preparando los productos y categorias' });

    this.cacheService.cacheCategories(jumpsellerCategories);
    this.cacheService.cacheProducts(jumpsellerProducts);
  }

  async saveNewCategories(categoriesToFetchOrCreate) {
    this.logger.info('getting all categories from products');
    this.socket.emit('sync:notify', { message: 'agrupando las categorias de los productos nuevos' });
    this.logger.info('initializing fetch/creation of categories');

    const totalCategories = categoriesToFetchOrCreate.length;
    this.logger.info('there are %d categories to process', totalCategories);

    for (let i = 0; i < totalCategories; i++) {
      this.logger.debug('processing category %d of %d', i + 1, totalCategories);
      this.socket.emit('sync:notify', {
        message: `procesando posible categoria ${i + 1} de ${totalCategories}`,
        updateLastNotification: true
      });
      await this.jumpsellerService.fetchOrAddCategory(categoriesToFetchOrCreate[i]);
    }

    this.socket.emit('sync:notify', { message: 'categorias guardadas' });
  }

  async saveNewProducts(productsToUse) {
    const totalProducts = productsToUse.length;

    this.logger.info('There are %d products to process', totalProducts);

    for (let i = 0; i < totalProducts; i++) {
      this.logger.debug('processing product %d of %d', i + 1, totalProducts);
      this.socket.emit('sync:notify', {
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
}

module.exports = SyncService;
