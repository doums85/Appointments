const proxyChain = require('proxy-chain');
// Load environment variables
require('dotenv').config();
let chrome = {};
let puppeteer;
let browser;
let options;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require('chrome-aws-lambda');
  puppeteer = require('puppeteer-core');
} else {
  puppeteer = require('puppeteer');
}

exports.createBrowser = async function (req, res, next) {
  try {
    if (!browser) {
      const oldProxyUrl =
        'http://momoseck8_gmail_com-country-fr-sid-bgpmwmfwe9bx-filter-medium:m0bc1jaj44@gate.nodemaven.com:8080';
      const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);

      // Prints something like "http://127.0.0.1:45678"
      console.log(newProxyUrl);

      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security', `--proxy-server=${newProxyUrl}`],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true,
        };
      } else {
        options = {
          args: [`--proxy-server=${newProxyUrl}`],
        };
      }

      browser = await puppeteer.launch(options);

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
