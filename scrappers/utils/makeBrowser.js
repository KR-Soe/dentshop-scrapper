const puppeteer = require('puppeteer');

const makeNewBrowser = async (throttle = 0, headless = true, devtools = true) => {
  const options = { headless , slowMo: throttle, devtools, args: ['--no-sandbox'] };
  const browser = await puppeteer.launch(options);
  return browser;
};

module.exports = makeNewBrowser;
