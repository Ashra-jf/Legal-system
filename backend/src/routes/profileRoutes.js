const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Apply authentication to ALL profile routes
router.use(authenticateToken);

// Lawyer routes
router.get('/lawyers', profileController.getAllLawyers);
router.get('/lawyer/:id', profileController.getLawyerProfile);
router.patch('/lawyer/:id', authorizeRole(['lawyer', 'admin']), profileController.updateLawyerProfile);

router.get('/lawyer/:id/specializations', profileController.getLawyerSpecializations);
router.put('/lawyer/:id/specializations', authorizeRole(['lawyer', 'admin']), profileController.updateLawyerSpecializations);

router.get('/lawyer/:id/availability', profileController.getLawyerAvailability);
router.put('/lawyer/:id/availability', authorizeRole(['lawyer', 'admin']), profileController.setLawyerAvailability);

// Client routes
router.get('/client/:id', authorizeRole(['client', 'admin']), profileController.getClientProfile);
router.patch('/client/:id', authorizeRole(['client', 'admin']), profileController.updateClientProfile);

module.exports = router;
