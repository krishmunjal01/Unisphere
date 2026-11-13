import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all courses in the catalog
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.course_id,
                c.course_code,
                c.title,
                c.credits,
                c.lecture_hours,
                c.tutorial_hours,
                c.practical_hours,
                c.course_type,
                c.description,
                d.department_code,
                d.department_name
            FROM courses c
            JOIN departments d ON c.department_id = d.department_id
            ORDER BY c.course_code ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// List Course Offerings (Current Semester)
router.get('/offerings', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                co.offering_id,
                co.section,
                co.max_capacity,
                co.current_enrolled,
                (co.max_capacity - co.current_enrolled) AS available_seats,
                c.course_id,
                c.course_code,
                c.title AS course_title,
                c.credits,
                c.course_type,
                sem.semester_id,
                sem.semester_code,
                f.faculty_id,
                CONCAT(f.first_name, ' ', f.last_name) AS instructor_name,
                cr.classroom_id,
                cr.room_number,
                cr.building
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            JOIN academic_semesters sem ON co.semester_id = sem.semester_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.classroom_id
            WHERE sem.is_current = TRUE
            ORDER BY c.course_code, co.section
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Stored Procedure: Atomic Course Registration
router.post('/enroll', authenticateToken, async (req, res) => {
    let { studentId, offeringId } = req.body;

    // Students can only enroll themselves unless ADMIN
    if (req.user.role === 'STUDENT') {
        studentId = req.user.studentId;
    }

    if (!studentId || !offeringId) {
        return res.status(400).json({ error: 'studentId and offeringId are required.' });
    }

    try {
        // Execute sp_enroll_student stored procedure
        await pool.query('CALL sp_enroll_student(?, ?, @status_code, @message)', [studentId, offeringId]);
        const [[output]] = await pool.query('SELECT @status_code AS statusCode, @message AS message');

        if (output.statusCode === 'SUCCESS') {
            return res.status(200).json({
                success: true,
                statusCode: output.statusCode,
                message: output.message
            });
        } else {
            return res.status(400).json({
                success: false,
                statusCode: output.statusCode,
                error: output.message
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Procedure execution error: ' + err.message });
    }
});

// Recursive CTE: Prerequisite Dependency Graph Resolver
router.get('/:id/prerequisites', authenticateToken, async (req, res) => {
    const courseId = parseInt(req.params.id, 10);
    const studentId = req.query.studentId ? parseInt(req.query.studentId, 10) : 1;

    try {
        const [rows] = await pool.query(`
            WITH RECURSIVE PrerequisiteChain AS (
                SELECT 
                    cp.course_id,
                    cp.prerequisite_course_id,
                    1 AS dependency_depth
                FROM course_prerequisites cp
                WHERE cp.course_id = ?

                UNION ALL

                SELECT 
                    cp_parent.course_id,
                    cp_parent.prerequisite_course_id,
                    pc.dependency_depth + 1
                FROM course_prerequisites cp_parent
                JOIN PrerequisiteChain pc ON cp_parent.course_id = pc.prerequisite_course_id
            )
            SELECT 
                pc.dependency_depth,
                target_c.course_code AS target_course,
                prereq_c.course_id AS prerequisite_course_id,
                prereq_c.course_code AS required_prerequisite,
                prereq_c.title AS prerequisite_title,
                prereq_c.credits,
                COALESCE(e.final_grade, 'NOT_ATTEMPTED') AS student_grade,
                CASE 
                    WHEN e.final_grade IS NOT NULL AND e.final_grade NOT IN ('F', 'I') THEN 'CLEARED'
                    ELSE 'PENDING_PREREQUISITE'
                END AS eligibility_state
            FROM PrerequisiteChain pc
            JOIN courses target_c ON pc.course_id = target_c.course_id
            JOIN courses prereq_c ON pc.prerequisite_course_id = prereq_c.course_id
            LEFT JOIN (
                SELECT co.course_id, en.final_grade
                FROM enrollments en
                JOIN course_offerings co ON en.offering_id = co.offering_id
                WHERE en.student_id = ? AND en.status = 'COMPLETED'
            ) e ON e.course_id = pc.prerequisite_course_id
            ORDER BY pc.dependency_depth DESC
        `, [courseId, studentId]);

        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Recursive CTE query failure: ' + err.message });
    }
});

export default router;

