const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Apply authentication to ALL feedback routes
router.use(authenticateToken);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Clean original filename space characters to prevent URI encoding issues later
        const cleanName = file.originalname.replace(/\s+/g, '_');
        cb(null, 'feedback-' + uniqueSuffix + '-' + cleanName);
    }
});

const upload = multer({ storage: storage });

router.get('/', feedbackController.getFeedback);
router.post('/', upload.single('video'), feedbackController.submitFeedback);

module.exports = router;
