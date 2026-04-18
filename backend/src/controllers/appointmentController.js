const pool = require('../config/db');

const getAppointments = async (req, res) => {
    try {
        let query = `
            SELECT 
                a.*,
                s.name as service_name,
                c.name as client_name,
                l.name as lawyer_name
            FROM appointments a
            LEFT JOIN services s ON a.service_id = s.id
            LEFT JOIN users c ON a.client_id = c.id
            LEFT JOIN users l ON a.lawyer_id = l.id
        `;
        let params = [];

        // Filter based on role
        if (req.user && req.user.role === 'client') {
            query += ' WHERE a.client_id = ?';
            params.push(req.user.id === undefined ? null : req.user.id);
        } else if (req.user && req.user.role === 'lawyer') {
            query += ' WHERE a.lawyer_id = ?';
            params.push(req.user.id === undefined ? null : req.user.id);
        }

        query += ' ORDER BY a.appointment_date, a.start_time';

        const [rows] = await pool.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Get Appointments Error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments', details: error.message });
    }
};

const createAppointment = async (req, res) => {
    try {
        const { client_id, lawyer_id, service_id, appointment_date, date, start_time, time, end_time, fee, notes } = req.body;
        // If client is booking, use their own ID
        const finalClientId = (req.user && req.user.role === 'client') ? req.user.id : client_id;
        
        const finalDate = appointment_date || date;
        
        const parseTime = (timeStr) => {
            if (!timeStr) return null;
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (match) {
                let [_, h, m, modifier] = match;
                let hours = parseInt(h, 10);
                if (hours === 12) hours = 0;
                if (modifier.toUpperCase() === 'PM') hours += 12;
                return `${hours.toString().padStart(2, '0')}:${m}:00`;
            }
            return timeStr;
        };
        const finalTime = parseTime(start_time || time);

        const [result] = await pool.execute(
            `INSERT INTO appointments 
            (client_id, lawyer_id, service_id, appointment_date, start_time, end_time, fee, notes) 
            VALUES (?, ?, ?, ?, ?, ADDTIME(?, '01:00:00'), ?, ?)`,
            [
                finalClientId || null, 
                lawyer_id || null, 
                service_id || null, 
                finalDate || null, 
                finalTime || null, 
                end_time || finalTime || null, 
                fee || 0, 
                notes || null
            ]
        );
        res.status(201).json({ id: result.insertId, message: 'Appointment created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);

        if (status === 'confirmed') {
            // Automatically generate a new Case
            const [appts] = await pool.execute(`
                SELECT a.client_id, a.lawyer_id, a.service_id, s.name as service_name 
                FROM appointments a 
                LEFT JOIN services s ON a.service_id = s.id 
                WHERE a.id = ?
            `, [req.params.id]);
            
            if (appts.length > 0) {
                const appt = appts[0];
                
                // Prevent duplicate cases for the same appointment if toggled multiple times
                const [existingCases] = await pool.execute('SELECT id FROM cases WHERE appointment_id = ?', [req.params.id]);
                if (existingCases.length === 0) {
                    const caseNumber = 'CAS-' + Date.now().toString().slice(-6); // short numeric ID
                    const title = (appt.service_name || 'Legal Consultation') + ' File';
                    
                    await pool.execute(
                        `INSERT INTO cases 
                        (case_number, client_id, lawyer_id, service_id, appointment_id, title, description, status, priority)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [caseNumber, appt.client_id, appt.lawyer_id, appt.service_id, req.params.id, title, 'Active case tracking file opened upon appointment confirmation.', 'open', 'high']
                    );
                }
            }
        } else if (status === 'completed') {
            
            const [appts] = await pool.execute('SELECT client_id, lawyer_id, service_id, fee, appointment_date FROM appointments WHERE id = ?', [req.params.id]);
            
            if (appts.length > 0) {
                const appt = appts[0];
                
                // Safely precisely close the exact case corresponding to this appointment
                try {
                    await pool.execute("UPDATE cases SET status = 'closed' WHERE appointment_id = ?", [req.params.id]);
                } catch (e) {
                    console.error("Failed to automatically close case:", e);
                }

                const [existing] = await pool.execute('SELECT id FROM payments WHERE appointment_id = ?', [req.params.id]);
                if (existing.length === 0) {
                    if (Number(appt.fee) > 0) {
                        await pool.execute(
                            `INSERT INTO payments 
                            (client_id, appointment_id, amount, payment_date, payment_method, status)
                            VALUES (?, ?, ?, ?, ?, ?)`,
                            [appt.client_id, req.params.id, appt.fee, appt.appointment_date, 'Online', 'pending']
                        );
                    }
                }
            }
        }

        res.json({ message: 'Appointment status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAppointments,
    createAppointment,
    updateAppointmentStatus
};
