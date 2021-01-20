const baseRepository = require('./baseRepository');

const repository = Object.assign({ collection: 'products' }, baseRepository);

module.exports = repository;
