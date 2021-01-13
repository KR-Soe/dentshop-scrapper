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
  IMAGES: (id) => `https://api.jumpseller.com/v1/products/${id}/images.json?login=${apiLogin}&authtoken=${authToken}`
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
    const productToSave = new Product();
    productToSave.name = product.title;
    productToSave.price = product.internetPrice;
    productToSave.stock = product.stock;
    productToSave.sku = product.sku;
    productToSave.brand = product.brand;
    productToSave.categories = categories;
    productToSave.description = product.description;

    try {
      const retrievedProduct = this._addProduct(productToSave.toJSON(true));
      const newProduct = retrievedProduct.product;
      await syncRepository.addProduct(newProduct);
      productsCache.set(newProduct.name, product);
      await Promise.all(product.images.split(',').map(image => this._addProductImage(image)));
    } catch (err) {
      console.error(err);
      console.log('url to check', urls.PRODUCTS);
      console.log('payload', productToSave.toJSON(true));
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
  _updateProduct(product) {
    const options = { json: { product } };

    return requestpool
      .add(() => request.put(urls.PRODUCTS, options).json())
  },
  _addProduct(product) {
    const options = { json: { product } };

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

    return requestpool.add(() => request.post(url, options).json());
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
