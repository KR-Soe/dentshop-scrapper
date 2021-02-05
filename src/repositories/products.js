const { ObjectId } = require('mongodb');
const baseRepository = require('./baseRepository');
const categoriesToFetch = require('../config/normalized-categories.json');

const repository = {
  collection: 'products',
  async findAllByRegisteredCategories() {
    const db = await this.init();

    const rows = await Promise.all(categoriesToFetch.map(option => {
      const synonyms = option.synonyms
        .map(cat => cat.trim())
        .map(category => ({ category }));

      return db.collection(this.collection).find({ $or: synonyms }).toArray();
    }));

    return rows.reduce((arr, next) => arr.concat(next), []);
  },
  async remove(product) {
    const db = await this.init();
    return db.collection(this.collection).deleteOne({ _id: ObjectId(product._id) });
  }
};

module.exports = Object.assign({}, baseRepository, repository);
