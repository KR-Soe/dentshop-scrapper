const puppeteer = require('puppeteer');

const makeNewBrowser = async (throttle = 500, headless = true, devtools = true) => {
  const options = { headless , slowMo: throttle, devtools };
  const browser = await puppeteer.launch(options);
  return browser;
};

module.exports = makeNewBrowser;
