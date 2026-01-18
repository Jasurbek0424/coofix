const router = require('express').Router();
const controller = require('./wholesale.controller');

/**
 * @swagger
 * tags:
 *   name: Wholesale
 *   description: Wholesale application management
 */

/**
 * @swagger
 * /wholesale:
 *   post:
 *     summary: Submit a wholesale application
 *     tags: [Wholesale]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               comment:
 *                 type: string
 *               file:
 *                 type: string
 *                 description: URL of the attached file
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       500:
 *         description: Server error
 */
router.post('/', controller.createWholesale);

/**
 * @swagger
 * /wholesale:
 *   get:
 *     summary: Get all wholesale applications
 *     tags: [Wholesale]
 *     responses:
 *       200:
 *         description: List of applications
 *       500:
 *         description: Server error
 */
router.get('/', controller.getAllWholesales);

/**
 * @swagger
 * /wholesale/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Wholesale]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, processed, rejected]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', controller.updateWholesaleStatus);

module.exports = router;
