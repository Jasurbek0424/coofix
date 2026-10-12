const router = require('express').Router();
const controller = require('./order.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: object
 *           description: Заполненный объект товара
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
 *           example: 1
 *         price:
 *           type: number
 *           description: Цена на момент покупки
 *           example: 1199
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd7994390aa
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           example:
 *             _id: 507f1f77bcf86cd799439011
 *             name: Иван Иванов
 *             email: ivan@example.com
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         total:
 *           type: number
 *           example: 2398
 *         address:
 *           type: string
 *           example: г. Москва, ул. Ленина, д. 10, кв. 25
 *         phone:
 *           type: string
 *           example: +7 (999) 123-45-67
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           example: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     OrderSuccess:
 *       description: Успешный ответ с заказом
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               order:
 *                 $ref: '#/components/schemas/Order'
 *
 *     OrdersList:
 *       description: Список заказов
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               orders:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Order'
 *
 *     OrderBadRequest:
 *       description: Ошибка (корзина пуста и т.д.)
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
 *                 example: Cart is empty
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Создать заказ из текущей корзины
 *     description: После создания заказа корзина автоматически очищается
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - phone
 *             properties:
 *               address:
 *                 type: string
 *                 example: г. Москва, ул. Пушкина, д. 10, кв. 5
 *               phone:
 *                 type: string
 *                 example: +7 (999) 123-45-67
 *     responses:
 *       200:
 *         $ref: '#/components/responses/OrderSuccess'
 *       400:
 *         $ref: '#/components/responses/OrderBadRequest'
 */
router.post('/', auth, controller.createOrder);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Получить все заказы текущего пользователя
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/OrdersList'
 */
router.get('/my', auth, controller.getMyOrders);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Получить все заказы (только админ)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/responses/OrdersList'
 *       403:
 *         description: Доступ запрещён (не админ)
 */
router.get('/', auth, checkRole('admin'), controller.getAllOrders);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Обновить статус заказа (только админ)
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd7994390aa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *                 example: shipped
 *     responses:
 *       200:
 *         $ref: '#/components/responses/OrderSuccess'
 *       400:
 *         $ref: '#/components/responses/OrderBadRequest'
 *       404:
 *         description: Заказ не найден
 */
router.patch('/:orderId/status', auth, checkRole('admin'), controller.updateStatus);

module.exports = router;