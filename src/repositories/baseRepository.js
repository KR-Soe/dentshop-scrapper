const createConnection = require('../util/mongoConnection');
const makePromise = require('../util/toPromise');

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
    return makePromise(done => db.collection(this.collection).find({}).toArray(done));
  }
};

module.exports = baseRepository;
