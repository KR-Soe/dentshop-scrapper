const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const app = express();

const viewsPath = path.resolve(__dirname, 'views');

app.set('views', viewsPath);
app.set('view engine', 'njk');

const env = nunjucks.configure(viewsPath, {
  throwOnUndefined: true,
  noCache: true,
  express: app
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (_, res) => {
  res.render('index.njk');
});

module.exports = app;
