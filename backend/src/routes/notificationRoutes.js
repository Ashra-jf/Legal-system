const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getUserNotifications);
router.post('/broadcast', notificationController.broadcastNotification);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
