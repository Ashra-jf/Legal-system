const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/categories', serviceController.getCategories);
router.get('/', serviceController.getServices);

// Admin-only mutation routes
router.post('/', authenticateToken, authorizeRole(['admin']), serviceController.createService);
router.put('/:id', authenticateToken, authorizeRole(['admin']), serviceController.updateService);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), serviceController.deleteService);

module.exports = router;
