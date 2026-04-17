const pool = require('../config/db');
const path = require('path');

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, case_id, appointment_id, payment_id, description } = req.body;
        const uploaded_by = req.user ? req.user.id : 1; // Fallback

        // Enforce at most one entity reference constraint
        const entitiesCount = (case_id ? 1 : 0) + (appointment_id ? 1 : 0) + (payment_id ? 1 : 0);
        if (entitiesCount > 1) {
            return res.status(400).json({ error: 'Document can only belong to one entity type (case, appointment, or payment)' });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        const fileSize = req.file.size;

        const [result] = await pool.execute(
            `INSERT INTO documents 
            (title, file_path, file_type, file_size, uploaded_by, case_id, appointment_id, payment_id, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title || req.file.originalname, filePath, fileType, fileSize, uploaded_by, case_id || null, appointment_id || null, payment_id || null, description || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Document uploaded successfully', filePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const { case_id, appointment_id, payment_id } = req.query;
        let query = 'SELECT * FROM documents WHERE 1=1';
        const params = [];

        if (case_id) { query += ' AND case_id = ?'; params.push(case_id); }
        if (appointment_id) { query += ' AND appointment_id = ?'; params.push(appointment_id); }
        if (payment_id) { query += ' AND payment_id = ?'; params.push(payment_id); }

        query += ' ORDER BY uploaded_at DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT file_path, title FROM documents WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Document not found' });

        const filePath = rows[0].file_path;
        res.download(filePath, rows[0].title);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    downloadDocument
};
