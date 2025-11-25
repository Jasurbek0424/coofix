const router = require('express').Router();
const controller = require('./compare.controller');
const auth = require('../../core/middleware/auth');

router.get('/', auth, controller.getCompare);
router.post('/add', auth, controller.add);
router.post('/remove', auth, controller.remove);
router.post('/clear', auth, controller.clear);

module.exports = router;
