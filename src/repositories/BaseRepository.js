const { ObjectId } = require('mongodb');
const createConnection = require('../util/mongoConnection');


class BaseRepository {
  constructor(collectionName) {
    this.collection = collectionName;
  }

  findAll() {
    return this.db.collection(this.collection).find({}).toArray();
  }

  deleteAll() {
    return this.db.collection(this.collection).drop();
  }

  remove(entity) {
    const query = { _id: ObjectId(entity._id) };
    return this.db.collection(this.collection).deleteOne(query);
  }
}

async function injectAsyncDependencies() {
  BaseRepository.prototype.db = await createConnection();
}

injectAsyncDependencies();

module.exports = BaseRepository;
