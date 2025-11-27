const router = require('express').Router();
const controller = require('./review.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd7994390ff
 *         product:
 *           type: string
 *           description: ID товара
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *               example: Иван Иванов
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         text:
 *           type: string
 *           example: Отличный телефон! Камера просто огонь!
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     ReviewSuccess:
 *       description: Успешный ответ с отзывом
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               review:
 *                 $ref: '#/components/schemas/Review'
 *
 *     ReviewsList:
 *       description: Список отзывов на товар
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               reviews:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Review'
 *
 *     ReviewBadRequest:
 *       description: Ошибка (уже оставлен отзыв, отзыв не найден и т.д.)
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
 *                 example: You have already reviewed this product
 */

/**
 * @swagger
 * /reviews/{productId}:
 *   get:
 *     summary: Получить все отзывы на товар
 *     tags: [Review]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewsList'
 */
router.get('/:productId', controller.getProductReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Оставить/обновить отзыв на товар
 *     description: |
 *       Один пользователь — один отзыв на товар.
 *       Если отзыв уже есть — он обновляется (rating + text).
 *       Автоматически пересчитывается средний рейтинг товара.
 *     tags: [Review]
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
 *               - rating
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID товара
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               text:
 *                 type: string
 *                 example: Лучший телефон за свои деньги!
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewSuccess'
 *       400:
 *         $ref: '#/components/responses/ReviewBadRequest'
 */
router.post('/', auth, controller.addReview);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Удалить свой отзыв
 *     description: Пользователь может удалить только свой отзыв
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd7994390ff
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewSuccess'
 *       400:
 *         $ref: '#/components/responses/ReviewBadRequest'
 *       404:
 *         description: Отзыв не найден или не принадлежит вам
 */
router.delete('/:reviewId', auth, controller.removeReview);

/**
 * @swagger
 * /reviews/admin/{reviewId}:
 *   delete:
 *     summary: Удалить любой отзыв (только админ)
 *     tags: [Review — Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewSuccess'
 *       403:
 *         description: Доступ запрещён
 *       404:
 *         description: Отзыв не найден
 */
router.delete('/admin/:reviewId', auth, checkRole("admin"), controller.removeReview);

module.exports = router;