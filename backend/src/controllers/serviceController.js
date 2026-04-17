const pool = require('../config/db');

// Service Categories
const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY display_order');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Services
const getServices = async (req, res) => {
    try {
        const categoryId = req.query.category_id;
        let query = 'SELECT * FROM services WHERE is_active = TRUE';
        const params = [];

        if (categoryId) {
            query += ' AND category_id = ?';
            params.push(categoryId);
        }

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin Service Management
const createService = async (req, res) => {
    try {
        const { name, description, base_fee, duration_estimate } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO services (name, description, base_fee, duration_estimate) VALUES (?, ?, ?, ?)',
            [name, description, base_fee || 0, duration_estimate || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Service created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, base_fee, duration_estimate } = req.body;
        await pool.execute(
            'UPDATE services SET name = ?, description = ?, base_fee = ?, duration_estimate = ? WHERE id = ?',
            [name, description, base_fee, duration_estimate, id]
        );
        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('UPDATE services SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getCategories,
    getServices,
    createService,
    updateService,
    deleteService
};
