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
  CATEGORIES: makeURL('categories')
};

const categoriesCache = new NodeCache({ stdTTL: 3600 });
const productsCache = new NodeCache({ stdTTL: 3600 });

const service = {
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
    console.log('adding or update');

    if (productsCache.has(product.title)) {
      console.log('here ???? me imagino que despues lo veo :3');
      // const cachedProduct = productsCache.get(product.title);

      // cachedProduct.price = product.internetPrice;
      // cachedProduct.stock = product.stock;
      // cachedProduct.description = product.description;

      // return this._updateProduct(cachedProduct);
      return Promise.resolve(true);
    }

    const categories = await this.fetchOrAddCategory(product.category);
    const newProduct = new Product();
    newProduct.name = product.title;
    newProduct.price = product.internetPrice;
    newProduct.stock = product.stock;
    newProduct.sku = product.sku;
    newProduct.brand = product.brand;
    newProduct.categories = categories;
    newProduct.description = product.description;
    newProduct.images = product.images.split(',');

    console.log('here ?');
    console.log('url', urls.PRODUCTS);
    console.log('payload', JSON.stringify(newProduct.toJSON(true)));

    try {
      return this._addProduct(newProduct.toJSON(true));
    } catch (err) {
      console.err(err);
      console.log('url to check', urls.PRODUCTS);
      console.log('payload', newProduct.toJSON(true));
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
      const key = prod.product.name;
      const value = prod.product;
      productsCache.set(key, value);
    });
  },
  clearCache() {
    categoriesCache.flushAll();
    productsCache.flushAll();
  },
  _updateProduct(product) {
    const options = { json: { product } };

    return requestpool
      .add(() => request.put(urls.PRODUCTS, options).json())
  },
  _addProduct(product) {
    const options = { json: { product } };

    console.log('payload before jumpseller', JSON.stringify(options));

    return requestpool
      .add(() => request.post(urls.PRODUCTS, options).json());
  },
  _addCategory(name) {
    const payload = {category: { name }};
    const options = {json: payload};

    return requestpool
      .add(() => request.post(urls.CATEGORIES, options).json());
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
