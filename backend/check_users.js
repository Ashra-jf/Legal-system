const fs = require('fs');
const pool = require('./src/config/db');

async function check() {
    try {
        const [users] = await pool.execute('SELECT id, email, role, is_active FROM users');
        fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
