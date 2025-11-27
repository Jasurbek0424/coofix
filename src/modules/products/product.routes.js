const router = require('express').Router();
const controller = require('./product.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: iPhone 15 Pro Max
 *         slug:
 *           type: string
 *           example: iphone-15-pro-max
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           example: 1399
 *         oldPrice:
 *           type: number
 *           nullable: true
 *           example: 1599
 *         category:
 *           type: object
 *           $ref: '#/components/schemas/Category'
 *         brand:
 *           type: object
 *           $ref: '#/components/schemas/Brand'
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           example: ["https://firebasestorage.googleapis.com/..."]
 *         characteristics:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           example:
 *             Дисплей: 6.7" OLED
 *             Процессор: A17 Pro
 *             Память: 512 ГБ
 *         inStock:
 *           type: boolean
 *         quantity:
 *           type: integer
 *         isNew:
 *           type: boolean
 *         isSale:
 *           type: boolean
 *         ratingAvg:
 *           type: number
 *           example: 4.8
 *         ratingCount:
 *           type: integer
 *           example: 128
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     ProductsList:
 *       description: Список товаров с пагинацией
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Product'
 *               total:
 *                 type: integer
 *                 description: Общее количество товаров (для пагинации)
 *
 *     ProductSuccess:
 *       description: Один товар
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *               product:
 *                 $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Все товары (с пагинацией)
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     summary: Товар по slug
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: iphone-15-pro-max
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductSuccess'
 */
router.get('/:slug', controller.getOne);

/**
 * @swagger
 * /products/new:
 *   get:
 *     summary: Новинки
 *     tags: [Product]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/new', controller.getNew);

/**
 * @swagger
 * /products/sale:
 *   get:
 *     summary: Товары со скидкой
 *     tags: [Product]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/sale', controller.getSale);

/**
 * @swagger
 * /products/search:
 *   get:
 *     summary: Поиск по названию
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         example: iphone
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/search', controller.search);

/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Фильтрация товаров
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/filter', controller.filter);

/**
 * @swagger
 * /products/related/{slug}:
 *   get:
 *     summary: Похожие товары (из той же категории)
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Массив похожих товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 related:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/related/:slug', controller.related);

/**
 * @swagger
 * /products/category/{slug}:
 *   get:
 *     summary: Все товары в категории
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: smartphones
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/category/:slug', controller.getByCategory);

/**
 * @swagger
 * /products/brand/{slug}:
 *   get:
 *     summary: Все товары бренда
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: apple
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ProductsList'
 */
router.get('/brand/:slug', controller.getByBrand);

module.exports = router;