const router = require('express').Router();
const auth = require('../../core/middleware/auth');
const controller = require('./cart.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           description: Заполненный объект продукта (populate)
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             price:
 *               type: number
 *             images:
 *               type: array
 *               items:
 *                 type: string
 *           example:
 *             _id: 507f1f77bcf86cd799439011
 *             name: iPhone 15 Pro
 *             price: 1199
 *             images: ["https://example.com/iphone.jpg"]
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         price:
 *           type: number
 *           description: Цена на момент добавления в корзину
 *           example: 1199
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         total:
 *           type: number
 *           description: Общая сумма корзины
 *           example: 2398
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     CartSuccess:
 *       description: Успешный ответ с корзиной
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               cart:
 *                 $ref: '#/components/schemas/Cart'
 *
 *     CartBadRequest:
 *       description: Ошибка (товар не найден, корзина пуста и т.д.)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: Product not found
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Получить корзину текущего пользователя
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CartSuccess'
 *       400:
 *         $ref: '#/components/responses/CartBadRequest'
 */
router.get('/', auth, controller.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Добавить товар в корзину
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID товара
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CartSuccess'
 *       400:
 *         $ref: '#/components/responses/CartBadRequest'
 */
router.post('/add', auth, controller.addToCart);

/**
 * @swagger
 * /cart/change:
 *   post:
 *     summary: Изменить количество товара в корзине (можно установить 0 для удаления)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: 0 = удалить товар из корзины
 *                 example: 3
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CartSuccess'
 *       400:
 *         $ref: '#/components/responses/CartBadRequest'
 */
router.post('/change', auth, controller.changeQuantity);

/**
 * @swagger
 * /cart/remove:
 *   post:
 *     summary: Удалить товар из корзины
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CartSuccess'
 *       400:
 *         $ref: '#/components/responses/CartBadRequest'
 */
router.post('/remove', auth, controller.removeFromCart);

/**
 * @swagger
 * /cart/clear:
 *   post:
 *     summary: Очистить всю корзину
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CartSuccess'
 */
router.post('/clear', auth, controller.clearCart);

module.exports = router;