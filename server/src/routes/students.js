import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List all students
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.student_id,
                s.university_roll_no,
                s.enrollment_number,
                CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                s.first_name,
                s.last_name,
                s.date_of_birth,
                s.gender,
                s.current_semester,
                s.academic_status,
                s.contact_number,
                s.guardian_name,
                s.guardian_contact,
                p.program_code,
                p.program_name,
                d.department_name,
                u.email
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            JOIN programs p ON s.program_id = p.program_id
            JOIN departments d ON p.department_id = d.department_id
            ORDER BY s.university_roll_no ASC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Student 360-degree academic profile
router.get('/:id', authenticateToken, async (req, res) => {
    const studentId = parseInt(req.params.id, 10);
    try {
        const [summary] = await pool.query(
            'SELECT * FROM vw_student_academic_summary WHERE student_id = ?',
            [studentId]
        );

        if (summary.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        // Active Course Enrollments
        const [enrollments] = await pool.query(`
            SELECT 
                e.enrollment_id,
                e.offering_id,
                e.status,
                e.final_grade,
                e.grade_point,
                c.course_code,
                c.title,
                c.credits,
                c.course_type,
                co.section,
                CONCAT(f.first_name, ' ', f.last_name) AS instructor_name
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.offering_id
            JOIN courses c ON co.course_id = c.course_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
            WHERE e.student_id = ?
        `, [studentId]);

        // Attendance breakdown
        const [attendance] = await pool.query(
            'SELECT * FROM vw_student_attendance_summary WHERE student_id = ?',
            [studentId]
        );

        // Fee Invoices
        const [invoices] = await pool.query(`
            SELECT 
                fi.invoice_id,
                fi.invoice_number,
                sem.semester_code,
                fi.gross_amount,
                fi.scholarship_deduction,
                fi.net_payable,
                fi.paid_amount,
                fi.balance_amount,
                fi.due_date,
                fi.status
            FROM fee_invoices fi
            JOIN academic_semesters sem ON fi.semester_id = sem.semester_id
            WHERE fi.student_id = ?
            ORDER BY fi.due_date DESC
        `, [studentId]);

        return res.json({
            profile: summary[0],
            enrollments,
            attendance,
            invoices
        });
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Admin: Create new student (Atomic User + Student creation)
router.post('/', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    const {
        username,
        email,
        password,
        universityRollNo,
        enrollmentNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        programId,
        currentSemester,
        admissionYear,
        contactNumber,
        bloodGroup,
        guardianName,
        guardianContact
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create User
        const [userResult] = await connection.query(
            'INSERT INTO users (username, password_hash, email, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
            [username, password || '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', email, 'STUDENT']
        );

        const newUserId = userResult.insertId;

        // 2. Create Student
        const [studentResult] = await connection.query(`
            INSERT INTO students (
                user_id, university_roll_no, enrollment_number, first_name, last_name, 
                date_of_birth, gender, program_id, current_semester, admission_year, 
                contact_number, blood_group, guardian_name, guardian_contact, academic_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ENROLLED')
        `, [
            newUserId, universityRollNo, enrollmentNumber, firstName, lastName,
            dateOfBirth, gender, programId, currentSemester || 1, admissionYear || new Date().getFullYear(),
            contactNumber, bloodGroup, guardianName, guardianContact
        ]);

        await connection.commit();
        return res.status(201).json({
            message: 'Student account created successfully.',
            studentId: studentResult.insertId,
            userId: newUserId
        });
    } catch (err) {
        await connection.rollback();
        return res.status(400).json({ error: 'Failed to create student: ' + err.message });
    } finally {
        connection.release();
    }
});

export default router;

