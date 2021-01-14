const request = require('./request');
const config = require('../config');
const requestpool = require('../util/requestpool');
const syncRepository = require('../repositories/sync');
const Product = require('../dto/product');
const NodeCache = require('node-cache');
const { apiLogin, authToken } = config.jumpSeller;

const makeURL = key => `https://api.jumpseller.com/v1/${key}.json?login=${apiLogin}&authtoken=${authToken}`;

const urls = {
  PRODUCTS: makeURL('products'),
  CATEGORIES: makeURL('categories'),
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
  findAllProducts() {
    return requestpool
      .add(() => request.get(urls.PRODUCTS).json());
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
      cachedProduct.price = product.internetPrice;
      cachedProduct.stock = product.stock;
      cachedProduct.description = product.description;
      return this._updateProduct(cachedProduct);
    }

    const categories = await this.fetchOrAddCategory(product.category);
    const productToSave = new Product();
    productToSave.name = product.title;
    productToSave.price = product.internetPrice;
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
