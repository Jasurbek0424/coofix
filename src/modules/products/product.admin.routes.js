const router = require('express').Router();
const controller = require('./product.admin.controller');
const auth = require('../../core/middleware/auth');
const checkRole = require('../../core/middleware/role');

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Создать товар (админ)
 *     tags: [Product — Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - brand
 *             properties:
 *               name:
 *                 type: string
 *                 example: MacBook Pro 16"
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 2499
 *               oldPrice:
 *                 type: number
 *                 nullable: true
 *               category:
 *                 type: string
 *                 description: ID категории
 *               brand:
 *                 type: string
 *                 description: ID бренда
 *               images:
 *                 type: array
 *                 items: { type: string }
 *               characteristics:
 *                 type: object
 *                 additionalProperties: { type: string }
 *               quantity:
 *                 type: integer
 *                 default: 0
 *               isNew:
 *                 type: boolean
 *               isSale:
 *                 type: boolean
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductSuccess'
 *       400:
 *         description: Ошибка валидации / дубликат slug
 */
router.post('/', auth, checkRole('admin'), controller.create);

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Обновить товар (админ)
 *     tags: [Product — Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               oldPrice: { type: number, nullable: true }
 *               images: { type: array, items: { type: string } }
 *               characteristics: { type: object }
 *               quantity: { type: integer }
 *               isNew: { type: boolean }
 *               isSale: { type: boolean }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductSuccess'
 */
router.put('/:id', auth, checkRole('admin'), controller.update);

/**
 * @swagger
 * /admin/products/{id}:
 *   delete:
 *     summary: Удалить товар (админ)
 *     tags: [Product — Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Успешно удалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 */
router.delete('/:id', auth, checkRole('admin'), controller.remove);

/**
 * @swagger
 * /admin/products/{id}/stock:
 *   patch:
 *     summary: Обновить остаток на складе (админ)
 *     tags: [Product — Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 15
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductSuccess'
 */
router.patch('/:id/stock', auth, checkRole('admin'), controller.updateStock);

module.exports = router;