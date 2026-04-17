const pool = require('../config/db');

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : req.query.user_id; // Need ID somehow
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const [rows] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', 
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        await pool.execute(
            'UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Internal helper function used by other controllers to generate triggered notifications
const createNotification = async (userId, type, title, message, referenceIds = {}) => {
    try {
        const { appointment_id = null, case_id = null, payment_id = null } = referenceIds;
        await pool.execute(
            `INSERT INTO notifications (user_id, type, title, message, appointment_id, case_id, payment_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, title, message, appointment_id, case_id, payment_id]
        );
    } catch (e) {
        console.error('Failed to internally log notification:', e);
    }
};

const broadcastNotification = async (req, res) => {
    try {
        const { target, title, message, type = 'system' } = req.body;
        
        let query = 'SELECT id FROM users';
        let params = [];

        if (target === 'lawyers') {
            query += ' WHERE role = "lawyer"';
        } else if (target === 'clients') {
            query += ' WHERE role = "client"';
        }

        const [users] = await pool.execute(query, params);

        if (users.length === 0) {
            return res.json({ message: 'No users matched target group' });
        }

        // Batch insert notifications
        const values = [];
        const placeholders = [];
        users.forEach(u => {
            placeholders.push('(?, ?, ?, ?)');
            values.push(u.id, type, title, message);
        });

        const insertQuery = `INSERT INTO notifications (user_id, type, title, message) VALUES ${placeholders.join(', ')}`;
        await pool.execute(insertQuery, values);

        res.status(201).json({ message: `Notification broadcast sent to ${users.length} users` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUserNotifications,
    markAsRead,
    createNotification,
    broadcastNotification
};
