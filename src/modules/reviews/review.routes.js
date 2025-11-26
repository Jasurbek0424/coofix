const router = require('express').Router();
const controller = require('./review.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

// USER
router.post('/', auth, controller.addReview);
router.delete('/:reviewId', auth, controller.removeReview);

// PUBLIC
router.get('/:productId', controller.getProductReviews);

// ADMIN
router.delete('/admin/:reviewId', auth, checkRole("admin"), controller.removeReview);

module.exports = router;
