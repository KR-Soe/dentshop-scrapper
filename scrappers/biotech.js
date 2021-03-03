const pino = require('pino');
const makeMongoConn = require('./utils/mongoConn');
const makeNewBrowser = require('./utils/makeBrowser');
const parseNumber = require('./utils/numberParser');
const container = require('../src/util/container');

const logger = pino();
const pricingService = container.get('pricingService');

const main = async () => {
  const browser = await makeNewBrowser();
  const baseURL = 'https://biotechchile.cl';

  logger.info('going to ... %s', baseURL);

  const categoryLinks = await fetchCategories(browser, baseURL);
  console.log('category links', categoryLinks);

  do {
    const link = categoryLinks.shift();
    const url = `${baseURL}${link}`;
    logger.info('url created -> %s', url);
    const { totalPages, category } = await fetchCatAndQuantity(browser, url);

    for (let i = 0; i <= totalPages; i++) {
      const pageNumber = i + 1;
      const plp = `${url}/page/${pageNumber}`;
      const pdpItems = await getProductsLink(browser, plp);

      while (pdpItems.length > 0) {
        const pdpSection = pdpItems.shift();
        const pdpUrl = `${baseURL}${pdpSection}`;
        const results = await getInfo(browser, pdpUrl, category);

        if (!results.title) {
          continue;
        }

        await insertDB(results);
      }
    }
  } while (categoryLinks.length > 0);

  browser.close();
};

const getProductsLink = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);

  const productsLink = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.d-block.h-100'))
      .map(href => href.getAttribute('href'));
  });

  await page.close();
  return productsLink;
};

const fetchCatAndQuantity = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);

  const totalPagesAndCategory = await page.evaluate(() => {
    const lastPage = Array.from(
      document.querySelectorAll('.products_pager.form-inline.flex-md-nowrap .page-item'))
      .slice(1,5)
      .map(content => content.textContent.trim());

    const category = window.location.href.split('/').slice(-1)[0].split('-')[0];

    return {
      totalPages: Number.parseInt(lastPage.slice(-1)[0]),
      category
    };
  });

  await page.close();
  return totalPagesAndCategory;
};

const fetchCategories = async (browser, url) => {
  const page = await browser.newPage();
  await page.goto(url);

  const results = await page.evaluate(() => {
    return Array.from(
        document.querySelectorAll('.container-fluid.fondo_dos.header-desktop .menu-item-wrap a')
      ).map(href => href.getAttribute('href'));
  });

  await page.close();
  return results;
};

const getInfo = async (browser, url, category) => {
  const page = await browser.newPage();
  page.on('console', (message) => {
    if (message.text().startsWith('https')) {
      logger.error('error on page %s', message.text());
    }
  });

  logger.info('inspecting %s', url);

  await page.goto(url);
  await page.waitForTimeout(3000);

  const data = await page.evaluate((category, url) => {
    try {
      const title = document.querySelector('#product_details > h1').textContent;
      const price = document.querySelector('.oe_price > .oe_currency_value').textContent;
      const image = document.querySelector('.carousel.slide img').getAttribute('src');
      const stock = document.querySelector('.availability_messages.o_not_editable > div').textContent.trim();
      const date = new Date().toISOString();

      return {
        title,
        stock,
        category,
        image,
        sku: '',
        brand: '',
        platformSource: 'biotech',
        description: '',
        createdAt: date,
        referUrl: url,
        internetPrice: price,
      };
    } catch (err) {
      console.error(url);
      return {};
    }
  }, category, page.url());

  data.price = parseNumber(data.internetPrice);
  data.stock = parseNumber(data.stock);
  data.revenuePrice = pricingService.calculatePriceWithRevenue(data.internetPrice);

  await page.close();
  return data;
};

const insertDB = async (entity) => {
  logger.info('inserting entity %j', entity);
  const connection = await makeMongoConn();
  const db = connection.db('dentshop');
  const collection = db.collection('products');

  await collection.insertOne(entity);
  await connection.close();

  return Promise.resolve();
};

main();
