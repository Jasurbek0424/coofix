const router = require('express').Router();
const controller = require('./brand.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Apple
 *         slug:
 *           type: string
 *           example: apple
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL логотипа бренда
 *           example: https://example.com/brands/apple-logo.png
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
 *     BrandCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: Samsung
 *         image:
 *           type: string
 *           nullable: true
 *           description: URL логотипа бренда (опционально)
 *           example: https://example.com/brands/samsung.png
 *
 *     BrandUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           example: Samsung Electronics
 *         image:
 *           type: string
 *           nullable: true
 *           example: https://example.com/brands/samsung-new.png
 *
 *   responses:
 *     BrandSuccess:
 *       description: Успешный ответ с данными бренда
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               brand:
 *                 $ref: '#/components/schemas/Brand'
 *
 *     BrandsList:
 *       description: Список всех брендов
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               brands:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Brand'
 *
 *     BrandDeleted:
 *       description: Бренд успешно удалён
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *
 *     BadRequest:
 *       description: Ошибка валидации или дублирование slug/name
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
 *                 example: E11000 duplicate key error collection... (или твоя кастомная ошибка)
 *
 *     NotFound:
 *       description: Бренд не найден
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
 *                 example: Brand not found
 */

/**
 * @swagger
 * /brands:
 *   get:
 *     summary: Получить список всех брендов
 *     tags: [Brand]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BrandsList'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /brands/{slug}:
 *   get:
 *     summary: Получить бренд по slug
 *     tags: [Brand]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: apple
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BrandSuccess'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:slug', controller.getOne);

/**
 * @swagger
 * /brands:
 *   post:
 *     summary: Создать новый бренд (только админ)
 *     tags: [Brand]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandCreateRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BrandSuccess'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', controller.create);

/**
 * @swagger
 * /brands/{id}:
 *   put:
 *     summary: Обновить бренд по ID (только админ)
 *     tags: [Brand]
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
 *             $ref: '#/components/schemas/BrandUpdateRequest'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/BrandSuccess'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /brands/{id}:
 *   delete:
 *     summary: Удалить бренд по ID (только админ)
 *     tags: [Brand]
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
 *         $ref: '#/components/responses/BrandDeleted'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', controller.remove);

module.exports = router;