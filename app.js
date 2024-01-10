const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const scrapeAppointment = require('./controller/scrapeController');
const { createBrowser, goToURL } = require('./controller/browserController');
const {
  checkRecaptchaPresence,
  downloadImageRecaptcha,
  resolveRecaptcha,
} = require('./controller/recaptchaController');

// Load environment variables
require('dotenv').config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(createBrowser, goToURL);
app.use(checkRecaptchaPresence, downloadImageRecaptcha, resolveRecaptcha);
app.use(scrapeAppointment);

app.get('/api/v1/', scrapeAppointment); 

module.exports = app;
