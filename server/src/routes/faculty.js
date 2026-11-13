import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all faculty
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                f.faculty_id,
                f.employee_code,
                CONCAT(f.first_name, ' ', f.last_name) AS full_name,
                f.first_name,
                f.last_name,
                f.designation,
                f.qualification,
                f.joining_date,
                f.contact_number,
                f.status,
                d.department_code,
                d.department_name,
                u.email
            FROM faculty f
            JOIN users u ON f.user_id = u.user_id
            JOIN departments d ON f.department_id = d.department_id
            ORDER BY d.department_name, f.designation DESC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// View faculty teaching workload
router.get('/workload', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vw_faculty_workload');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Get offerings taught by a faculty member
router.get('/:id/offerings', authenticateToken, async (req, res) => {
    const facultyId = parseInt(req.params.id, 10);
    try {
        const [rows] = await pool.query(`
            SELECT 
                co.offering_id,
                co.section,
                co.max_capacity,
                co.current_enrolled,
                c.course_id,
                c.course_code,
                c.title AS course_title,
                c.credits,
                c.course_type,
                sem.semester_code,
                sem.academic_year,
                cr.room_number,
                cr.building
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            JOIN academic_semesters sem ON co.semester_id = sem.semester_id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.classroom_id
            WHERE co.faculty_id = ?
            ORDER BY sem.is_current DESC, c.course_code ASC
        `, [facultyId]);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

export default router;

