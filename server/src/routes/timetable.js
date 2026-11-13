import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Master Timetable View
router.get('/master', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM vw_master_timetable 
            ORDER BY FIELD(day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'), start_time ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Classroom Master
router.get('/classrooms', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM classrooms ORDER BY building, room_number');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Schedule a Timetable Slot (Triggers detect Room & Faculty Collisions!)
router.post('/slots', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    const { offeringId, classroomId, dayOfWeek, startTime, endTime } = req.body;

    if (!offeringId || !classroomId || !dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({ error: 'offeringId, classroomId, dayOfWeek, startTime, and endTime are required.' });
    }

    try {
        const [result] = await pool.query(`
            INSERT INTO timetable_slots (offering_id, classroom_id, day_of_week, start_time, end_time)
            VALUES (?, ?, ?, ?, ?)
        `, [offeringId, classroomId, dayOfWeek, startTime, endTime]);

        return res.status(201).json({
            success: true,
            message: 'Classroom and faculty schedule slot confirmed without collisions.',
            slotId: result.insertId
        });
    } catch (err) {
        // Trigger throws SQLSTATE 45000 if room or faculty is collided
        return res.status(400).json({
            success: false,
            error: err.message.replace(/.*?((?:Classroom Collision|Faculty Schedule Conflict): [^']+).*/g, '$1')
        });
    }
});

export default router;

