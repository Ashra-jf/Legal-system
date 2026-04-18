const pool = require('../config/db');

// LAWYER PROFILES
const getLawyerProfile = async (req, res) => {
    try {
        // Force lawyerId to req.user.id unless admin or it's a public GET view
        // Note: For public viewing (GET), we allow params.id. For mutations, we force.
        const lawyerId = req.params.id || (req.user && req.user.id);

        if (!lawyerId) {
            return res.status(400).json({ error: 'Lawyer ID required' });
        }

        const [rows] = await pool.execute(`
            SELECT u.id, u.name, u.email, u.is_active, u.created_at,
                   lp.*,
                   ls.rating, ls.total_cases, ls.cases_won
            FROM users u
            LEFT JOIN lawyer_profiles lp ON u.id = lp.lawyer_id
            LEFT JOIN lawyer_statistics ls ON u.id = ls.lawyer_id
            WHERE u.id = ? AND u.role = 'lawyer'
        `, [lawyerId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Lawyer not found' });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLawyerProfile = async (req, res) => {
    try {
        const lawyerId = (req.user.role === 'admin' && req.params.id) ? req.params.id : req.user.id;

        const { name, bar_registration, license_number, id_number, gender, marital_status, alternate_phone, experience_years, education, bio, consultation_fee, availability_status } = req.body;

        // Update name in users table if provided
        if (name) {
            await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, lawyerId]);
        }

        // Check if lawyer profile exists
        const [existing] = await pool.execute('SELECT id FROM lawyer_profiles WHERE lawyer_id = ?', [lawyerId]);

        if (existing.length === 0) {
            // Insert
            await pool.execute(
                `INSERT INTO lawyer_profiles 
                (lawyer_id, bar_registration, license_number, id_number, gender, marital_status, alternate_phone, experience_years, education, bio, consultation_fee, availability_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [lawyerId, bar_registration, license_number, id_number, gender, marital_status, alternate_phone, experience_years, education, bio, consultation_fee, availability_status]
            );
        } else {
            // Update
            await pool.execute(
                `UPDATE lawyer_profiles SET 
                bar_registration = ?, license_number = ?, id_number = ?, gender = ?, marital_status = ?, alternate_phone = ?, 
                experience_years = ?, education = ?, bio = ?, consultation_fee = ?, availability_status = ?
                WHERE lawyer_id = ?`,
                [bar_registration, license_number, id_number, gender, marital_status, alternate_phone, experience_years, education, bio, consultation_fee, availability_status, lawyerId]
            );
        }

        res.json({ message: 'Lawyer profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllLawyers = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM vw_lawyers');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLawyerSpecializations = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const [rows] = await pool.execute(
            `SELECT s.id, s.name, s.description 
             FROM lawyer_specializations ls
             JOIN specializations s ON ls.specialization_id = s.id
             WHERE ls.lawyer_id = ?`,
            [lawyerId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLawyerSpecializations = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const { specializationIds } = req.body; // Array of IDs

        // Clear existing
        await pool.execute('DELETE FROM lawyer_specializations WHERE lawyer_id = ?', [lawyerId]);

        // Insert new ones
        if (specializationIds && specializationIds.length > 0) {
            const values = specializationIds.map(id => [lawyerId, id]);
            // Constructing multi-insert query logic
            for (const id of specializationIds) {
                await pool.execute('INSERT INTO lawyer_specializations (lawyer_id, specialization_id) VALUES (?, ?)', [lawyerId, id]);
            }
        }
        res.json({ message: 'Specializations updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLawyerAvailability = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const [rows] = await pool.execute(
            `SELECT id, day_of_week, start_time, end_time, is_available 
             FROM appointment_slots 
             WHERE lawyer_id = ?
             ORDER BY day_of_week, start_time`,
            [lawyerId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const setLawyerAvailability = async (req, res) => {
    try {
        const lawyerId = req.params.id;
        const { slots } = req.body; // Array of { day_of_week, start_time, end_time, is_available }

        // Optionally delete existing slots for total replace, or update
        await pool.execute('DELETE FROM appointment_slots WHERE lawyer_id = ?', [lawyerId]);
        
        if (slots && slots.length > 0) {
            for (const slot of slots) {
                await pool.execute(
                    'INSERT INTO appointment_slots (lawyer_id, day_of_week, start_time, end_time, is_available) VALUES (?, ?, ?, ?, ?)',
                    [lawyerId, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available !== false]
                );
            }
        }
        
        res.json({ message: 'Availability slots updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CLIENT PROFILES
const getClientProfile = async (req, res) => {
    try {
        // Force clientId to req.user.id unless admin
        const clientId = (req.user.role === 'admin' && req.params.id) ? req.params.id : req.user.id;

        if (!clientId) return res.status(400).json({ error: 'Client ID required' });

        const [rows] = await pool.execute(`
            SELECT u.name, u.email, cp.* 
            FROM users u
            LEFT JOIN client_profiles cp ON u.id = cp.client_id
            WHERE u.id = ?
        `, [clientId]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateClientProfile = async (req, res) => {
    try {
        console.log('Update Profile Request Body:', req.body);
        // Force clientId to req.user.id unless admin
        const clientId = (req.user.role === 'admin' && req.params.id) ? req.params.id : req.user.id;

        const { name, phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name } = req.body;

        // Update name in users table if provided
        if (name) {
            await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, clientId]);
        }

        const [existing] = await pool.execute('SELECT id FROM client_profiles WHERE client_id = ?', [clientId]);

        if (existing.length === 0) {
            await pool.execute(
                `INSERT INTO client_profiles 
                (client_id, phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [clientId, phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name]
            );
        } else {
            await pool.execute(
                `UPDATE client_profiles SET 
                phone = ?, alternate_phone = ?, address = ?, city = ?, state = ?, postal_code = ?, 
                date_of_birth = ?, id_number = ?, gender = ?, marital_status = ?, occupation = ?, company_name = ?
                WHERE client_id = ?`,
                [phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name, clientId]
            );
        }

        res.json({ message: 'Client profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getLawyerProfile,
    updateLawyerProfile,
    getAllLawyers,
    getLawyerSpecializations,
    updateLawyerSpecializations,
    getLawyerAvailability,
    setLawyerAvailability,
    getClientProfile,
    updateClientProfile
};
