const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', appointmentController.getAppointments);
router.post('/', authorizeRole(['client', 'admin']), appointmentController.createAppointment);
router.patch('/:id', appointmentController.updateAppointmentStatus);

module.exports = router;
