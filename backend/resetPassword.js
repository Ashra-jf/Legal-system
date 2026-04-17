require('dotenv').config();
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        const email = 'ash.jf07@gmail.com';
        const passwordPlain = 'password123';
        const passwordHash = await bcrypt.hash(passwordPlain, 10);

        const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            await pool.execute(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [passwordHash, email]
            );
            console.log(`Password for ${email} has been reset to: ${passwordPlain}`);
        } else {
            console.log(`User ${email} not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
}

resetPassword();
