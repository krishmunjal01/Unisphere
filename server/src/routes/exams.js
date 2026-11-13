import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get Assessment Components for a Course Offering
router.get('/components/:offeringId', authenticateToken, async (req, res) => {
    const offeringId = parseInt(req.params.offeringId, 10);
    try {
        const [rows] = await pool.query(`
            SELECT 
                component_id,
                offering_id,
                component_name,
                max_marks,
                weightage_percentage,
                due_date
            FROM assessment_components
            WHERE offering_id = ?
            ORDER BY component_id ASC
        `, [offeringId]);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Get Marks Table for an Offering (Grid of Students and Components)
router.get('/marks/:offeringId', authenticateToken, async (req, res) => {
    const offeringId = parseInt(req.params.offeringId, 10);
    try {
        const [marks] = await pool.query(`
            SELECT 
                sm.mark_id,
                sm.component_id,
                ac.component_name,
                ac.max_marks,
                ac.weightage_percentage,
                sm.student_id,
                s.university_roll_no,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                sm.marks_obtained,
                sm.remarks,
                sm.evaluated_at
            FROM assessment_components ac
            JOIN student_marks sm ON ac.component_id = sm.component_id
            JOIN students s ON sm.student_id = s.student_id
            WHERE ac.offering_id = ?
            ORDER BY s.university_roll_no, ac.component_id
        `, [offeringId]);
        return res.json(marks);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Faculty/Admin: Enter or Update Assessment Marks (Trigger checks boundary & logs audit!)
router.post('/marks', authenticateToken, requireRole(['ADMIN', 'FACULTY']), async (req, res) => {
    const { componentId, studentId, marksObtained, remarks } = req.body;
    let facultyId = req.user.facultyId;

    if (!facultyId) {
        facultyId = 1; // Default admin
    }

    if (!componentId || !studentId || marksObtained === undefined) {
        return res.status(400).json({ error: 'componentId, studentId, and marksObtained are required.' });
    }

    try {
        // Upsert student mark
        await pool.query(`
            INSERT INTO student_marks (component_id, student_id, marks_obtained, evaluated_by, remarks)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                marks_obtained = VALUES(marks_obtained),
                evaluated_by = VALUES(evaluated_by),
                remarks = VALUES(remarks),
                evaluated_at = CURRENT_TIMESTAMP
        `, [componentId, studentId, marksObtained, facultyId, remarks || null]);

        return res.json({
            success: true,
            message: 'Marks recorded successfully. Trigger validation passed.'
        });
    } catch (err) {
        // The MySQL trigger will throw SQLSTATE 45000 if boundary exceeded!
        return res.status(400).json({
            success: false,
            error: err.message.replace(/.*?Integrity Error: /g, 'Integrity Error: ')
        });
    }
});

// Stored Procedure: Calculate SGPA and CGPA
router.post('/calculate-sgpa', authenticateToken, requireRole(['ADMIN', 'FACULTY']), async (req, res) => {
    const { studentId, semesterId } = req.body;

    if (!studentId || !semesterId) {
        return res.status(400).json({ error: 'studentId and semesterId are required.' });
    }

    try {
        await pool.query('CALL sp_calculate_sgpa(?, ?, @sgpa, @cgpa)', [studentId, semesterId]);
        const [[output]] = await pool.query('SELECT @sgpa AS sgpa, @cgpa AS cgpa');

        const [results] = await pool.query(
            'SELECT * FROM semester_results WHERE student_id = ? AND semester_id = ?',
            [studentId, semesterId]
        );

        return res.json({
            success: true,
            message: 'Academic calculation executed and official snapshot committed.',
            sgpa: output.sgpa,
            cgpa: output.cgpa,
            resultRecord: results[0] || null
        });
    } catch (err) {
        return res.status(500).json({ error: 'Stored procedure calculation failed: ' + err.message });
    }
});

// Student/Admin: View Academic Transcripts
router.get('/transcripts/:studentId', authenticateToken, async (req, res) => {
    const studentId = parseInt(req.params.studentId, 10);
    try {
        const [semResults] = await pool.query(`
            SELECT 
                sr.result_id,
                sr.semester_id,
                sem.semester_code,
                sem.academic_year,
                sr.total_credits_earned,
                sr.sgpa,
                sr.cgpa,
                sr.academic_standing,
                sr.published_date
            FROM semester_results sr
            JOIN academic_semesters sem ON sr.semester_id = sem.semester_id
            WHERE sr.student_id = ?
            ORDER BY sem.start_date ASC
        `, [studentId]);

        const [coursesTaken] = await pool.query(`
            SELECT 
                e.enrollment_id,
                sem.semester_code,
                c.course_code,
                c.title,
                c.credits,
                e.final_grade,
                e.grade_point,
                e.status
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.offering_id
            JOIN courses c ON co.course_id = c.course_id
            JOIN academic_semesters sem ON co.semester_id = sem.semester_id
            WHERE e.student_id = ?
            ORDER BY sem.start_date ASC, c.course_code ASC
        `, [studentId]);

        return res.json({
            semesters: semResults,
            courses: coursesTaken
        });
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

export default router;

