const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'legal_mgmt'
        });

        console.log('Connected to DB. Running migration...');
        
        // Add columns if they don't exist
        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10) NULL, 
            ADD COLUMN IF NOT EXISTS verification_expires_at DATETIME NULL;
        `);
        console.log('Migration successful: Added verification_code and verification_expires_at to users.');
        
        await connection.end();
    } catch (err) {
        // If it throws "Duplicate column name", ignore the error
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Migration failed:', err);
        }
        process.exit(1);
    }
}

migrate();
