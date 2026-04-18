const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Apply authentication to ALL payment routes
router.use(authenticateToken);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'receipt-' + uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Payments
router.get('/', paymentController.getPayments);
router.post('/', paymentController.createPayment);
router.patch('/:id/verify', paymentController.verifyPayment);
router.post('/:id/receipt', upload.single('receipt'), paymentController.uploadReceipt);

// Invoices
router.get('/invoices', paymentController.getInvoices);
router.post('/invoices', paymentController.createInvoice);

module.exports = router;
