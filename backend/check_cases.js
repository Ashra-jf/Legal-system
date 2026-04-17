require('dotenv').config();
const pool = require('./src/config/db');

async function checkCases() {
    try {
        const [cases] = await pool.execute("SELECT id, case_number, title, status FROM cases WHERE client_id = 1");
        console.log("All cases for client 1:", cases);
        
    } catch (e) {
        console.error('Failed:', e);
    } finally {
        process.exit(0);
    }
}
checkCases();
