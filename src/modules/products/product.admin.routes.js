const router = require('express').Router();
const controller = require('./product.admin.controller');

const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

// для админов
router.post('/', auth, checkRole('admin'), controller.create);
router.put('/:id', auth, checkRole('admin'), controller.update);
router.delete('/:id', auth, checkRole('admin'), controller.remove);
router.patch('/:id/stock', auth, checkRole('admin'), controller.updateStock);

module.exports = router;
