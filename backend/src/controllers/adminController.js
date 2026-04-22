const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {     //Validation
            return res.status(400).json({ error: 'Name, email, password and role are required' });
        }

        // Admin can only create lawyer or admin
        if (!['lawyer', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role for admin creation' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email.toLowerCase(), passwordHash, role]
        );
        res.status(201).json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({ error: 'Name, email and role are required' });
        }

        let query = 'UPDATE users SET name = ?, email = ?, role = ?';
        let params = [name, email.toLowerCase(), role];

        if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(passwordHash);
        }

        query += ' WHERE id = ?';
        params.push(req.params.id);

        await pool.execute(query, params);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSystemSettings = async (req, res) => {
    try {
        const [settings] = await pool.execute('SELECT setting_key, setting_value, data_type, description FROM system_settings');
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSystemSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        // Assume req.user.id is available if authenticated, else null
        const userId = req.user ? req.user.id : null; 
        
        await pool.execute(
            'UPDATE system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
            [value, userId, key]
        );
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getSystemSettings,
    updateSystemSetting
};
