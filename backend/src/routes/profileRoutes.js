const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// For simplicity, defining routes here without strict auth token checks temporarily,
// or we can add token checks later once frontend fully integrates it.

// Lawyer routes
router.get('/lawyers', profileController.getAllLawyers);
router.get('/lawyer/:id', profileController.getLawyerProfile); // Specific lawyer
router.patch('/lawyer/:id', profileController.updateLawyerProfile);

router.get('/lawyer/:id/specializations', profileController.getLawyerSpecializations);
router.put('/lawyer/:id/specializations', profileController.updateLawyerSpecializations);

router.get('/lawyer/:id/availability', profileController.getLawyerAvailability);
router.put('/lawyer/:id/availability', profileController.setLawyerAvailability);

// Client routes
router.get('/client/:id', profileController.getClientProfile);
router.patch('/client/:id', profileController.updateClientProfile);

module.exports = router;
