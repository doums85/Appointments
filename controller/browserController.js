const proxyChain = require('proxy-chain');
const puppeteer = require('puppeteer');
// Load environment variables
require('dotenv').config();

let browser;


exports.createBrowser = async function (req, res, next) {
  try {
    if (!browser) {
      const oldProxyUrl =
        'http://momoseck8_gmail_com-country-fr-sid-bgpmwmfwe9bx-filter-medium:m0bc1jaj44@gate.nodemaven.com:8080';
      const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

      // Prints something like "http://127.0.0.1:45678"
      console.log(newProxyUrl);

      browser = await puppeteer.launch({
        args: [`--proxy-server=${newProxyUrl}`],
      });

      console.log('Browser created');
    }

    req.browser = browser;
    next();
  } catch (error) {
    console.error('Failed to create browser:', error);
    next(error);
  }
};

// Add cookies to the page

// Go to a page url
exports.goToURL = async function (req, res, next) {
  const page = await req.browser.newPage();

  await page.goto(process.env.URL);

  req.page = page;

  next();
};

exports.closeBrowser = async function (_, res, next) {
  await res.browser.close();

  // Clean up
  await proxyChain.closeAnonymizedProxy(newProxyUrl, true);

  next();
};