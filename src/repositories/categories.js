const { ObjectId } = require('mongodb');
const baseRepository = require('./baseRepository');

const repository = {
  collection: 'filtercategories',
  saveCategory(category) {
    return category._id ? this._updateCategory(category) : this._addCategory(category);
  },
  _updateCategory(category) {
    const query = { _id: ObjectId(category._id) };
    const updates = { $set: { synonyms: category.synonyms } };
    return this.db.collection(this.collection).updateOne(query, updates);
  },
  _addCategory(category) {
    return this.db.collection(this.collection).insertOne(category);
  }
};

module.exports = Object.assign(baseRepository, repository);
