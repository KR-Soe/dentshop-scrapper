const baseRepository = require('./baseRepository');
const categoriesToFetch = require('../config/normalized-categories.json');

const repository = Object.assign({ collection: 'products' }, baseRepository);

repository.findAllByRegisteredCategories = async function() {
  const db = await this.init();

  const rows = await Promise.all(
    categoriesToFetch.map(option => {
      const synonyms = option.synonyms
        .map(cat => cat.trim())
        .map(category => ({ category }));
      return db.collection('products').find({ $or: synonyms }).toArray();
    })
  );

  return rows.reduce((arr, next) => arr.concat(next), []);
};

module.exports = repository;
