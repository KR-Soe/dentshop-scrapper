const multer = require('multer');
const router = require('express').Router();
const upload = multer({
  dest: '/tmp/dentshop/'
});

router.post('/auth', require('../controllers/authenticate'));
router.post('/api/csv', upload.single('jumpseller'), require('../controllers/csv'));
router.get('/sync', require('../controllers/sync'));
router.get('/products', require('../controllers/jumpseller'));

module.exports = router;
