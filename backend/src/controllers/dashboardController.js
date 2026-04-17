const pool = require('../config/db');

const getAdminStats = async (req, res) => {
    try {
        const [[{ total_clients }]] = await pool.execute("SELECT COUNT(*) as total_clients FROM users WHERE role = 'client'");
        const [[{ total_lawyers }]] = await pool.execute("SELECT COUNT(*) as total_lawyers FROM users WHERE role = 'lawyer'");
        const [[{ total_cases }]] = await pool.execute("SELECT COUNT(*) as total_cases FROM cases");
        const [[{ total_revenue }]] = await pool.execute("SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE status = 'completed'");

        res.json({ total_clients, total_lawyers, total_cases, total_revenue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLawyerStats = async (req, res) => {
    try {
        const lawyerId = req.user ? req.user.id : req.query.lawyer_id;
        
        const [[{ active_cases }]] = await pool.execute("SELECT COUNT(*) as active_cases FROM cases WHERE lawyer_id = ? AND status NOT IN ('closed', 'won', 'lost', 'settled')", [lawyerId]);
        const [[{ upcoming_appointments }]] = await pool.execute("SELECT COUNT(*) as upcoming_appointments FROM appointments WHERE lawyer_id = ? AND appointment_date >= CURDATE() AND status IN ('pending', 'confirmed')", [lawyerId]);
        const [[{ total_earnings }]] = await pool.execute("SELECT COALESCE(SUM(fee), 0) as total_earnings FROM appointments WHERE lawyer_id = ? AND payment_status = 'paid'", [lawyerId]); // Basic proxy for earnings
        
        res.json({ active_cases, upcoming_appointments, total_earnings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getClientStats = async (req, res) => {
    try {
        const clientId = req.user ? req.user.id : req.query.client_id;
        
        const [[{ active_cases }]] = await pool.execute("SELECT COUNT(*) as active_cases FROM cases WHERE client_id = ? AND status NOT IN ('closed', 'won', 'lost', 'settled')", [clientId]);
        const [[{ upcoming_appointments }]] = await pool.execute("SELECT COUNT(*) as upcoming_appointments FROM appointments WHERE client_id = ? AND appointment_date >= CURDATE() AND status IN ('pending', 'confirmed')", [clientId]);
        const [[{ pending_invoices }]] = await pool.execute("SELECT COUNT(*) as pending_invoices FROM invoices WHERE client_id = ? AND status IN ('draft', 'sent', 'overdue')", [clientId]);
        
        res.json({ active_cases, upcoming_appointments, pending_invoices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAdminStats,
    getLawyerStats,
    getClientStats
};
