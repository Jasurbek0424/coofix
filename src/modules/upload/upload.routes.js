const router = require('express').Router();
const upload = require('../../core/utils/upload');
const controller = require('./upload.controller');

router.post('/single', upload.single('image'), controller.uploadSingle);

router.post('/multiple', upload.array('images', 10), controller.uploadMultiple);

module.exports = router;
