const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// router.use(authenticateToken); // Enable later

router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id/download', documentController.downloadDocument);

module.exports = router;
