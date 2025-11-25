const router = require('express').Router();
const controller = require('./product.controller');

router.get('/', controller.getAll);
router.get('/new', controller.getNew);
router.get('/sale', controller.getSale);
router.get('/search', controller.search);
router.get('/filter', controller.filter);
router.get('/related/:slug', controller.related);
router.get('/:slug', controller.getOne);
router.get('/category/:slug', controller.getByCategory);
router.get('/brand/:slug', controller.getByBrand);

module.exports = router;
