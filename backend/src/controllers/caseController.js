const pool = require('../config/db');
const { createNotification } = require('./notificationController');

// Get all cases (filtered by user role)
const getCases = async (req, res) => {
    try {
        let query;
        let params = [];

        const baseQuery = `
            SELECT c.*, cl.name as client_name, lw.name as lawyer_name, s.name as service_name
            FROM cases c
            JOIN users cl ON c.client_id = cl.id
            JOIN users lw ON c.lawyer_id = lw.id
            LEFT JOIN services s ON c.service_id = s.id
        `;

        if (req.user && req.user.role === 'client') {
            query = baseQuery + ' WHERE c.client_id = ?';
            params.push(req.user.id);
        } else if (req.user && req.user.role === 'lawyer') {
            query = baseQuery + ' WHERE c.lawyer_id = ?';
            params.push(req.user.id);
        } else {
            // Admin sees all
            query = baseQuery;
        }

        query += ' ORDER BY c.created_at DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCaseById = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT c.*, cl.name as client_name, lw.name as lawyer_name, s.name as service_name
            FROM cases c
            JOIN users cl ON c.client_id = cl.id
            JOIN users lw ON c.lawyer_id = lw.id
            LEFT JOIN services s ON c.service_id = s.id
            WHERE c.id = ?
        `, [req.params.id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Case not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createCase = async (req, res) => {
    try {
        const { case_number, client_id, lawyer_id, service_id, title, description, case_type, priority } = req.body;
        
        const [result] = await pool.execute(
            `INSERT INTO cases 
            (case_number, client_id, lawyer_id, service_id, title, description, case_type, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [case_number, client_id, lawyer_id, service_id || null, title, description, case_type, priority || 'medium']
        );
        res.status(201).json({ id: result.insertId, message: 'Case created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCase = async (req, res) => {
    try {
        const caseId = req.params.id;
        const body = req.body || {};

        // mysql2 rejects undefined — every param must be null or a real value
        const toNull = (v) => (v === undefined || v === '' ? null : v);

        const status = toNull(body.status);
        const next_hearing_date = toNull(body.next_hearing_date);
        const closing_date = toNull(body.closing_date);
        const judge_name = toNull(body.judge_name);
        const court_name = toNull(body.court_name);
        const filing_date = toNull(body.filing_date);

        await pool.execute(
            `UPDATE cases SET 
            status = COALESCE(?, status),
            next_hearing_date = COALESCE(?, next_hearing_date),
            closing_date = COALESCE(?, closing_date),
            judge_name = COALESCE(?, judge_name),
            court_name = COALESCE(?, court_name),
            filing_date = COALESCE(?, filing_date)
            WHERE id = ?`,
            [status, next_hearing_date, closing_date, judge_name, court_name, filing_date, caseId]
        );
        res.json({ message: 'Case updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCaseUpdates = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT cu.*, u.name as updated_by_name 
            FROM case_updates cu
            JOIN users u ON cu.updated_by = u.id
            WHERE cu.case_id = ?
            ORDER BY cu.created_at DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addCaseUpdate = async (req, res) => {
    try {
        const body = req.body || {};
        const update_type = body.update_type || 'note';
        const title = body.title || null;
        const description = body.description || null;
        const next_action = body.next_action || null;
        const next_action_date = body.next_action_date || null;
        const updated_by = req.user ? req.user.id : null;

        if (!updated_by) {
            return res.status(401).json({ error: 'Authentication required to add updates' });
        }

        await pool.execute(
            `INSERT INTO case_updates 
            (case_id, updated_by, update_type, title, description, next_action, next_action_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, updated_by, update_type, title, description, next_action, next_action_date]
        );

        // Fetch case to get target users and case specifics
        const [caseRows] = await pool.execute('SELECT client_id, lawyer_id, case_number FROM cases WHERE id = ?', [req.params.id]);
        if (caseRows.length > 0) {
            const caseData = caseRows[0];
            const isClientQuery = title === 'Client Query';

            if (isClientQuery) {
                // Notify Lawyer
                await createNotification(
                    caseData.lawyer_id, 
                    'message', 
                    `Client Query on ${caseData.case_number}`, 
                    `The client has submitted a new query regarding case ${caseData.case_number}.`, 
                    { case_id: req.params.id }
                );
            } else {
                // Notify Client
                await createNotification(
                    caseData.client_id, 
                    'case_update', 
                    `Update published for ${caseData.case_number}`, 
                    `Your lawyer has published an official update on your case: ${title || 'Note added'}`, 
                    { case_id: req.params.id }
                );
            }
        }
        res.status(201).json({ message: 'Case update added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCases,
    getCaseById,
    createCase,
    updateCase,
    getCaseUpdates,
    addCaseUpdate
};
