const router = require('express').Router();
const controller = require('./user.controller');
const auth = require('../../core/middleware/auth');

router.get('/profile', auth, controller.getProfile);

module.exports = router;
