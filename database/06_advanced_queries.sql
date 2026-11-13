-- ============================================================================
-- UNISPHERE: ADVANCED SQL QUERIES & VIVA DEMONSTRATION SCRIPTS
-- Formatted for DBMS Evaluation, Benchmarking & Complex Relational Proofs
-- ============================================================================

USE unisphere_db;

-- ----------------------------------------------------------------------------
-- QUERY 1: Recursive CTE - Complete Prerequisite Dependency Graph Resolution
-- Traverses arbitrary depth of prerequisites and verifies student clearance status
-- ----------------------------------------------------------------------------
WITH RECURSIVE PrerequisiteChain AS (
    -- Anchor Member: Find direct prerequisites of CS401 (Distributed Systems)
    SELECT 
        cp.course_id,
        cp.prerequisite_course_id,
        1 AS dependency_depth
    FROM course_prerequisites cp
    WHERE cp.course_id = 5 -- CS401

    UNION ALL

    -- Recursive Member: Find prerequisites of the prerequisites
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
    WHERE en.student_id = 1 AND en.status = 'COMPLETED'
) e ON e.course_id = pc.prerequisite_course_id
ORDER BY pc.dependency_depth DESC;

-- ----------------------------------------------------------------------------
-- QUERY 2: Window Functions - Department-Wise Student CGPA Ranking & Percentiles
-- Computes Dense Rank and Cumulative Distribution per academic department
-- ----------------------------------------------------------------------------
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
ORDER BY d.department_code, department_rank;

-- ----------------------------------------------------------------------------
-- QUERY 3: Complex Multi-Table JOIN with GROUP BY & HAVING
-- Identifies academic sections with critically low average attendance (< 75%)
-- ----------------------------------------------------------------------------
SELECT 
    co.offering_id,
    c.course_code,
    c.title AS course_title,
    co.section,
    CONCAT(f.first_name, ' ', f.last_name) AS instructor,
    COUNT(DISTINCT att_s.session_id) AS total_classes_conducted,
    COUNT(ar.record_id) AS total_attendance_instances,
    SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS total_presents,
    ROUND(
        (SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(COUNT(ar.record_id), 0), 2
    ) AS section_average_attendance_pct
FROM course_offerings co
JOIN courses c ON co.course_id = c.course_id
JOIN faculty f ON co.faculty_id = f.faculty_id
JOIN attendance_sessions att_s ON co.offering_id = att_s.offering_id
LEFT JOIN attendance_records ar ON att_s.session_id = ar.session_id
GROUP BY 
    co.offering_id, 
    c.course_code, 
    c.title, 
    co.section, 
    instructor
HAVING section_average_attendance_pct < 85.00
ORDER BY section_average_attendance_pct ASC;

-- ----------------------------------------------------------------------------
-- QUERY 4: Financial Recovery & Scholarship Discrepancy CTE
-- Aggregates total billed, total scholarship subsidized, and net collections
-- ----------------------------------------------------------------------------
WITH FinancialSummary AS (
    SELECT 
        sem.semester_code,
        p.program_code,
        COUNT(fi.invoice_id) AS total_invoices_issued,
        SUM(fi.gross_amount) AS gross_receivable,
        SUM(fi.scholarship_deduction) AS total_institutional_concession,
        SUM(fi.net_payable) AS net_billed,
        SUM(fi.paid_amount) AS total_collected,
        SUM(fi.balance_amount) AS total_unrecovered_dues
    FROM fee_invoices fi
    JOIN academic_semesters sem ON fi.semester_id = sem.semester_id
    JOIN students s ON fi.student_id = s.student_id
    JOIN programs p ON s.program_id = p.program_id
    GROUP BY sem.semester_code, p.program_code
)
SELECT 
    semester_code,
    program_code,
    total_invoices_issued,
    gross_receivable,
    total_institutional_concession,
    net_billed,
    total_collected,
    total_unrecovered_dues,
    ROUND((total_collected * 100.0) / NULLIF(net_billed, 0), 2) AS recovery_efficiency_pct
FROM FinancialSummary
ORDER BY semester_code DESC, recovery_efficiency_pct ASC;

-- ----------------------------------------------------------------------------
-- QUERY 5: Performance Benchmarking with EXPLAIN ANALYZE
-- Demonstrates query plan cost optimization using composite index vs table scan
-- ----------------------------------------------------------------------------
EXPLAIN ANALYZE
SELECT 
    ar.student_id,
    ar.session_id,
    ar.status
FROM attendance_records ar
WHERE ar.student_id = 1 AND ar.status = 'PRESENT';

