const exprodentalRepository = require('../repositories/exprodental');
const biotechRepository = require('../repositories/biotech');
const jumpsellerService = require('../services/jumpseller');
const Product = require('../dto/product');


async function controller(req, res) {
  req.logger.info('fetching the products from mongodb');

  const extractedProducts = await Promise.all([
    exprodentalRepository.findAll()
  ]);

  req.logger.info('now flattening the product array');

  const productsToUse = extractedProducts.reduce((arr, next) => arr.concat(next), []);

  req.logger.info('trying to syncronize the products on jumpseller');

  const promises = productsToUse.map(addOrUpdateProduct);

  await Promise.all(promises);

  console.log('sync');
  res.json({ message: 'listo, por favor revisa en jumpseller los productos actualizados' });
}

function addOrUpdateProduct(product) {
  const newProduct = new Product();

  newProduct.price = product.internetPrice;
  newProduct.stock = product.stock;
  newProduct.sku = product.sku;
  newProduct.brand = product.brand;

  return jumpsellerService.addProduct(newProduct.toJSON());
}

module.exports = controller;
