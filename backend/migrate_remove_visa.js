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

        console.log('Connected to DB. Running Visa/Immigration purge and strict seeding...');

        // 1. Delete all existing specializations, categories, and services
        console.log('Clearing existing data...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('TRUNCATE TABLE lawyer_services');
        await connection.query('TRUNCATE TABLE services');
        await connection.query('TRUNCATE TABLE service_categories');
        await connection.query('TRUNCATE TABLE lawyer_specializations');
        await connection.query('TRUNCATE TABLE specializations');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Insert exactly the 6 requested specializations
        console.log('Inserting the 6 specified Core Law Types...');
        await connection.query(`
            INSERT INTO specializations (name, description) VALUES
            ('Corporate Law', 'Legal practice related to business and corporate matters'),
            ('Criminal Law', 'Legal practice focused on crimes and criminal proceedings'),
            ('Family Law', 'Legal practice concerning family matters and domestic relations'),
            ('Property Law', 'Legal practice concerning property and real estate transactions'),
            ('Contract Law', 'Legal practice concerning agreements and contracts'),
            ('Legal Documentation', 'Legal practice concerning the drafting of legal documents');
        `);

        // 3. Insert Service Categories matching the Law Types (for simplicity)
        await connection.query(`
            INSERT INTO service_categories (name, description, icon, display_order) VALUES
            ('Corporate Law Services', 'Business formation, compliance, and corporate disputes', 'Briefcase', 1),
            ('Criminal Law Services', 'Defense and representation in criminal proceedings', 'Scale', 2),
            ('Family Law Services', 'Divorce, custody, and domestic matters', 'Users', 3),
            ('Property Law Services', 'Real estate transactions and property disputes', 'Home', 4),
            ('Contract Law Services', 'Contract drafting, review, and disputes', 'FileSignature', 5),
            ('Legal Documentation', 'Preparation of wills, trusts, and other legal documents', 'FileText', 6);
        `);

        // 4. Insert Default Services under each category
        await connection.query(`
            INSERT INTO services (category_id, name, description, base_fee, duration_minutes) VALUES
            (1, 'Corporate Consultation', 'Initial business consultation', 10000.00, 60),
            (1, 'Business Formation', 'Company registration and structuring', 25000.00, 120),
            
            (2, 'Criminal Defense Consultation', 'Initial consultation for criminal matters', 8000.00, 60),
            (2, 'Court Representation (Criminal)', 'Representation in criminal court', 35000.00, 180),
            
            (3, 'Family Law Consultation', 'Initial consultation for family matters', 6000.00, 60),
            (3, 'Divorce Filing', 'Preparation and filing of divorce proceedings', 20000.00, 120),
            
            (4, 'Property Dispute Consultation', 'Consultation for property issues', 7000.00, 60),
            (4, 'Deed Transfer', 'Legal transfer of property deeds', 15000.00, 90),
            
            (5, 'Contract Drafting', 'Professional drafting of legal agreements', 12000.00, 90),
            (5, 'Contract Review', 'Comprehensive review of existing contracts', 8000.00, 60),
            
            (6, 'Will Preparation', 'Drafting of Last Will and Testament', 10000.00, 90),
            (6, 'Power of Attorney', 'Drafting Power of Attorney documents', 5000.00, 45);
        `);

        console.log('Migration successful: Database cleanly seeded with ONLY the 6 specified Law categories. Visa/Immigration completely purged.');

        await connection.end();
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
