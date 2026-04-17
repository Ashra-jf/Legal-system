const pool = require('../config/db');

// Payments
const getPayments = async (req, res) => {
    try {
        let query = `
            SELECT p.*, c.name as client_name, s.name as service_name
            FROM payments p
            JOIN users c ON p.client_id = c.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            LEFT JOIN services s ON a.service_id = s.id
        `;
        let params = [];

        if (req.user && req.user.role === 'client') {
            query += ' WHERE p.client_id = ?';
            params.push(req.user.id);
        }
        
        query += ' ORDER BY p.created_at DESC';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPayment = async (req, res) => {
    try {
        const { client_id, appointment_id, case_id, amount, payment_date, payment_method, transaction_id, status, notes } = req.body;
        const finalClientId = (req.user && req.user.role === 'client') ? req.user.id : client_id;

        const [result] = await pool.execute(
            `INSERT INTO payments 
            (client_id, appointment_id, case_id, amount, payment_date, payment_method, transaction_id, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [finalClientId, appointment_id || null, case_id || null, amount, payment_date, payment_method, transaction_id || null, status || 'pending', notes || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Payment created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Invoices
const getInvoices = async (req, res) => {
    try {
        let query = 'SELECT i.*, c.name as client_name FROM invoices i JOIN users c ON i.client_id = c.id';
        let params = [];

        if (req.user && req.user.role === 'client') {
            query += ' WHERE i.client_id = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY i.created_at DESC';

        const [rows] = await pool.execute(query, params);
        
        // Fetch items for each invoice (optional, but good for detailed view)
        // Leaving it simple for now, can be fetched per invoice via another endpoint if needed.
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createInvoice = async (req, res) => {
    try {
        const { invoice_number, client_id, payment_id, issue_date, due_date, status, notes, items } = req.body;

        // Transaction is better here, but doing sequential for simplicity
        const [result] = await pool.execute(
            `INSERT INTO invoices 
            (invoice_number, client_id, payment_id, issue_date, due_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [invoice_number, client_id, payment_id || null, issue_date, due_date, status || 'draft', notes || null]
        );
        
        const invoiceId = result.insertId;

        if (items && items.length > 0) {
            for (let item of items) {
                await pool.execute(
                    'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [invoiceId, item.description, item.quantity || 1, item.unit_price]
                );
            }
        }

        res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Verified' or 'Rejected'
        await pool.execute('UPDATE payments SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Payment ${status.toLowerCase()} successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        let { paymentDate, transactionRef, paymentMethod } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No receipt file provided' });
        }

        const receiptUrl = `http://localhost:${process.env.PORT || 5000}/uploads/` + req.file.filename;

        // Map frontend payment method to database ENUM
        let dbPaymentMethod = 'online';
        if (paymentMethod) {
            const pmLower = paymentMethod.toLowerCase();
            if (pmLower.includes('bank transfer')) dbPaymentMethod = 'bank_transfer';
            else if (pmLower.includes('cash')) dbPaymentMethod = 'cash';
            else if (pmLower.includes('cheque') || pmLower.includes('check')) dbPaymentMethod = 'cheque';
            else if (pmLower.includes('card')) dbPaymentMethod = 'card';
            else if (pmLower.includes('online')) dbPaymentMethod = 'online';
        }

        try {
            await pool.execute('ALTER TABLE payments ADD COLUMN receipt_url VARCHAR(255)');
        } catch (e) {
            // Ignore if column exists
        }

        try {
            await pool.execute('ALTER TABLE payments MODIFY COLUMN status VARCHAR(50) DEFAULT "pending"');
        } catch (e) {
            // Ignore if column is already modified or errors
        }

        await pool.execute(
            `UPDATE payments 
             SET receipt_url = ?, 
                 payment_date = ?, 
                 transaction_id = ?, 
                 payment_method = ?,
                 status = 'Pending Verification'
             WHERE id = ?`,
            [receiptUrl, paymentDate || null, transactionRef || null, dbPaymentMethod, id]
        );

        res.json({ message: 'Receipt uploaded successfully', receiptUrl });
    } catch (error) {
        console.error('Upload receipt error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPayments,
    createPayment,
    getInvoices,
    createInvoice,
    verifyPayment,
    uploadReceipt
};
