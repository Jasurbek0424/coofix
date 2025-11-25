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
router.use('/upload', require('./modules/upload/upload.routes'));

router.use('/admin/products', require('./modules/products/product.admin.routes'));

module.exports = router;
