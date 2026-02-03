const router = require('express').Router();

router.use('/products', require('./modules/products/product.routes'));
router.use('/admin/products', require('./modules/products/product.admin.routes'));
router.use('/brands', require('./modules/brands/brand.routes'));
router.use('/categories', require('./modules/categories/category.routes'));
router.use('/auth', require('./modules/auth/auth.routes'));

router.use('/users', require('./modules/users/user.routes'));
router.use('/cart', require('./modules/cart/cart.routes'));
router.use('/favorites', require('./modules/favorites/favorite.routes'));
router.use('/compare', require('./modules/compare/compare.routes'));
router.use('/orders', require('./modules/orders/order.routes'));
router.use('/reviews', require('./modules/reviews/review.routes'))
router.use('/wholesale', require('./modules/wholesale/wholesale.routes'));
router.use('/upload', require('./modules/upload/upload.routes'));
router.use('/chat', require('./modules/chat/chat.routes'));

router.use('/admin/products', require('./modules/products/product.admin.routes'));
router.use('/stats', require('./modules/stats/stats.routes'));

router.use('/admin/users', require('./modules/users/user.admin.routes'));
router.use('/admin/reviews', require('./modules/reviews/review.admin.routes'));

module.exports = router;
