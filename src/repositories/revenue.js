const createConnection = require('../util/mongoConnection');
const { ObjectId } = require('mongodb');

const repository = {
  async init() {
    this.db = await createConnection();
  },
  getCurrentRevenue() {
    return this.db.collection('revenue').find({}).toArray();
  },
  saveRevenue(revenue) {
    if (revenue._id) {
      const query = { _id: ObjectId(revenue._id) };
      const updates = { $set: { value: revenue.value }};
      return this.db.collection('revenue').updateOne(query, updates);
    } else {
      return this.db.collection('revenue').insertOne({ value: revenue.value });
    }
  }
};

repository.init();

module.exports = repository;
