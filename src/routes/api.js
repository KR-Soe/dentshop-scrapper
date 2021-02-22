const router = require('express').Router();

router.post('/auth', require('../controllers/authenticate'));

module.exports = router;
