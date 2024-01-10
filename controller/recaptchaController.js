const { spawn } = require('child_process');
const fs = require('fs');

// Load environment variables
const CAPTCHA_DIR = `${__dirname}/../public/captchas`;
const PYTHON_SCRIPT_PATH = `${__dirname}/recaptcha.py`;
const PYTHON_EXEC_PATH = 'python3';
const CAPTCHA_ID = '#captchaFR_CaptchaImage';
const CAPTCHA_PATH = `${CAPTCHA_DIR}/captcha.png`;

exports.checkRecaptchaPresence = function (req, res, next) {
  req.page
    ?.waitForSelector('#captchaFR_CaptchaImage')
    .then(() => {
      console.log('Recaptcha found');

      req.checkRecaptchaPresence = true;
      next();
    })
    .catch(() => {
      console.log('Recaptcha not found');

      req.checkRecaptchaPresence = false;
      next();
    });
};

exports.downloadImageRecaptcha = async function (req, res, next) {
  try {
    if (req.checkRecaptchaPresence) {
      const captchaImage = await req.page.waitForSelector(CAPTCHA_ID);

      const imageSrc = await captchaImage?.evaluate((el) => el.src);

      const newPage = await req.browser.newPage();
      await newPage.goto(imageSrc);
      // Take a screenshot of the captcha
      await newPage.screenshot({ path: CAPTCHA_PATH });

      console.log('Captcha downloaded');
    }
    next();
  } catch (error) {
    res.status(500).send({ message: `Failed download : ${error.message}` });
  }
};

exports.resolveRecaptcha = function (req, res, next) {
  const page = req.page;

  try {
    if (req.checkRecaptchaPresence) {
      const python = spawn(PYTHON_EXEC_PATH, [PYTHON_SCRIPT_PATH, CAPTCHA_PATH]);

      python.stdout.on('data', async (data) => {
        const response = JSON.parse(data.toString().replace(/'/g, `"`));
        console.log(`Recapcha response: ${response.code}`);

        await page.type('#captchaFormulaireExtInput', response.code);
        await new Promise((resolve) => setTimeout(resolve, 100));
        await page.click('button[type=submit]');
       // const cookies = await page.cookies();

        // Save cookies to file json
       // fs.writeFileSync(`${__dirname}/../public/cookies.json`, JSON.stringify(cookies));
        console.log('Recaptcha resolved successfully ! 🚀');
        next();
      });
    } else {
      next();
    }
  } catch (error) {
    res.status(500).send({ message: `Failed resolve : ${error.message}` });
  }
};
