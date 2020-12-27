const jumpsellerService = require('../services/jumpseller');

async function controller(req, res) {
  const products = await jumpsellerService.findAllProducts();
  res.json(products);
}

module.exports = controller;
