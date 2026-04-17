const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function fixPass() {
    const email = 'ash.jf07@gmail.com';
    const plainText = 'password123';
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainText, salt);
        await pool.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email]);
        console.log('Password updated successfully for', email);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fixPass();
