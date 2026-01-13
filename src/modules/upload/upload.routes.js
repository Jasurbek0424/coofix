const router = require('express').Router();
const upload = require('../../core/utils/upload');
const controller = require('./upload.controller');

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /upload/single:
 *   post:
 *     summary: Upload a single image
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image:
 *                   type: object
 *                   description: Cloudinary image object
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post('/single', upload.single('image'), controller.uploadSingle);

/**
 * @swagger
 * /upload/multiple:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Cloudinary image object
 *       400:
 *         description: No files uploaded
 *       500:
 *         description: Server error
 */
router.post('/multiple', upload.array('images', 10), controller.uploadMultiple);

module.exports = router;
