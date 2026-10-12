const router = require('express').Router();
const controller = require('./user.controller');
const auth = require('../../core/middleware/auth');
const validate = require('../../core/middleware/validate');
const { updateProfileSchema } = require('./user.validation');

router.get('/profile', auth, controller.getProfile);
router.put('/profile', auth, validate(updateProfileSchema), controller.updateProfile);


module.exports = router;
