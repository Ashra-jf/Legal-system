const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/admin', dashboardController.getAdminStats);
router.get('/lawyer', dashboardController.getLawyerStats);
router.get('/client', dashboardController.getClientStats);

module.exports = router;
