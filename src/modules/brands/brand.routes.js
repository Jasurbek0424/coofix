const router = require('express').Router();
const controller = require('./brand.controller');

router.get('/', controller.getAll);
router.get('/:slug', controller.getOne);

// admin
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
