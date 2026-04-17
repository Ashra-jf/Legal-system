require('dotenv').config({ path: '.env' });
const pool = require('./src/config/db');

async function fixDB() {
    try {
        console.log('1. Deleting ghost cases...');
        // Delete all Deed Transfer Files for client 1
        await pool.execute("DELETE FROM cases WHERE title = 'Deed Transfer File' AND client_id = 1");
        
        console.log('2. Altering cases table...');
        try {
            await pool.execute('ALTER TABLE cases ADD COLUMN appointment_id INT DEFAULT NULL');
            await pool.execute('ALTER TABLE cases ADD CONSTRAINT fk_cases_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL');
        } catch(e) {
            console.log('Column might already exist:', e.message);
        }
        
    } catch (e) {
        console.error('Failed:', e);
    } finally {
        process.exit(0);
    }
}
fixDB();
