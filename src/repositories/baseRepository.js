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

    return new Promise((resolve, reject) => {
      db.collection(this.collection).find({}).toArray((err, docs) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(docs);
      });
    });
  }
};

module.exports = baseRepository;
