const createConnection = require('../util/mongoConnection');

const baseRepository = {
  async init() {
    if (this.db) {
      return this.db;
    }

    this.db = await createConnection();
    return this.db;
  },
  async findAll() {
    const db = await this.init();
    return db.collection(this.collection).find({}).toArray();
  },
  async deleteAll() {
    const db = await this.init();
    return db.collection(this.collection).drop();
  }
};

module.exports = baseRepository;
