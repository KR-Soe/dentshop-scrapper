const exprodentalRepository = require('../repositories/exprodental');
const biotechRepository = require('../repositories/biotech');
const dentallavalRepository = require('../repositories/dentallaval');
const expressdentRepository = require('../repositories/expressdent');
const mayordentRepository = require('../repositories/mayordent');
const jumpsellerService = require('./jumpseller');
const syncRepository = require('../repositories/sync');


async function service(logger, socket) {
  logger.info('fetching the products from mongodb');
  socket.emit('notify', { message: 'rescatando los productos anteriormente guardados en jumpseller' });

  const extractedProducts = await Promise.all([
    exprodentalRepository.findAll(),
    biotechRepository.findAll(),
    dentallavalRepository.findAll(),
    expressdentRepository.findAll(),
    mayordentRepository.findAll()
  ]);

  logger.info('now flattening the product array');
  const productsToUse = extractedProducts.reduce((arr, next) => arr.concat(next), []);

  logger.info('getting all categories and products from jumpseller');

  const [jumpsellerCategories, productsFromDB] = await Promise.all([
    jumpsellerService.findAllCategories(),
    syncRepository.findAllProducts()
  ]);

  logger.info('now adding new categories and products to mongo');
  socket.emit('notify', { message: 'revisando si hay categorias nuevas para agregar a jumpseller' });

  socket.emit('notify', { message: 'preparando los productos y categorias' });
  jumpsellerService.cacheCategories(jumpsellerCategories);
  jumpsellerService.cacheProducts(productsFromDB);

  logger.info('trying to syncronize the products on jumpseller');

  let ok = 0;
  let notOk = 0;

  try {
    logger.info('getting all categories from products');
    socket.emit('notify', { message: 'agrupando las categorias de los productos nuevos' });
    const categoriesToFetchOrCreate = productsToUse.map(product => product.category);
    logger.info('initializing fetch/creation of categories');

    const totalCategories = categoriesToFetchOrCreate.length;
    const totalProducts = productsToUse.length;

    for (let i = 0; i < totalCategories; i++) {
      const cat = categoriesToFetchOrCreate[i];
      socket.emit('notify', { message: `procesando categoria ${i + 1} de ${totalCategories}` });
      logger.debug('processing category %d of %d', i + 1, totalCategories);
      await jumpsellerService.fetchOrAddCategory(cat);
    }

    socket.emit('notify', { message: 'categorias guardadas' });

    for (let i = 0; i < totalProducts; i++) {
      const prod = productsToUse[i];
      logger.debug('processing product %d of %d', i + 1, totalProducts);
      socket.emit('notify', { message: `procesando producto ${i + 1} de ${totalProducts}` });

      try {
        await jumpsellerService.updateOrAddProduct(prod);
        ok++;
      } catch(err) {
        console.error(err);
        notOk++;
      }
    }

  } catch (err) {
    return false;
  }

  socket.emit('notify', { message: 'tarea terminada, por favor revisa los productos y categorias actualizados' });
  return true;
}

module.exports = service;
