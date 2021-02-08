const request = require('./request');
const config = require('../config');
const requestpool = require('../util/requestpool');
const Product = require('../dto/product');
const { apiLogin, authToken } = config.jumpSeller;
const { prop } = require('../util/funcs');

const urls = {
  PRODUCTS: `https://api.jumpseller.com/v1/products.json?login=${apiLogin}&authtoken=${authToken}`,
  CATEGORIES: `https://api.jumpseller.com/v1/categories.json?login=${apiLogin}&authtoken=${authToken}`,
  PRODUCT_COUNT: `https://api.jumpseller.com/v1/products/count.json?login=${apiLogin}&authtoken=${authToken}`,
  PRODUCTS_UPDATABLE: (id) => `https://api.jumpseller.com/v1/products/${id}.json?login=${apiLogin}&authtoken=${authToken}`,
  IMAGES: (id) => `https://api.jumpseller.com/v1/products/${id}/images.json?login=${apiLogin}&authtoken=${authToken}`
};


class JumpsellerService {
  constructor(logger, tempProductsRepository, cacheService, pricingService) {
    this.logger = logger;
    this.tempProductsRepository = tempProductsRepository;
    this.cacheService = cacheService;
    this.pricingService = pricingService;
    this.listeners = [];
    this.platformsCount = {};
  }

  addListener(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners.filter(fn => fn !== listener);
    };
  }

  _notify(message) {
    this.listeners.forEach((listener) => listener(message));
  }

  _addPlatformCount(platform) {
    if (!this.platformsCount[platform]) {
      this.platformsCount[platform] = 0;
    }

    this.platformsCount[platform] += 1;
  }

  async findAllProducts() {
    const result = await requestpool.add(() => request.get(urls.PRODUCT_COUNT).json());
    const PRODUCTS_PER_PAGE = 100;
    const totalPages = Math.ceil(Number.parseInt(result.count) / PRODUCTS_PER_PAGE);
    let products = [];

    this.logger.debug('how many products are in jumpseller %d', result.count);
    this.logger.debug('how many pages we need to fetch %d', totalPages);

    for (let i = 1; i <= totalPages; i++) {
      const message = `fetching page ${i} of ${totalPages}`;
      this.logger.debug(message);
      this._notify(message);
      const url = `${urls.PRODUCTS}&limit=${PRODUCTS_PER_PAGE}&page=${i}`;
      const results = await requestpool.add(() => request.get(url).json());
      products = products.concat(results.map(prop('product')));
    }

    return products;
  }

  findAllCategories() {
    return requestpool
      .add(() => request.get(urls.CATEGORIES).json());
  }

  fetchOrAddCategory(categoryNames) {
    let categories = categoryNames;

    if (!Array.isArray(categoryNames)) {
      categories = categoryNames.split(',').map(cat => cat.trim());
    }

    return Promise.all(categories.map(categoryName => this._getCategory(categoryName)));
  }

  async updateOrAddProduct(product) {
    const cache = this.cacheService.get('product');
    const newPrice = product.revenuePrice ?
      product.revenuePrice :
      this.pricingService.calculatePriceWithRevenue(product.internetPrice);

    if (cache.has(product.title)) {
      const cachedProduct = cache.get(product.title);
      cachedProduct.price = newPrice;
      cachedProduct.stock = product.stock;
      cachedProduct.description = product.description;
      this._addPlatformCount(product.platformSource);

      return this._updateProduct(cachedProduct);
    }

    const categories = await this.fetchOrAddCategory(product.category);
    const productToSave = new Product();

    productToSave.name = product.title;
    productToSave.price = newPrice;
    productToSave.stock = product.stock;
    productToSave.sku = product.sku;
    productToSave.brand = product.brand;
    productToSave.categories = categories;
    productToSave.description = product.description;
    productToSave.barcode = product.referUrl

    try {
      const retrievedProduct = await this._addProduct(productToSave.toJSON());
      this._addPlatformCount(product.platformSource);
      const newProduct = retrievedProduct.product;
      await this.tempProductsRepository.save(newProduct);
      cache.set(newProduct.name, product);

      if (product.image) {
        await Promise.all(
          product.image.split(',')
            .filter(x => x.trim())
            .map(image => this._addProductImage(newProduct.id, image))
        );
      }
    } catch (err) {
      console.log('err', productToSave.toJSON());
      this.logger.error('this was the payload %j', productToSave.toJSON());
      throw err;
    }
  }

  _updateProduct(data) {
    const payload = {
      description: data.description,
      price: data.price,
      stock: data.stock
    };

    const options = { json: { product: payload } };
    const url = urls.PRODUCTS_UPDATABLE(data.id);

    return requestpool
      .add(() => request.put(url, options).json())
  }

  _addProduct(data) {
    const options = { json: { product: data } };

    return requestpool
      .add(() => request.post(urls.PRODUCTS, options).json());
  }

  _addCategory(name) {
    const payload = {category: { name }};
    const options = {json: payload};

    return requestpool
      .add(() => request.post(urls.CATEGORIES, options).json());
  }

  _addProductImage(id, image) {
    const payload = { image: { url: image }};
    const options = { json: payload };
    const url = urls.IMAGES(id);

    return requestpool
      .add(() => request.post(url, options).json())
      .catch(() => {
        console.log('url', url);
        console.log('payload', JSON.stringify(payload));
      });
  }

  async _createCategory(categoryName) {
    const newCategory = await this._addCategory(categoryName);
    this.cacheService.get('category').set(categoryName, newCategory.category);
    return newCategory.category;
  }

  async _getCategory(categoryName) {
    const cache = this.cacheService.get('category');

    if (cache.has(categoryName)) {
      return cache.get(categoryName);
    }

    cache.set(categoryName, this._createCategory(categoryName));
    return cache.get(categoryName);
  }
}


module.exports = JumpsellerService;
