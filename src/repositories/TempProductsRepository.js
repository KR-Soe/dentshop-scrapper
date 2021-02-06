const BaseRepository = require('./BaseRepository');


class TempProductsRepository extends BaseRepository {
  constructor() {
    super('tempProducts');
  }

  save(product) {
    return this.db.collection(this.collection).insertOne(product);
  }
}


module.exports = TempProductsRepository;
