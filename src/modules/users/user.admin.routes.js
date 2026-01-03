const router = require('express').Router();
const controller = require('./user.admin.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

router.use(auth, checkRole('admin'));

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);
router.patch('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
