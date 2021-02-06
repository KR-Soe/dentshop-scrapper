const router = require('express').Router();
const authMiddleware = require('../middleware/authentication');
const apiRoute = require('./api');
const container = require('../util/container');
const panelController = require('../controllers/panel');

const handlePanel = panelController(
  container.get('categoryRepository'),
  container.get('revenueRepository')
);

router.get('/', (_, res) => res.render('index.njk'));
router.use('/api', apiRoute);
router.get('/panel', authMiddleware, handlePanel);

module.exports = router;
