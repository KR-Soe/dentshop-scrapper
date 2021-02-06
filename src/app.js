const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const container = require('./util/container');
const oh = require('./util/objectHolder');
const app = express();

const viewsPath = path.resolve(__dirname, 'views');
const logger = container.get('logger');

oh.add('logger', logger);
app.set('views', viewsPath);
app.set('view engine', 'njk');

nunjucks.configure(viewsPath, {
  throwOnUndefined: true,
  noCache: true,
  express: app
});

app.use('/public', express.static(path.resolve(__dirname, 'assets')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(require('./middleware/injectLogger')(logger));
app.use(require('./routes'));

module.exports = app;
