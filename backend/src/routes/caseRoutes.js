const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply authentication to ALL case routes
router.use(authenticateToken);

router.get('/', caseController.getCases);
router.post('/', caseController.createCase);
router.get('/:id', caseController.getCaseById);
router.patch('/:id', caseController.updateCase);

router.get('/:id/updates', caseController.getCaseUpdates);
router.post('/:id/updates', caseController.addCaseUpdate);

module.exports = router;
