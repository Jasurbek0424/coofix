const router = require('express').Router();
const controller = require('./chat.controller');

router.post('/', controller.chat);

module.exports = router;
