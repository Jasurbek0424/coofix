const router = require('express').Router();
const controller = require('./order.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

// USER
router.post('/', auth, controller.createOrder);
router.get('/my', auth, controller.getMyOrders);

// ADMIN
router.get('/', auth, checkRole('admin'), controller.getAllOrders);
router.patch('/:orderId/status', auth, checkRole('admin'), controller.updateStatus);

module.exports = router;
