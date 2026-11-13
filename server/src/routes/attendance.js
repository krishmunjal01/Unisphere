import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Attendance Summary (from View)
router.get('/summary', authenticateToken, async (req, res) => {
    try {
        let query = 'SELECT * FROM vw_student_attendance_summary';
        const params = [];

        if (req.user.role === 'STUDENT') {
            query += ' WHERE student_id = ?';
            params.push(req.user.studentId);
        } else if (req.query.offeringId) {
            query += ' WHERE offering_id = ?';
            params.push(req.query.offeringId);
        } else if (req.query.studentId) {
            query += ' WHERE student_id = ?';
            params.push(req.query.studentId);
        }

        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Get Sessions for an offering
router.get('/offerings/:offeringId/sessions', authenticateToken, async (req, res) => {
    const offeringId = parseInt(req.params.offeringId, 10);
    try {
        const [rows] = await pool.query(`
            SELECT 
                att_s.session_id,
                att_s.offering_id,
                att_s.session_date,
                att_s.topic_covered,
                CONCAT(f.first_name, ' ', f.last_name) AS recorded_by,
                COUNT(ar.record_id) AS total_records,
                SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count
            FROM attendance_sessions att_s
            JOIN faculty f ON att_s.faculty_id = f.faculty_id
            LEFT JOIN attendance_records ar ON att_s.session_id = ar.session_id
            WHERE att_s.offering_id = ?
            GROUP BY att_s.session_id, att_s.offering_id, att_s.session_date, att_s.topic_covered, recorded_by
            ORDER BY att_s.session_date DESC
        `, [offeringId]);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Get Students Enrolled in an Offering (For marking attendance)
router.get('/offerings/:offeringId/students', authenticateToken, async (req, res) => {
    const offeringId = parseInt(req.params.offeringId, 10);
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.student_id,
                s.university_roll_no,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                s.academic_status
            FROM enrollments e
            JOIN students s ON e.student_id = s.student_id
            WHERE e.offering_id = ? AND e.status = 'ENROLLED'
            ORDER BY s.university_roll_no ASC
        `, [offeringId]);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Faculty/Admin: Conduct Attendance Session & Mark Batch Records
router.post('/sessions', authenticateToken, requireRole(['ADMIN', 'FACULTY']), async (req, res) => {
    const { offeringId, sessionDate, topicCovered, records } = req.body;
    let facultyId = req.user.facultyId;

    if (!facultyId) {
        // Fallback for admin
        const [f] = await pool.query('SELECT faculty_id FROM course_offerings WHERE offering_id = ?', [offeringId]);
        facultyId = f.length > 0 ? f[0].faculty_id : 1;
    }

    if (!offeringId || !sessionDate || !topicCovered || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'offeringId, sessionDate, topicCovered, and records array are required.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Session
        const [sessionResult] = await connection.query(
            'INSERT INTO attendance_sessions (offering_id, faculty_id, session_date, topic_covered) VALUES (?, ?, ?, ?)',
            [offeringId, facultyId, sessionDate, topicCovered]
        );

        const newSessionId = sessionResult.insertId;

        // 2. Insert Batch Attendance Records
        for (const item of records) {
            await connection.query(
                'INSERT INTO attendance_records (session_id, student_id, status, remarks) VALUES (?, ?, ?, ?)',
                [newSessionId, item.studentId, item.status || 'PRESENT', item.remarks || null]
            );
        }

        await connection.commit();
        return res.status(201).json({
            message: 'Attendance session registered successfully.',
            sessionId: newSessionId,
            recordsMarked: records.length
        });
    } catch (err) {
        await connection.rollback();
        return res.status(400).json({ error: 'Failed to record attendance: ' + err.message });
    } finally {
        connection.release();
    }
});

export default router;

