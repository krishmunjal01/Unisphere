import express from 'express';
import pool from '../config/db.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Recursive CTE Runner: Prerequisite Chain
router.all('/recursive-cte', optionalAuthenticateToken, async (req, res) => {
    const courseId = parseInt(req.body?.courseId || req.query?.courseId || 5, 10);
    const studentId = parseInt(req.body?.studentId || req.query?.studentId || 1, 10);

    const query = `
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
    `;

    const startTime = process.hrtime();
    try {
        const [rows] = await pool.query(query, [courseId, studentId]);
        const diff = process.hrtime(startTime);
        const executionMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

        return res.json({
            concept: 'Recursive Common Table Expression (CTE) Graph Traversal',
            sql: query.trim(),
            executionMs,
            rowCount: rows.length,
            data: rows
        });
    } catch (err) {
        return res.status(500).json({ error: 'Recursive CTE failure: ' + err.message });
    }
});

// 2. Window Functions Runner: Department Ranks & Cumulative Percentiles
router.all('/window-functions', optionalAuthenticateToken, async (req, res) => {
    const query = `
        SELECT 
            s.university_roll_no,
            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
            d.department_code,
            p.program_name,
            COALESCE(sr.cgpa, 0.00) AS cumulative_cgpa,
            DENSE_RANK() OVER (
                PARTITION BY d.department_id 
                ORDER BY COALESCE(sr.cgpa, 0.00) DESC
            ) AS department_rank,
            ROUND(
                CUME_DIST() OVER (
                    PARTITION BY d.department_id 
                    ORDER BY COALESCE(sr.cgpa, 0.00) ASC
                ) * 100, 1
            ) AS percentile_in_dept
        FROM students s
        JOIN programs p ON s.program_id = p.program_id
        JOIN departments d ON p.department_id = d.department_id
        LEFT JOIN (
            SELECT student_id, cgpa
            FROM semester_results
            WHERE published_date = (SELECT MAX(published_date) FROM semester_results)
        ) sr ON s.student_id = sr.student_id
        WHERE s.academic_status = 'ENROLLED'
        ORDER BY d.department_code, department_rank
    `;

    const startTime = process.hrtime();
    try {
        const [rows] = await pool.query(query);
        const diff = process.hrtime(startTime);
        const executionMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

        return res.json({
            concept: 'SQL Window Functions (PARTITION BY, DENSE_RANK, CUME_DIST)',
            sql: query.trim(),
            executionMs,
            rowCount: rows.length,
            data: rows
        });
    } catch (err) {
        return res.status(500).json({ error: 'Window functions query failure: ' + err.message });
    }
});

// 3. EXPLAIN ANALYZE Query Execution Plan Inspector
router.all('/explain-analyze', optionalAuthenticateToken, async (req, res) => {
    const query = req.body?.query || req.query?.query || `
        SELECT ar.student_id, ar.session_id, ar.status
        FROM attendance_records ar
        WHERE ar.student_id = 1 AND ar.status = 'PRESENT'
    `;

    try {
        // Run EXPLAIN ANALYZE
        const [explainResult] = await pool.query(`EXPLAIN ANALYZE ${query}`);
        const planText = explainResult[0]['EXPLAIN'] || Object.values(explainResult[0])[0];

        // Also run standard EXPLAIN for formatted table plan
        const [explainJson] = await pool.query(`EXPLAIN FORMAT=JSON ${query}`);
        const jsonPlan = JSON.parse(explainJson[0]['EXPLAIN']);

        return res.json({
            concept: 'MySQL 8 Query Execution Plan (EXPLAIN ANALYZE)',
            sql: query.trim(),
            rawPlan: planText,
            jsonPlan
        });
    } catch (err) {
        return res.status(400).json({ error: 'EXPLAIN ANALYZE error: ' + err.message });
    }
});

// 4. Safe Live SQL Console (for Examiner In-Viva Testing)
router.all('/execute-query', optionalAuthenticateToken, async (req, res) => {
    const query = req.body?.query || req.query?.query;

    if (!query) {
        return res.status(400).json({ error: 'SQL query string is required.' });
    }

    const trimmed = query.trim().toUpperCase();
    // Safety guard: only allow SELECT or SHOW or EXPLAIN or CALL
    const isAllowed = trimmed.startsWith('SELECT') ||
        trimmed.startsWith('WITH') ||
        trimmed.startsWith('SHOW') ||
        trimmed.startsWith('EXPLAIN') ||
        trimmed.startsWith('CALL');

    if (!isAllowed) {
        return res.status(403).json({ error: 'Live console only permits read-only analysis queries (SELECT, WITH, SHOW, EXPLAIN, CALL).' });
    }

    const startTime = process.hrtime();
    try {
        const [rows, fields] = await pool.query(query);
        const diff = process.hrtime(startTime);
        const executionMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(3);

        const columns = fields && Array.isArray(fields) ? fields.map(f => f.name) : [];

        return res.json({
            success: true,
            executionMs,
            rowCount: Array.isArray(rows) ? rows.length : 1,
            columns,
            data: rows
        });
    } catch (err) {
        return res.status(400).json({ success: false, error: err.message });
    }
});

export default router;
