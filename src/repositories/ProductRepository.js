const BaseRepository = require('./BaseRepository');


class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  async findByRegisteredCategories(categoriesToFetch) {
    const rows = await Promise.all(categoriesToFetch.map(option => {
      const synonyms = option.synonyms
        .map(cat => cat.trim())
        .map(category => ({ category }));

      return this.db.collection(this.collection).find({ $or: synonyms }).toArray();
    }));

    return rows.reduce((arr, next) => arr.concat(next), []);
  }
}


module.exports = ProductRepository;
