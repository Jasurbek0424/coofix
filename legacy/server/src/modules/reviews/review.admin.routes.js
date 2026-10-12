const router = require('express').Router();
const controller = require('./review.admin.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

// 🔒 Только admin
router.use(auth, checkRole('admin'));

router.get('/', controller.getAllReviews);
router.get('/product/:productId', controller.getReviewsByProduct);
router.delete('/:id', controller.deleteReview);

module.exports = router;
