const request = require('./request');
const config = require('../config');
const requestpool = require('../util/requestpool');
const syncRepository = require('../repositories/sync');
const Product = require('../dto/product');
const NodeCache = require('node-cache');
const pricingService = require('./pricing');
const { apiLogin, authToken } = config.jumpSeller;

const urls = {
  PRODUCTS: `https://api.jumpseller.com/v1/products.json?login=${apiLogin}&authtoken=${authToken}`,
  CATEGORIES: `https://api.jumpseller.com/v1/categories.json?login=${apiLogin}&authtoken=${authToken}`,
  PRODUCT_COUNT: `https://api.jumpseller.com/v1/products/count.json?login=${apiLogin}&authtoken=${authToken}`,
  PRODUCTS_UPDATABLE: (id) => `https://api.jumpseller.com/v1/products/${id}.json?login=${apiLogin}&authtoken=${authToken}`,
  IMAGES: (id) => `https://api.jumpseller.com/v1/products/${id}/images.json?login=${apiLogin}&authtoken=${authToken}`
};

const categoriesCache = new NodeCache({ stdTTL: 3600 });
const productsCache = new NodeCache({ stdTTL: 3600 });

const service = {
  logger: null,
  setLogger(logger) {
    this.logger = logger;
  },
  async findAllProducts() {
    const result = await requestpool.add(() => request.get(urls.PRODUCT_COUNT).json());
    const PRODUCTS_PER_PAGE = 100;
    const totalPages = Math.ceil(Number.parseInt(result.count) / PRODUCTS_PER_PAGE);
    let products = [];

    this.logger.debug('how many products are in jumpseller %d', result.count);
    this.logger.debug('how many pages we need to fetch %d', totalPages);

    for (let i = 1; i <= totalPages; i++) {
      this.logger.debug('fetching page %d of %d', i, totalPages);
      const url = `${urls.PRODUCTS}&limit=${PRODUCTS_PER_PAGE}&page=${i}`;
      const results = await requestpool.add(() => request.get(url).json());
      products = products.concat(results.map(res => res.product));
    }

    return products;
  },
  findAllCategories() {
    return requestpool
      .add(() => request.get(urls.CATEGORIES).json());
  },
  fetchOrAddCategory(categoryNames) {
    let categories = categoryNames;

    if (!Array.isArray(categoryNames)) {
      categories = categoryNames.split(',').map(cat => cat.trim());
    }

    return Promise.all(categories.map(categoryName => this._getCategory(categoryName)));
  },
  async updateOrAddProduct(product) {
    if (productsCache.has(product.title)) {
      const cachedProduct = productsCache.get(product.title);
      cachedProduct.price = pricingService.calculatePriceWithRevenue(product.internetPrice);
      cachedProduct.stock = product.stock;
      cachedProduct.description = product.description;
      return this._updateProduct(cachedProduct);
    }

    const categories = await this.fetchOrAddCategory(product.category);
    const productToSave = new Product();
    productToSave.name = product.title;
    productToSave.price = pricingService.calculatePriceWithRevenue(product.internetPrice);
    productToSave.stock = product.stock;
    productToSave.sku = product.sku;
    productToSave.brand = product.brand;
    productToSave.categories = categories;
    productToSave.description = product.description;

    try {
      const retrievedProduct = await this._addProduct(productToSave.toJSON());
      const newProduct = retrievedProduct.product;
      await syncRepository.addProduct(newProduct);
      productsCache.set(newProduct.name, product);

      if (product.image) {
        await Promise.all(
          product.image.split(',')
            .filter(x => x.trim())
            .map(image => this._addProductImage(newProduct.id, image))
        );
      }
    } catch (err) {
      this.logger.error('this was the payload %j', productToSave.toJSON());
      throw err;
    }
  },
  cacheCategories(categories) {
    categories.forEach(cat => {
      const key = cat.category.name;
      const value = cat.category;
      value.products = [];

      categoriesCache.set(key, value);
    });
  },
  cacheProducts(products) {
    products.forEach(prod => {
      const key = prod.name;
      const value = prod;
      productsCache.set(key, value);
    });
  },
  clearCache() {
    categoriesCache.flushAll();
    productsCache.flushAll();
  },
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
  },
  _addProduct(data) {
    const options = { json: { product: data } };

    return requestpool
      .add(() => request.post(urls.PRODUCTS, options).json());
  },
  _addCategory(name) {
    const payload = {category: { name }};
    const options = {json: payload};

    return requestpool
      .add(() => request.post(urls.CATEGORIES, options).json());
  },
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
  },
  async _createCategory(categoryName) {
    const newCategory = await this._addCategory(categoryName);
    categoriesCache.set(categoryName, newCategory.category);
    return newCategory.category;
  },
  async _getCategory(categoryName) {
    if (categoriesCache.has(categoryName)) {
      return categoriesCache.get(categoryName);
    }

    categoriesCache.set(categoryName, this._createCategory(categoryName));
    return categoriesCache.get(categoryName);
  }
};


module.exports = service;
