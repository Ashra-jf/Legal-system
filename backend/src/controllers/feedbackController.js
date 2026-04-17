const pool = require('../config/db');
const { createNotification } = require('./notificationController');

const getFeedback = async (req, res) => {
    try {
        const { lawyer_id, client_id } = req.query;
        let query = 'SELECT f.*, c.name as client_name, lw.name as lawyer_name, cs.case_number, cs.title as case_title FROM feedback f JOIN users c ON f.client_id = c.id LEFT JOIN users lw ON f.lawyer_id = lw.id LEFT JOIN cases cs ON f.case_id = cs.id WHERE f.is_published = TRUE';
        let params = [];

        if (lawyer_id) {
            query += ' AND f.lawyer_id = ?';
            params.push(lawyer_id);
        }
        
        if (client_id) {
            query += ' AND f.client_id = ?';
            params.push(client_id);
        }

        query += ' ORDER BY f.created_at DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitFeedback = async (req, res) => {
    try {
        const { client_id, lawyer_id, case_id, appointment_id, service_id, rating, comment } = req.body;
        const finalClientId = (req.user && req.user.role === 'client') ? req.user.id : client_id;

        const videoFileName = req.file ? req.file.filename : (req.body.video_file_name || null);

        const [result] = await pool.execute(
            `INSERT INTO feedback 
            (client_id, lawyer_id, case_id, appointment_id, service_id, rating, comment, video_file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalClientId, lawyer_id, case_id || null, appointment_id || null, service_id || null, rating, comment || null, videoFileName]
        );

        // --- Notification Triggers ---
        
        // 1. Notify targeted lawyer
        if (lawyer_id) {
            await createNotification(
                lawyer_id,
                'message',
                'New Client Feedback',
                `A client has just left a ${rating}-star feedback rating on your closed case.`,
                { case_id: case_id || null }
            );
        }

        // 2. Notify all admins
        const [admins] = await pool.execute('SELECT id FROM users WHERE role = "admin"');
        for (const admin of admins) {
            await createNotification(
                admin.id,
                'system',
                'New Feedback Logged',
                `System recorded a ${rating}-star client feedback for Lawyer ID ${lawyer_id}.`,
                { case_id: case_id || null }
            );
        }

        res.status(201).json({ id: result.insertId, message: 'Feedback submitted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFeedback,
    submitFeedback
};
