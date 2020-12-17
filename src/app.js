const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const authMiddleware = require('./middleware/authentication');
const app = express();

const viewsPath = path.resolve(__dirname, 'views');
const logger = pino();

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

app.use((req, _, next) => {
  req.logger = logger;
  next();
});

app.get('/', (_, res) => {
  res.render('index.njk');
});

app.get('/panel',authMiddleware, (_, res) => {
  res.send('aqui estoy con dentro del panel de control');
});

app.post('/api/auth', require('./controllers/authenticate'));

module.exports = app;
