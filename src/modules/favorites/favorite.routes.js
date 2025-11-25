const router = require('express').Router();
const controller = require('./favorite.controller');
const auth = require('../../core/middleware/auth');

// Все только для авторизованных пользователей
router.get('/', auth, controller.getFavorites);
router.post('/toggle', auth, controller.toggle);
router.post('/remove', auth, controller.remove);

module.exports = router;
