const router = require('express').Router();
const controller = require('./category.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Смартфоны
 *         slug:
 *           type: string
 *           example: smartphones
 *         parent:
 *           oneOf:
 *             - type: string
 *               nullable: true
 *               example: 507f191e810c19729de860ea
 *             - type: null
 *           description: ID родительской категории (null = корневая)
 *         image:
 *           type: string
 *           nullable: true
 *           example: https://example.com/categories/smartphones.jpg
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - slug
 *
 *     CategoryCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Ноутбуки
 *         parent:
 *           type: string
 *           nullable: true
 *           description: ID родительской категории (если подкатегория)
 *           example: 507f191e810c19729de860ea
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL изображения категории
 *           example: https://example.com/categories/laptops.jpg
 *
 *     CategoryUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Игровые ноутбуки
 *         parent:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *
 *   responses:
 *     CategorySuccess:
 *       description: Успешный ответ с данными категории
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               category:
 *                 $ref: '#/components/schemas/Category'
 *
 *     CategoriesList:
 *       description: Список всех категорий
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               categories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Category'
 *
 *     CategoryDeleted:
 *       description: Категория успешно удалена
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *
 *     CategoryBadRequest:
 *       description: Ошибка валидации, дублирование slug и т.п.
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
 *                 example: E11000 duplicate key error collection: db.categories index: slug...
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Category]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoriesList'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     summary: Получить категорию по slug
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: smartphones
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       404:
 *         description: Категория не найдена
 */
router.get('/:slug', controller.getOne);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Создать новую категорию (только админ)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryCreateRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       400:
 *         $ref: '#/components/responses/CategoryBadRequest'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Обновить категорию по ID (только админ)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryUpdateRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       400:
 *         $ref: '#/components/responses/CategoryBadRequest'
 *       404:
 *         description: Категория не найдена
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Удалить категорию по ID (только админ)
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategoryDeleted'
 *       404:
 *         description: Категория не найдена
 */
router.delete('/:id', controller.remove);

module.exports = router;