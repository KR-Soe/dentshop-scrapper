const createConnection = require('../util/mongoConnection');

const syncRepository = {
  async init() {
    this.db = await createConnection();
  },
  async findAllProducts() {
    return this.db.collection('tempProducts').find({}).toArray();
  },
  async addProduct(product) {
    return this.db.collection('tempProducts').insertOne(product);
  }
};

syncRepository.init();

module.exports = syncRepository;
