const router = require('express').Router();
const controller = require('./compare.controller');
const auth = require('../../core/middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     CompareProduct:
 *       type: object
 *       description: Полный объект товара (populate из Product)
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: iPhone 15 Pro
 *         price:
 *           type: number
 *           example: 1199
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         characteristics:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           example:
 *             Дисплей: 6.1" OLED
 *             Процессор: A17 Pro
 *             Память: 256 ГБ
 *
 *     CompareResponse:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompareProduct'
 *           maxItems: 4
 *           description: Список товаров для сравнения (макс. 4)
 *         characteristics:
 *           type: array
 *           items:
 *             type: string
 *           description: Уникальные ключи всех характеристик из всех товаров (для таблицы)
 *           example: ["Дисплей", "Процессор", "Память", "Камера", "Батарея"]
 *
 *   responses:
 *     CompareSuccess:
 *       description: Успешный ответ со списком сравнения
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CompareProduct'
 *               characteristics:
 *                 type: array
 *                 items:
 *                   type: string
 *
 *     CompareFull:
 *       description: Нельзя добавить больше 4 товаров
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
 *                 example: You can compare only 4 products at once
 *
 *     CompareBadRequest:
 *       description: Ошибка (товар не найден, уже добавлен и т.д.)
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
 */

/**
 * @swagger
 * /compare:
 *   get:
 *     summary: Получить список сравнения текущего пользователя
 *     description: Возвращает товары + динамический список всех характеристик для построения таблицы сравнения
 *     tags: [Compare]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список сравнения
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompareProduct'
 *                 characteristics:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Дисплей", "Процессор", "ОЗУ", "Камера"]
 *       400:
 *         $ref: '#/components/responses/CompareBadRequest'
 */
router.get('/', auth, controller.getCompare);

/**
 * @swagger
 * /compare/add:
 *   post:
 *     summary: Добавить товар в сравнение
 *     tags: [Compare]
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
 *         $ref: '#/components/responses/CompareSuccess'
 *       400:
 *         oneOf:
 *           - $ref: '#/components/responses/CompareFull'
 *           - $ref: '#/components/responses/CompareBadRequest'
 */
router.post('/add', auth, controller.add);

/**
 * @swagger
 * /compare/remove:
 *   post:
 *     summary: Удалить товар из сравнения
 *     tags: [Compare]
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
 *         $ref: '#/components/responses/CompareSuccess'
 *       400:
 *         $ref: '#/components/responses/CompareBadRequest'
 */
router.post('/remove', auth, controller.remove);

/**
 * @swagger
 * /compare/clear:
 *   post:
 *     summary: Очистить весь список сравнения
 *     tags: [Compare]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CompareSuccess'
 */
router.post('/clear', auth, controller.clear);

module.exports = router;