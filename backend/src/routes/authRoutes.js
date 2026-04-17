const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules for registration
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@$!%*?&#)')
];

// Validation rules for login
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// Validation rules for verification
const verifyValidation = [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/verify-email', verifyValidation, authController.verifyEmail);

module.exports = router;
