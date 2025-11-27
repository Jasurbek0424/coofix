const router = require('express').Router();
const controller = require('./favorite.controller');
const auth = require('../../core/middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     FavoriteProduct:
 *       type: object
 *       description: Полный объект товара (populate из Product)
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: iPhone 15 Pro Max
 *         price:
 *           type: number
 *           example: 1399
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://example.com/iphone15.jpg"]
 *         slug:
 *           type: string
 *           example: iphone-15-pro-max
 *
 *   responses:
 *     FavoriteSuccess:
 *       description: Успешный ответ со списком избранных товаров
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               favorites:
 *                 type: array
 *                 description: Массив товаров в избранном
 *                 items:
 *                   $ref: '#/components/schemas/FavoriteProduct'
 *
 *     FavoriteBadRequest:
 *       description: Ошибка (товар не найден и т.п.)
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
 * /favorites:
 *   get:
 *     summary: Получить список избранных товаров пользователя
 *     tags: [Favorite]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/FavoriteSuccess'
 *       400:
 *         $ref: '#/components/responses/FavoriteBadRequest'
 */
router.get('/', auth, controller.getFavorites);

/**
 * @swagger
 * /favorites/toggle:
 *   post:
 *     summary: Добавить/удалить товар из избранного (toggle)
 *     description: Если товар уже в избранном — удалит. Если нет — добавит.
 *     tags: [Favorite]
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
 *     responses:
 *       200:
 *         $ref: '#/components/responses/FavoriteSuccess'
 *       400:
 *         $ref: '#/components/responses/FavoriteBadRequest'
 */
router.post('/toggle', auth, controller.toggle);

/**
 * @swagger
 * /favorites/remove:
 *   post:
 *     summary: Удалить товар из избранного (одностороннее удаление)
 *     description: Только удаляет. Если товара нет — просто ничего не делает.
 *     tags: [Favorite]
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
 *         $ref: '#/components/responses/FavoriteSuccess'
 *       400:
 *         $ref: '#/components/responses/FavoriteBadRequest'
 */
router.post('/remove', auth, controller.remove);

module.exports = router;