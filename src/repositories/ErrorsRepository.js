const BaseRepository = require('./BaseRepository');

class ErrorsRepository extends BaseRepository {
  constructor() {
    super('producterrors');
  }

  save(error) {
    return this.db.collection(this.collection).insertOne(error);
  }
}

module.exports = ErrorsRepository;
