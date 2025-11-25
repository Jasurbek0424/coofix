const router = require('express').Router();
const auth = require('../../core/middleware/auth');
const controller = require('./cart.controller');

// только авторизованный пользователь
router.get('/', auth, controller.getCart);
router.post('/add', auth, controller.addToCart);
router.post('/change', auth, controller.changeQuantity);
router.post('/remove', auth, controller.removeFromCart);
router.post('/clear', auth, controller.clearCart);

module.exports = router;
