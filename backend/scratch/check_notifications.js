const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'legal_mgmt'
    });

    try {
        const [rows] = await connection.execute(
            'SELECT user_id, count(*) as count FROM notifications WHERE is_read = FALSE GROUP BY user_id'
        );
        console.log('Unread Notifications per User:');
        console.table(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

check();
