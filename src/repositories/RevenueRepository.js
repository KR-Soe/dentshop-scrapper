const BaseRepository = require('./BaseRepository');
const { ObjectId } = require('mongodb');


class RevenueRepository extends BaseRepository {
  constructor() {
    super('revenue');
  }

  getCurrentRevenue() {
    return this.db.collection(this.collection).findOne({});
  }

  save(revenue) {
    if (revenue._id) {
      const query = { _id: ObjectId(revenue._id) };
      const updates = { $set: { value: revenue.value }};
      return this.db.collection(this.collection).updateOne(query, updates);
    } else {
      return this.db.collection(this.collection).insertOne({ value: revenue.value });
    }
  }
}


module.exports = RevenueRepository;
