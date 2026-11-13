-- ============================================================================
-- UNISPHERE: DATABASE VIEWS SCRIPT
-- Analytical, Operational and Abstraction Views
-- ============================================================================

USE unisphere_db;

-- ----------------------------------------------------------------------------
-- VIEW 1: Attendance Percentage & Eligibility View
-- Computes subject-wise attendance percentage and 75% mandatory threshold
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_attendance_summary AS
SELECT 
    s.student_id,
    s.university_roll_no,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    p.program_code,
    co.offering_id,
    c.course_code,
    c.title AS course_title,
    co.section,
    COUNT(ar.record_id) AS total_sessions_conducted,
    SUM(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) AS total_attended,
    SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS total_absent,
    ROUND(
        COALESCE(
            (SUM(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0) / 
            NULLIF(COUNT(ar.record_id), 0), 
            0.00
        ), 2
    ) AS attendance_percentage,
    CASE 
        WHEN COUNT(ar.record_id) = 0 THEN 'NO_CLASSES_HELD'
        WHEN (SUM(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0) / COUNT(ar.record_id) >= 75.00 
            THEN 'ELIGIBLE' 
        ELSE 'DEFAULTER_SHORTAGE' 
    END AS examination_eligibility
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN programs p ON s.program_id = p.program_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
LEFT JOIN attendance_sessions att_s ON co.offering_id = att_s.offering_id
LEFT JOIN attendance_records ar ON att_s.session_id = ar.session_id AND ar.student_id = s.student_id
WHERE e.status = 'ENROLLED'
GROUP BY 
    s.student_id, 
    s.university_roll_no, 
    student_name, 
    p.program_code, 
    co.offering_id, 
    c.course_code, 
    c.title, 
    co.section;

-- ----------------------------------------------------------------------------
-- VIEW 2: Faculty Workload & Teaching Allocation
-- Aggregates course assignments, weekly lecture hours, and total enrolled students
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_faculty_workload AS
SELECT 
    f.faculty_id,
    f.employee_code,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
    f.designation,
    d.department_code,
    d.department_name,
    COUNT(DISTINCT co.offering_id) AS active_offerings_count,
    COALESCE(SUM(c.lecture_hours + c.tutorial_hours + c.practical_hours), 0) AS total_weekly_contact_hours,
    COALESCE(SUM(co.current_enrolled), 0) AS total_students_mentored
FROM faculty f
JOIN departments d ON f.department_id = d.department_id
LEFT JOIN course_offerings co ON f.faculty_id = co.faculty_id
LEFT JOIN academic_semesters sem ON co.semester_id = sem.semester_id AND sem.is_current = TRUE
LEFT JOIN courses c ON co.course_id = c.course_id
WHERE f.status = 'ACTIVE'
GROUP BY 
    f.faculty_id, 
    f.employee_code, 
    faculty_name, 
    f.designation, 
    d.department_code, 
    d.department_name;

-- ----------------------------------------------------------------------------
-- VIEW 3: Institutional Outstanding Fee Defaulters
-- Identifies students with overdue unpaid or partially paid semester fees
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_fee_defaulters AS
SELECT 
    s.student_id,
    s.university_roll_no,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.contact_number,
    s.guardian_contact,
    p.program_name,
    sem.semester_code,
    fi.invoice_number,
    fi.net_payable,
    fi.paid_amount,
    fi.balance_amount,
    fi.due_date,
    DATEDIFF(CURRENT_DATE, fi.due_date) AS days_overdue,
    fi.status AS invoice_status
FROM fee_invoices fi
JOIN students s ON fi.student_id = s.student_id
JOIN programs p ON s.program_id = p.program_id
JOIN academic_semesters sem ON fi.semester_id = sem.semester_id
WHERE fi.status IN ('UNPAID', 'PARTIALLY_PAID', 'OVERDUE')
  AND fi.balance_amount > 0.00;

-- ----------------------------------------------------------------------------
-- VIEW 4: Comprehensive Master Timetable View
-- Human-readable scheduling matrix linking rooms, faculty, and offerings
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_master_timetable AS
SELECT 
    ts.slot_id,
    ts.day_of_week,
    ts.start_time,
    ts.end_time,
    c.course_code,
    c.title AS course_title,
    co.section,
    cr.room_number,
    cr.building,
    cr.room_type,
    CONCAT(f.first_name, ' ', f.last_name) AS instructor_name,
    d.department_code,
    sem.semester_code
FROM timetable_slots ts
JOIN course_offerings co ON ts.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN faculty f ON co.faculty_id = f.faculty_id
JOIN classrooms cr ON ts.classroom_id = cr.classroom_id
JOIN departments d ON c.department_id = d.department_id
JOIN academic_semesters sem ON co.semester_id = sem.semester_id;

-- ----------------------------------------------------------------------------
-- VIEW 5: Student Academic 360-Degree Profile View
-- Unified perspective aggregating program, enrollment status, credits & CGPA
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_student_academic_summary AS
SELECT 
    s.student_id,
    s.university_roll_no,
    s.enrollment_number,
    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
    u.email,
    s.academic_status,
    s.current_semester,
    p.program_code,
    p.program_name,
    d.department_name,
    COUNT(DISTINCT e.enrollment_id) AS total_enrolled_courses,
    COALESCE(
        (SELECT sr.cgpa 
         FROM semester_results sr 
         WHERE sr.student_id = s.student_id 
         ORDER BY sr.published_date DESC LIMIT 1), 
        0.00
    ) AS latest_cgpa,
    COALESCE(
        (SELECT sr.sgpa 
         FROM semester_results sr 
         WHERE sr.student_id = s.student_id 
         ORDER BY sr.published_date DESC LIMIT 1), 
        0.00
    ) AS latest_sgpa,
    COALESCE(
        (SELECT SUM(balance_amount) 
         FROM fee_invoices 
         WHERE student_id = s.student_id), 
        0.00
    ) AS total_fee_dues
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN programs p ON s.program_id = p.program_id
JOIN departments d ON p.department_id = d.department_id
LEFT JOIN enrollments e ON s.student_id = e.student_id AND e.status = 'ENROLLED'
GROUP BY 
    s.student_id, 
    s.university_roll_no, 
    s.enrollment_number, 
    full_name, 
    u.email, 
    s.academic_status, 
    s.current_semester, 
    p.program_code, 
    p.program_name, 
    d.department_name;

