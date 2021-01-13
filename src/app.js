const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const authMiddleware = require('./middleware/authentication');
const oh = require('./util/objectHolder');
const config = require('./config');
const app = express();

const viewsPath = path.resolve(__dirname, 'views');
const logger = pino({ level: config.logger.logLevel });

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

app.use((req, _, next) => {
  req.logger = logger;
  next();
});

app.get('/', (_, res) => {
  res.render('index.njk');
});

app.get('/panel',authMiddleware, (_, res) => {
  res.render('panel.njk');
  setTimeout(() => oh.get('socket').emit('sayHi', { message: 'niggabertus' }), 500);
});

app.use('/api', require('./routes/api'));

module.exports = app;
