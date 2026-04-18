const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/admin', authorizeRole(['admin']), dashboardController.getAdminStats);
router.get('/lawyer', authorizeRole(['lawyer', 'admin']), dashboardController.getLawyerStats);
router.get('/client', authorizeRole(['client', 'admin']), dashboardController.getClientStats);

module.exports = router;
