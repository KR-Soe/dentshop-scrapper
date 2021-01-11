const exprodentalRepository = require('../repositories/exprodental');
const biotechRepository = require('../repositories/biotech');
const dentallavalRepository = require('../repositories/dentallaval');
const expressdentRepository = require('../repositories/expressdent');
const mayordentRepository = require('../repositories/mayordent');
const jumpsellerService = require('../services/jumpseller');


async function controller(req, res) {
  req.logger.info('fetching the products from mongodb');

  const extractedProducts = await Promise.all([
    exprodentalRepository.findAll(),
    biotechRepository.findAll(),
    dentallavalRepository.findAll(),
    expressdentRepository.findAll(),
    mayordentRepository.findAll()
  ]);

  req.logger.info('now flattening the product array');

  const productsToUse = extractedProducts.reduce((arr, next) => arr.concat(next), []);

  req.logger.info('getting all categories and products from jumpseller');

  const [jumpsellerCategories, jumpsellerProducts] = await Promise.all([
    jumpsellerService.findAllCategories(),
    jumpsellerService.findAllProducts()
  ]);

  req.logger.info('now adding new categories and products to mongo');

  jumpsellerService.cacheCategories(jumpsellerCategories);
  jumpsellerService.cacheProducts(jumpsellerProducts);

  req.logger.info('trying to syncronize the products on jumpseller');

  let ok = 0;
  let nok = 0;

  try {
    req.logger.info('getting all categories from products');

    const categoriesToFetchOrCreate = productsToUse.map(product => product.category);

    req.logger.info('initializing fetch/creation of categories');

    for (let i = 0; i < categoriesToFetchOrCreate.length; i++) {
      const cat = categoriesToFetchOrCreate[i];
      await jumpsellerService.fetchOrAddCategory(cat);
    }

    req.logger.info('initializing update/create of products');

    for (let i = 0; i < productsToUse.length; i++) {
      try {
        const prod = productsToUse[i];
        await jumpsellerService.updateOrAddProduct(prod);
        ok++;
      } catch(err) {
        nok++;
        continue;
      }
    }
  } catch(err) {
    console.error(err);
    res.json({
      message: `hubo un error al sincronizar los products pero hubieron ${ok} buenos y ${nok} malos`,
      ok,
      nok
    });
    return;
  }

  res.json({ message: `listo, por favor revisa en jumpseller los productos actualizados ${ok} buenos y ${nok} malos` });
}

module.exports = controller;
