const pool = require('../config/db');

// LAWYER PROFILES
const getLawyerProfile = async (req, res) => {
    try {
        const idParam = req.params.id;
        const lawyerId = (idParam === 'me' || !idParam) ? req.user.id : idParam;
        
        const p_lawyerId = lawyerId === undefined ? null : lawyerId;

        if (p_lawyerId === null) {
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
        `, [p_lawyerId]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Lawyer not found' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Get Lawyer Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch lawyer profile', details: error.message });
    }
};

const updateLawyerProfile = async (req, res) => {
    try {
        const idParam = req.params.id;
        const lawyerId = (idParam === 'me' || !idParam) ? req.user.id : idParam;

        // Sanitize incoming data: convert empty strings to null
        const sanitized = {};
        Object.keys(req.body).forEach(key => {
            sanitized[key] = req.body[key] === '' ? null : req.body[key];
        });

        const { 
            name, 
            bar_registration = null, 
            license_number = null, 
            firm_role = null, 
            jurisdiction = null, 
            id_number = null, 
            gender = null, 
            marital_status = null, 
            phone = null, 
            alternate_phone = null, 
            address = null, 
            city = null, 
            state = null, 
            postal_code = null, 
            date_of_birth = null, 
            experience_years: rawExp = 0, 
            education = null, 
            bio = null, 
            consultation_fee: rawFee = 0, 
            availability_status = 'available' 
        } = sanitized;

        // Final numeric sanitization (handle NaN)
        const experience_years = isNaN(parseInt(rawExp)) ? 0 : parseInt(rawExp);
        const consultation_fee = isNaN(parseFloat(rawFee)) ? 0 : parseFloat(rawFee);

        // Final safety check: Ensure NO value is undefined before passing to SQL
        const p_lawyerId = lawyerId === undefined ? null : lawyerId;
        const p_name = name === undefined ? null : name;

        // Update name in users table if provided
        if (p_name) {
            await pool.execute('UPDATE users SET name = ? WHERE id = ?', [p_name, p_lawyerId]);
        }

        // Check if lawyer profile exists
        const [existing] = await pool.execute('SELECT id FROM lawyer_profiles WHERE lawyer_id = ?', [p_lawyerId]);

        // Dynamic Update: Only update fields that are actually sent in req.body
        if (existing.length === 0) {
            // Insert - same as before but use sanitized object for defaults
            const insertParams = [p_lawyerId, bar_registration, license_number, firm_role, jurisdiction, id_number, gender, marital_status, phone, alternate_phone, address, city, state, postal_code, date_of_birth, experience_years, education, bio, consultation_fee, availability_status]
                .map(val => val === undefined ? null : val);

            await pool.execute(
                `INSERT INTO lawyer_profiles 
                (lawyer_id, bar_registration, license_number, firm_role, jurisdiction, id_number, gender, marital_status, phone, alternate_phone, address, city, state, postal_code, date_of_birth, experience_years, education, bio, consultation_fee, availability_status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                insertParams
            );
        } else {
            // Update - only fields present in req.body
            const updateFields = [];
            const updateValues = [];

            // List of potential columns
            const columns = [
                'bar_registration', 'license_number', 'firm_role', 'jurisdiction', 'id_number', 'gender', 'marital_status', 
                'phone', 'alternate_phone', 'address', 'city', 'state', 'postal_code', 'date_of_birth', 
                'experience_years', 'education', 'bio', 'consultation_fee', 'availability_status'
            ];

            columns.forEach(col => {
                if (req.body[col] !== undefined) {
                    updateFields.push(`${col} = ?`);
                    // Sanitize empty strings to null
                    let val = req.body[col] === '' ? null : req.body[col];
                    // Handle numbers
                    if (col === 'experience_years' || col === 'consultation_fee') {
                        val = isNaN(parseFloat(val)) ? 0 : parseFloat(val);
                    }
                    updateValues.push(val);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(p_lawyerId);
                const sql = `UPDATE lawyer_profiles SET ${updateFields.join(', ')} WHERE lawyer_id = ?`;
                await pool.execute(sql, updateValues);
            }
        }

        res.json({ message: 'Lawyer profile updated successfully' });
    } catch (error) {
        console.error('Lawyer Profile Update Error:', error);
        res.status(500).json({ 
            error: 'Failed to update lawyer profile', 
            details: error.message,
            code: error.code
        });
    }
};

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, case_id, appointment_id, payment_id, description } = req.body;
        const rawUploadedBy = req.user ? req.user.id : 1;
        const uploaded_by = rawUploadedBy === undefined ? null : rawUploadedBy;

        // Enforce at most one entity reference constraint
        const entitiesCount = (case_id ? 1 : 0) + (appointment_id ? 1 : 0) + (payment_id ? 1 : 0);
        if (entitiesCount > 1) {
            return res.status(400).json({ error: 'Document can only belong to one entity type (case, appointment, or payment)' });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        const fileSize = req.file.size;

        const params = [
            title || req.file.originalname, 
            filePath, 
            fileType, 
            fileSize, 
            uploaded_by, 
            case_id === undefined ? null : case_id, 
            appointment_id === undefined ? null : appointment_id, 
            payment_id === undefined ? null : payment_id, 
            description === undefined ? null : description
        ].map(v => v === undefined ? null : v);

        const [result] = await pool.execute(
            `INSERT INTO documents 
            (title, file_path, file_type, file_size, uploaded_by, case_id, appointment_id, payment_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params
        );
        res.status(201).json({ id: result.insertId, message: 'Document uploaded successfully', filePath });
    } catch (error) {
        console.error('Upload Document Error:', error);
        res.status(500).json({ error: 'Failed to upload document', details: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const { case_id, appointment_id, payment_id } = req.query;
        let query = 'SELECT * FROM documents WHERE 1=1';
        const params = [];

        if (case_id) { query += ' AND case_id = ?'; params.push(case_id === undefined ? null : case_id); }
        if (appointment_id) { query += ' AND appointment_id = ?'; params.push(appointment_id === undefined ? null : appointment_id); }
        if (payment_id) { query += ' AND payment_id = ?'; params.push(payment_id === undefined ? null : payment_id); }

        query += ' ORDER BY uploaded_at DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get Documents Error:', error);
        res.status(500).json({ error: 'Failed to fetch documents', details: error.message });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const docId = req.params.id === undefined ? null : req.params.id;
        const [rows] = await pool.execute('SELECT file_path, title FROM documents WHERE id = ?', [docId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Document not found' });

        const filePath = rows[0].file_path;
        res.download(filePath, rows[0].title);
    } catch (error) {
        console.error('Download Document Error:', error);
        res.status(500).json({ error: 'Failed to download document', details: error.message });
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
        const idParam = req.params.id;
        const clientId = (idParam === 'me' || !idParam) ? req.user.id : idParam;
        
        const p_clientId = clientId === undefined ? null : clientId;

        if (p_clientId === null) {
            return res.status(400).json({ error: 'Client ID required' });
        }

        const [rows] = await pool.execute(`
            SELECT u.name, u.email, cp.* 
            FROM users u
            LEFT JOIN client_profiles cp ON u.id = cp.client_id
            WHERE u.id = ?
        `, [p_clientId]);
        
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });

        res.json(rows[0]);
    } catch (error) {
        console.error('Get Client Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch client profile', details: error.message });
    }
};

const updateClientProfile = async (req, res) => {
    try {
        console.log('Update Profile Request Body:', req.body);
        const idParam = req.params.id;
        const clientId = (idParam === 'me' || !idParam) ? req.user.id : idParam;

        // Sanitize incoming data: convert empty strings to null
        const sanitized = {};
        Object.keys(req.body).forEach(key => {
            sanitized[key] = req.body[key] === '' ? null : req.body[key];
        });

        const { 
            name, phone = null, alternate_phone = null, address = null, city = null, state = null, 
            postal_code = null, date_of_birth = null, id_number = null, gender = null, 
            marital_status = null, occupation = null, company_name = null 
        } = sanitized;

        // Final safety map
        const p_clientId = clientId === undefined ? null : clientId;
        const p_name = name === undefined ? null : name;

        // Update name in users table if provided
        if (p_name) {
            await pool.execute('UPDATE users SET name = ? WHERE id = ?', [p_name, p_clientId]);
        }

        const [existing] = await pool.execute('SELECT id FROM client_profiles WHERE client_id = ?', [p_clientId]);

        if (existing.length === 0) {
            const insertParams = [p_clientId, phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name]
                .map(val => val === undefined ? null : val);

            await pool.execute(
                `INSERT INTO client_profiles 
                (client_id, phone, alternate_phone, address, city, state, postal_code, date_of_birth, id_number, gender, marital_status, occupation, company_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                insertParams
            );
        } else {
            const updateFields = [];
            const updateValues = [];
            const columns = ['phone', 'alternate_phone', 'address', 'city', 'state', 'postal_code', 'date_of_birth', 'id_number', 'gender', 'marital_status', 'occupation', 'company_name'];

            columns.forEach(col => {
                if (req.body[col] !== undefined) {
                    updateFields.push(`${col} = ?`);
                    updateValues.push(req.body[col] === '' ? null : req.body[col]);
                }
            });

            if (updateFields.length > 0) {
                updateValues.push(p_clientId);
                const sql = `UPDATE client_profiles SET ${updateFields.join(', ')} WHERE client_id = ?`;
                await pool.execute(sql, updateValues);
            }
        }

        res.json({ message: 'Client profile updated successfully' });
    } catch (error) {
        console.error('Client Profile Update Error:', error);
        res.status(500).json({ 
            error: 'Failed to update client profile', 
            details: error.message,
            code: error.code
        });
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
