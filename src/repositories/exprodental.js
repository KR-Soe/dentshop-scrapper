const createConnection = require('../util/mongoConnection');

const repository = {
  async findAll() {
    const db = await createConnection();

    return new Promise((resolve, reject) => {
      db.collection('exprodental').find({}).toArray((err, docs) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(docs);
      });
    });
  }
};

module.exports = repository;
