const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All admin routes are protected and require 'admin' role
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings/:key', adminController.updateSystemSetting);

module.exports = router;
