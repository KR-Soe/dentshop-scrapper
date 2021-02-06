const NodeCache = require('node-cache');


class CacheService {
  constructor() {
    this._categoriesCache = new NodeCache({ stdTTL: 3600 });
    this._productsCache = new NodeCache({ stdTTL: 3600 });
  }

  get(option) {
    if (option !== 'category' && option !== 'product') {
      throw new TypeError('you must send category or product');
    }

    return option === 'category' ? this._categoriesCache : this._productsCache;
  }

  cacheCategories(categories) {
    categories.forEach(cat => {
      const key = cat.category.name;
      const value = cat.category;
      value.products = [];

      this._categoriesCache.set(key, value);
    });
  }

  cacheProducts(products) {
    products.forEach(prod => {
      const key = prod.name;
      const value = prod;
      this._productsCache.set(key, value);
    });
  }

  clearCache() {
    this._categoriesCache.flushAll();
    this._productsCache.flushAll();
  }
}


module.exports = CacheService;
