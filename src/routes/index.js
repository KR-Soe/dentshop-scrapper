const authMiddleware = require('../middleware/authentication');
const apiRoute = require('./api');
const panelController = require('../controllers/panel');

function homeController(_, res) {
  res.render('index.njk');
}

module.exports = (app) => {
  app.get('/', homeController);
  app.get('/panel', authMiddleware, panelController);
  app.use('/api', apiRoute);
};
