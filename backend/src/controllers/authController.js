const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../utils/email');
const { generateVerificationCode } = require('../utils/generateCode');

const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const role = 'client'; // Public signup is always 'client'
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, role, is_active, verification_code, verification_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email.toLowerCase(), passwordHash, role, false, verificationCode, expiresAt]
        );

        try {
            await sendVerificationEmail(email.toLowerCase(), verificationCode);
        } catch (emailErr) {
            console.error('Failed to send verification email, but user was created:', emailErr);
            // Optionally, we could still pass them to verification step if we assume they can resend later
        }

        res.status(201).json({ message: 'User registered successfully. Please verify your email.', email: email.toLowerCase() });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.is_active) {
            return res.status(403).json({ message: 'Please verify your email address to log in.', requiresVerification: true, email: user.email });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and verification code are required' });
        }

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        if (user.is_active) {
            return res.status(400).json({ error: 'User is already verified' });
        }

        if (user.verification_code !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date() > new Date(user.verification_expires_at)) {
            return res.status(400).json({ error: 'Verification code expired. Please sign up again or request a new one.' });
        }

        await pool.execute('UPDATE users SET is_active = true, verification_code = NULL, verification_expires_at = NULL WHERE id = ?', [user.id]);

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });

        res.json({ message: 'Email verified successfully', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    verifyEmail
};
