const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function testPass() {
    const email = 'ash.jf07@gmail.com';
    const plainText = 'password123';
    try {
        const [rows] = await pool.execute('SELECT password_hash FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            const hash = rows[0].password_hash;
            console.log('Hash:', hash);
            const isMatch = await bcrypt.compare(plainText, hash);
            console.log('Password match:', isMatch);
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testPass();
