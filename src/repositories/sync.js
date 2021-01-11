const createConnection = require('../util/mongoConnection');
const makePromise = require('../util/toPromise');

const syncRepository = {
  async init() {
    if (this.db) {
      return this.db;
    }

    this.db = await createConnection();
    return this.db;
  },
  async hasProduct(product) {
    const db = await this.init();
    const fn = done => db.collection('tempProducts').find({ name: product.title }).toArray(done);
    const products = await makePromise(fn);
    return products.length;
  },
  async getCategory(category) {
    const db = await this.init();
    const fn = done => db.collection('tempCategories').find({ name: category }).toArray(done);
    const results = await makePromise(fn);

    return results.length ? results[0] : null;
  },
  async addCategory(category) {
    const db = await this.init();
    const fn = done => db.collection('tempCategories').insertMany([ category ], done);
    await makePromise(fn);
    return category;
  },
  async dropCollection(collectionName) {
    const db = await this.init();

    return makePromise(done => db.collection(collectionName).drop(done))
      .catch(() => Promise.resolve(`collection ${collectionName} does not exist`));
  }
};

module.exports = syncRepository;
