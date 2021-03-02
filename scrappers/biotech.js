const makeMongoConn = require('./utils/mongoConn');
const makeNewBrowser = require('./utils/makeBrowser');
const parseNumber = require('./utils/numberParser');
const container = require('../src/util/container');

const main = async () => {
  this.pricingService = container.get('pricingService');
  const browser = await makeNewBrowser();
  const page = await browser.newPage();
  const baseUrl = 'https://biotechchile.cl';
  console.log('going to...', baseUrl);
  await page.goto(baseUrl);
  const categoryLinks = await fetchCategories(page);

  for (let i = 0; i < categoryLinks.length; i++) {
    const url = `${baseUrl}${categoryLinks[i]}`;
    await page.goto(url)
    const { totalPages, category } = await fetchCatAndQuant(page);

    for (let j = 0; j <= totalPages; j++){
      const plp = `${url}/page/${j+1}`;
      await page.goto(plp);
      const pdpItems = await getProductsLink(page);

      for(let k = 0; k <= pdpItems.length; k++){
        const pdpUrl = `${baseUrl}${pdpItems[k]}`;
        console.log('scrapping', pdpUrl);
        await page.goto(pdpUrl);
        const results = await getInfo(page, category);

        await insertDB(results);
      }
    }
  }
  console.log('TARIAMOS LISTEILOR')
  page.close();
  browser.close();
};

const getProductsLink = async (page) => {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.d-block.h-100')).map(href => href.getAttribute('href'));
  });
};

const fetchCatAndQuant = async (page) => {
  const test = await page.evaluate(() => {
    const lastPage = Array.from(
      document.querySelectorAll('.products_pager.form-inline.flex-md-nowrap .page-item'))
      .slice(1,5).map(content => content.textContent.trim());
    const category = window.location.href.split('/').slice(-1)[0].split('-')[0]
    return {
      totalPages: Number.parseInt(lastPage.slice(-1)[0]),
      category
    };
  });
  return test;
};

const fetchCategories = async (page) => {
  return page.evaluate(() => {
    return Array.from(
        document.querySelectorAll('.container-fluid.fondo_dos.header-desktop .menu-item-wrap a')
      ).map(href => href.getAttribute('href'));
  });
};

const getInfo = async (page, category) => {
  const data = await page.evaluate(category => {
    const title = document.querySelector('#product_details > h1').textContent;
    const price = document.querySelector('.oe_price > .oe_currency_value').textContent;
    const image = document.querySelector('.carousel.slide img').getAttribute('src');
    const stock = document.querySelector('.availability_messages.o_not_editable > div').textContent.trim();
    const date = new Date().toISOString();

    return {
      title: title,
      price: price,
      refer_url: window.location.href,
      image: image,
      brand: '',
      description: '',
      sku: '',
      platform_source: 'biotech',
      stock: stock,
      created_at: date,
      category
    };
  }, category);

  data.price = parseNumber(data.price);
  data.stock = parseNumber(data.stock);
  data.revenue_price = this.pricingService.calculatePriceWithRevenue(data.price);
  return data;
};

const insertDB = async (registers) => {
  const connection = await makeMongoConn();
  const db = connection.db('dentshop');
  const collection = db.collection('biotech');

  return new Promise((resolve, reject) => {
    console.log('trying to insert into the DB');
    collection.insertOne(registers, function(err, result) {
      if (err) {
        reject(err);
        return;
      }
      console.log('done');
      resolve(result);
    });
  });
};

main();
