require('dotenv').config();
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    try {
        // Admin
        const adminEmail = 'fathima0702@gmail.com';
        const adminPass = 'Admin@123';
        const adminHash = await bcrypt.hash(adminPass, 10);

        const [adminExists] = await pool.execute('SELECT * FROM users WHERE email = ?', [adminEmail]);
        if (adminExists.length > 0) {
            await pool.execute('UPDATE users SET password_hash = ?, is_active = true, role = "admin" WHERE email = ?', [adminHash, adminEmail]);
            console.log('Admin account updated.');
        } else {
            await pool.execute('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)', ['Admin Fathima', adminEmail, adminHash, 'admin', true]);
            console.log('Admin account created.');
        }

        // Lawyer
        const lawyerEmail = 'ash.jf07@gmail.com';
        const lawyerPass = 'Lawyer@123';
        const lawyerHash = await bcrypt.hash(lawyerPass, 10);

        const [lawyerExists] = await pool.execute('SELECT * FROM users WHERE email = ?', [lawyerEmail]);
        if (lawyerExists.length > 0) {
            await pool.execute('UPDATE users SET password_hash = ?, is_active = true, role = "lawyer" WHERE email = ?', [lawyerHash, lawyerEmail]);
            console.log('Lawyer account updated.');
        } else {
            await pool.execute('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?)', ['Lawyer Ash', lawyerEmail, lawyerHash, 'lawyer', true]);
            console.log('Lawyer account created.');
        }

        console.log('Success! Users created/updated.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
}

seedUsers();
