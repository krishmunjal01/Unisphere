import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Executive KPI Dashboard Summary
router.get('/kpi', authenticateToken, async (req, res) => {
    try {
        const [[studentsCount]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students WHERE academic_status = "ENROLLED"');
        const [[facultyCount]] = await pool.query('SELECT COUNT(*) AS totalFaculty FROM faculty WHERE status = "ACTIVE"');
        const [[coursesCount]] = await pool.query('SELECT COUNT(*) AS totalCourses FROM courses');
        const [[offeringsCount]] = await pool.query('SELECT COUNT(*) AS activeOfferings FROM course_offerings');

        // Financial KPIs
        const [[fees]] = await pool.query(`
            SELECT 
                COALESCE(SUM(net_payable), 0) AS totalBilled,
                COALESCE(SUM(paid_amount), 0) AS totalCollected,
                COALESCE(SUM(balance_amount), 0) AS totalOutstanding
            FROM fee_invoices
        `);

        // Attendance KPI
        const [[attendance]] = await pool.query(`
            SELECT 
                ROUND(
                    COALESCE(
                        (SUM(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0) / 
                        NULLIF(COUNT(record_id), 0), 0.00
                    ), 1
                ) AS universityAverageAttendance
            FROM attendance_records
        `);

        return res.json({
            totalStudents: studentsCount.totalStudents,
            totalFaculty: facultyCount.totalFaculty,
            totalCourses: coursesCount.totalCourses,
            activeOfferings: offeringsCount.activeOfferings,
            totalBilled: fees.totalBilled,
            totalCollected: fees.totalCollected,
            totalOutstanding: fees.totalOutstanding,
            collectionEfficiencyPct: fees.totalBilled > 0 ? ((fees.totalCollected / fees.totalBilled) * 100).toFixed(1) : 0,
            averageAttendance: attendance.universityAverageAttendance
        });
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Department-wise Statistics
router.get('/department-stats', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                d.department_id,
                d.department_code,
                d.department_name,
                d.budget,
                COUNT(DISTINCT p.program_id) AS total_programs,
                COUNT(DISTINCT f.faculty_id) AS total_faculty,
                COUNT(DISTINCT s.student_id) AS total_students
            FROM departments d
            LEFT JOIN programs p ON d.department_id = p.department_id
            LEFT JOIN faculty f ON d.department_id = f.department_id
            LEFT JOIN students s ON p.program_id = s.program_id
            GROUP BY d.department_id, d.department_code, d.department_name, d.budget
            ORDER BY total_students DESC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Audit Logs
router.get('/audit-logs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                log_id,
                table_name,
                operation_type,
                record_id,
                performed_by,
                old_value,
                new_value,
                ip_address,
                performed_at
            FROM audit_logs
            ORDER BY performed_at DESC
            LIMIT 50
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Grade Distribution
router.get('/grade-distribution', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                gs.grade_letter,
                gs.grade_point,
                gs.description,
                COUNT(e.enrollment_id) AS student_count
            FROM grade_scale gs
            LEFT JOIN enrollments e ON gs.grade_letter = e.final_grade
            GROUP BY gs.grade_letter, gs.grade_point, gs.description
            ORDER BY gs.grade_point DESC
        `);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

export default router;

