const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const pino = require('pino');
const multer = require('multer');
const authMiddleware = require('./middleware/authentication');
const app = express();

const upload = multer({
  dest: '/tmp/dentshop/'
});

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
  res.render('panel.njk');
});

app.post('/api/auth', require('./controllers/authenticate'));
app.post('/api/csv', upload.single('jumpseller'), require('./controllers/csv'));

module.exports = app;
