const router = require('express').Router();
const controller = require('./auth.controller');
const google = require('./auth.google.controller');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/google', google.googleAuth);
router.post('/refresh', controller.refresh);


module.exports = router;
