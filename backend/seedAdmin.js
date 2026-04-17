require('dotenv').config();
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const email = 'fathimaashra0702@gmail.com';
        const passwordPlain = 'admin123'; // Default temp password
        const passwordHash = await bcrypt.hash(passwordPlain, 10);

        // Check if admin already exists
        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('Admin already exists. Updating password and verifying...');
            await pool.execute(
                'UPDATE users SET password_hash = ?, is_active = true, role = "admin" WHERE email = ?',
                [passwordHash, email]
            );
        } else {
            console.log('Creating new admin...');
            await pool.execute(
                'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)',
                ['System Administrator', email, passwordHash, 'admin', true]
            );
        }

        console.log(`Success! Admin account ${email} created/updated with password: ${passwordPlain}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
