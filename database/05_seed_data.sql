-- ============================================================================
-- UNISPHERE: EXTENSIVE SEED DATA SCRIPT
-- Realistic Institutional Data for CSE, ECE & Mathematics Departments
-- ============================================================================

USE unisphere_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE payments;
TRUNCATE TABLE fee_invoices;
TRUNCATE TABLE student_scholarships;
TRUNCATE TABLE scholarships;
TRUNCATE TABLE fee_structures;
TRUNCATE TABLE semester_results;
TRUNCATE TABLE student_marks;
TRUNCATE TABLE assessment_components;
TRUNCATE TABLE grade_scale;
TRUNCATE TABLE attendance_records;
TRUNCATE TABLE attendance_sessions;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE timetable_slots;
TRUNCATE TABLE course_offerings;
TRUNCATE TABLE classrooms;
TRUNCATE TABLE course_prerequisites;
TRUNCATE TABLE courses;
TRUNCATE TABLE students;
TRUNCATE TABLE faculty;
TRUNCATE TABLE academic_semesters;
TRUNCATE TABLE programs;
TRUNCATE TABLE departments;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. GRADE SCALE LOOKUP MASTER (Standard 10-Point UGC/AICTE Grading System)
-- ----------------------------------------------------------------------------
INSERT INTO grade_scale (grade_letter, grade_point, min_percentage, max_percentage, description) VALUES
('O',  10.00, 90.00, 100.00, 'Outstanding'),
('A+',  9.00, 80.00,  89.99, 'Excellent'),
('A',   8.00, 70.00,  79.99, 'Very Good'),
('B+',  7.00, 60.00,  69.99, 'Good'),
('B',   6.00, 55.00,  59.99, 'Above Average'),
('C',   5.00, 50.00,  54.99, 'Average'),
('P',   4.00, 40.00,  49.99, 'Pass'),
('F',   0.00,  0.00,  39.99, 'Fail'),
('I',   0.00,  0.00,   0.00, 'Incomplete');

-- ----------------------------------------------------------------------------
-- 2. USERS (Bcrypt hash for 'password123' or plain match fallback)
-- ----------------------------------------------------------------------------
-- Hash: $2a$10$wT5mS/GqY6U2aL4D3lZ0veR1D0aG1U3z.X0yY0Z012345678901234 (password123)
INSERT INTO users (user_id, username, password_hash, email, role, is_active) VALUES
(1, 'admin',         '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'registrar@unisphere.edu', 'ADMIN', TRUE),
(2, 'prof_alan',     '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'alan.turing@unisphere.edu', 'FACULTY', TRUE),
(3, 'prof_ada',      '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'ada.lovelace@unisphere.edu', 'FACULTY', TRUE),
(4, 'dr_edgar',      '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'edgar.codd@unisphere.edu', 'FACULTY', TRUE),
(5, 'prof_shannon',  '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'claude.shannon@unisphere.edu', 'FACULTY', TRUE),
(6, 'student_aarav', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'aarav.patel@student.unisphere.edu', 'STUDENT', TRUE),
(7, 'student_ananya','$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'ananya.iyer@student.unisphere.edu', 'STUDENT', TRUE),
(8, 'student_rohan', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'rohan.mehta@student.unisphere.edu', 'STUDENT', TRUE),
(9, 'student_priya', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'priya.sharma@student.unisphere.edu', 'STUDENT', TRUE),
(10,'student_kabir', '$2a$10$7EqJtq98hPqEX7fNZaFWoOZh8bCv9h3X1Q2v5P2s0K1Y6y6K7o26X', 'kabir.das@student.unisphere.edu', 'STUDENT', TRUE);

-- ----------------------------------------------------------------------------
-- 3. DEPARTMENTS & PROGRAMS
-- ----------------------------------------------------------------------------
INSERT INTO departments (department_id, department_code, department_name, established_year, budget) VALUES
(1, 'CSE', 'Computer Science & Engineering', 1985, 25000000.00),
(2, 'ECE', 'Electronics & Communication Engineering', 1988, 18000000.00),
(3, 'MATH', 'Department of Mathematics & Computing', 1980, 8000000.00);

INSERT INTO programs (program_id, program_code, program_name, department_id, degree_level, duration_years, total_semesters, total_credits_required) VALUES
(1, 'BTECH-CSE', 'Bachelor of Technology in Computer Science & Engineering', 1, 'UNDERGRADUATE', 4, 8, 160),
(2, 'MTECH-AI',  'Master of Technology in Artificial Intelligence', 1, 'POSTGRADUATE', 2, 4, 72),
(3, 'BTECH-ECE', 'Bachelor of Technology in Electronics & Communication', 2, 'UNDERGRADUATE', 4, 8, 160),
(4, 'BCA',       'Bachelor of Computer Applications', 1, 'UNDERGRADUATE', 3, 6, 120);

-- ----------------------------------------------------------------------------
-- 4. ACADEMIC SEMESTERS
-- ----------------------------------------------------------------------------
INSERT INTO academic_semesters (semester_id, semester_code, academic_year, term_type, start_date, end_date, is_current) VALUES
(1, '2025-ODD',  '2025-2026', 'ODD',  '2025-08-01', '2025-12-15', FALSE),
(2, '2026-EVEN', '2025-2026', 'EVEN', '2026-01-05', '2026-05-20', FALSE),
(3, '2026-ODD',  '2026-2027', 'ODD',  '2026-08-01', '2026-12-15', TRUE);

-- ----------------------------------------------------------------------------
-- 5. FACULTY
-- ----------------------------------------------------------------------------
INSERT INTO faculty (faculty_id, user_id, employee_code, first_name, last_name, department_id, designation, qualification, joining_date, contact_number, status) VALUES
(1, 2, 'FAC-CSE-001', 'Alan', 'Turing', 1, 'PROFESSOR', 'Ph.D. in Theoretical Computer Science (Cambridge)', '2012-07-15', '+91 9876543210', 'ACTIVE'),
(2, 3, 'FAC-CSE-002', 'Ada', 'Lovelace', 1, 'ASSOCIATE_PROFESSOR', 'Ph.D. in Software Engineering (London)', '2015-08-01', '+91 9876543211', 'ACTIVE'),
(3, 4, 'FAC-CSE-003', 'Edgar', 'Codd', 1, 'PROFESSOR', 'Ph.D. in Relational Database Systems (Michigan)', '2010-01-10', '+91 9876543212', 'ACTIVE'),
(4, 5, 'FAC-ECE-001', 'Claude', 'Shannon', 2, 'PROFESSOR', 'Ph.D. in Information Theory (MIT)', '2011-09-01', '+91 9876543213', 'ACTIVE');

-- Assign HODs to departments
UPDATE departments SET hod_faculty_id = 1 WHERE department_id = 1;
UPDATE departments SET hod_faculty_id = 4 WHERE department_id = 2;

-- ----------------------------------------------------------------------------
-- 6. STUDENTS
-- ----------------------------------------------------------------------------
INSERT INTO students (student_id, user_id, university_roll_no, enrollment_number, first_name, last_name, date_of_birth, gender, program_id, current_semester, admission_year, contact_number, blood_group, guardian_name, guardian_contact, academic_status) VALUES
(1, 6, '2024CSE001', 'ENR-2024-CSE-001', 'Aarav', 'Patel', '2004-05-14', 'MALE', 1, 5, 2024, '+91 9123456780', 'O+', 'Suresh Patel', '+91 9822001122', 'ENROLLED'),
(2, 7, '2024CSE002', 'ENR-2024-CSE-002', 'Ananya', 'Iyer', '2004-09-22', 'FEMALE', 1, 5, 2024, '+91 9123456781', 'A+', 'Ramanathan Iyer', '+91 9822001123', 'ENROLLED'),
(3, 8, '2024CSE003', 'ENR-2024-CSE-003', 'Rohan', 'Mehta', '2003-11-08', 'MALE', 1, 5, 2024, '+91 9123456782', 'B+', 'Kishore Mehta', '+91 9822001124', 'ENROLLED'),
(4, 9, '2024ECE001', 'ENR-2024-ECE-001', 'Priya', 'Sharma', '2004-03-30', 'FEMALE', 3, 5, 2024, '+91 9123456783', 'AB+', 'Sunil Sharma', '+91 9822001125', 'ENROLLED'),
(5, 10,'2025BCA001', 'ENR-2025-BCA-001', 'Kabir', 'Das', '2005-01-19', 'MALE', 4, 3, 2025, '+91 9123456784', 'O-', 'Manoj Das', '+91 9822001126', 'ENROLLED');

-- ----------------------------------------------------------------------------
-- 7. COURSES & PREREQUISITES
-- ----------------------------------------------------------------------------
INSERT INTO courses (course_id, course_code, title, department_id, credits, lecture_hours, tutorial_hours, practical_hours, course_type, description) VALUES
(1, 'CS101', 'Introduction to Computing & C Programming', 1, 4, 3, 0, 2, 'CORE', 'Fundamental procedural programming and algorithms.'),
(2, 'CS201', 'Data Structures & Algorithms', 1, 4, 3, 1, 2, 'CORE', 'Linear and non-linear data structures, trees, graphs, and algorithmic complexity.'),
(3, 'CS301', 'Database Management Systems', 1, 4, 3, 0, 2, 'CORE', 'Relational model, SQL, normalization, concurrency control, and transactions.'),
(4, 'CS302', 'Operating Systems Principles', 1, 4, 3, 0, 2, 'CORE', 'Processes, memory virtualization, concurrency, file systems, and scheduling.'),
(5, 'CS401', 'Distributed Systems & Cloud Computing', 1, 3, 3, 0, 0, 'PROGRAM_ELECTIVE', 'Consensus protocols, CAP theorem, distributed databases and microservices.'),
(6, 'EC201', 'Digital Electronics & Logic Design', 2, 4, 3, 1, 2, 'CORE', 'Boolean algebra, combinational and sequential logic circuit design.'),
(7, 'EC301', 'Signals, Systems & Information Theory', 2, 4, 3, 1, 0, 'CORE', 'Fourier analysis, sampling, entropy, and channel capacity.');

-- Prerequisite Mapping:
-- CS201 requires CS101
-- CS301 requires CS201
-- CS401 requires CS301 and CS302
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade_required) VALUES
(2, 1, 'P'),
(3, 2, 'P'),
(5, 3, 'B'),
(5, 4, 'B');

-- ----------------------------------------------------------------------------
-- 8. CLASSROOMS
-- ----------------------------------------------------------------------------
INSERT INTO classrooms (classroom_id, room_number, building, floor_number, capacity, room_type, has_projector) VALUES
(1, 'CR-101', 'Turing Academic Block', 1, 80, 'LECTURE_HALL', TRUE),
(2, 'CR-102', 'Turing Academic Block', 1, 80, 'LECTURE_HALL', TRUE),
(3, 'LAB-201', 'Shannon Computing Centre', 2, 40, 'COMPUTER_LAB', TRUE),
(4, 'LAB-202', 'Shannon Computing Centre', 2, 40, 'COMPUTER_LAB', TRUE),
(5, 'SEM-301', 'Ramanujan Central Block', 3, 120, 'SEMINAR_ROOM', TRUE);

-- ----------------------------------------------------------------------------
-- 9. COURSE OFFERINGS (Active Fall 2026 Semester)
-- ----------------------------------------------------------------------------
INSERT INTO course_offerings (offering_id, course_id, semester_id, faculty_id, section, max_capacity, current_enrolled, classroom_id) VALUES
(1, 3, 3, 3, 'A', 60, 0, 1), -- CS301 (DBMS) taught by Dr. Edgar Codd in CR-101
(2, 4, 3, 1, 'A', 60, 0, 2), -- CS302 (OS) taught by Prof. Alan Turing in CR-102
(3, 5, 3, 2, 'A', 40, 0, 3), -- CS401 (Distributed Systems) taught by Dr. Ada Lovelace in LAB-201
(4, 7, 3, 4, 'A', 60, 0, 5); -- EC301 (Signals) taught by Prof. Claude Shannon in SEM-301

-- ----------------------------------------------------------------------------
-- 10. TIMETABLE SLOTS
-- ----------------------------------------------------------------------------
INSERT INTO timetable_slots (slot_id, offering_id, classroom_id, day_of_week, start_time, end_time) VALUES
(1, 1, 1, 'MONDAY',    '09:00:00', '10:00:00'),
(2, 1, 1, 'WEDNESDAY', '09:00:00', '10:00:00'),
(3, 1, 1, 'FRIDAY',    '09:00:00', '10:00:00'),
(4, 2, 2, 'MONDAY',    '10:15:00', '11:15:00'),
(5, 2, 2, 'WEDNESDAY', '10:15:00', '11:15:00'),
(6, 2, 2, 'FRIDAY',    '10:15:00', '11:15:00'),
(7, 3, 3, 'TUESDAY',   '11:30:00', '13:00:00'),
(8, 3, 3, 'THURSDAY',  '11:30:00', '13:00:00'),
(9, 4, 5, 'MONDAY',    '14:00:00', '15:30:00');

-- ----------------------------------------------------------------------------
-- 11. ENROLLMENTS
-- ----------------------------------------------------------------------------
-- Prior completed courses (Sem 3 and 4) to satisfy prerequisites:
INSERT INTO course_offerings (offering_id, course_id, semester_id, faculty_id, section, max_capacity, current_enrolled, classroom_id) VALUES
(100, 1, 1, 1, 'A', 60, 3, 1), -- CS101 (2025-ODD)
(101, 2, 2, 2, 'A', 60, 3, 2); -- CS201 (2026-EVEN)

INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status, final_grade, grade_point) VALUES
(1, 1, 100, '2025-08-05', 'COMPLETED', 'A+', 9.00), -- Aarav passed CS101
(2, 1, 101, '2026-01-10', 'COMPLETED', 'O',  10.00), -- Aarav passed CS201
(3, 2, 100, '2025-08-05', 'COMPLETED', 'A',  8.00),  -- Ananya passed CS101
(4, 2, 101, '2026-01-10', 'COMPLETED', 'A+', 9.00),  -- Ananya passed CS201
(5, 3, 100, '2025-08-05', 'COMPLETED', 'B+', 7.00),  -- Rohan passed CS101
(6, 3, 101, '2026-01-10', 'COMPLETED', 'B',  6.00);  -- Rohan passed CS201

-- Active Enrollments for Current Semester (2026-ODD)
INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status) VALUES
(7, 1, 1, '2026-08-02', 'ENROLLED'), -- Aarav in CS301 (DBMS)
(8, 1, 2, '2026-08-02', 'ENROLLED'), -- Aarav in CS302 (OS)
(9, 2, 1, '2026-08-02', 'ENROLLED'), -- Ananya in CS301 (DBMS)
(10, 2, 2, '2026-08-02', 'ENROLLED'),-- Ananya in CS302 (OS)
(11, 3, 1, '2026-08-02', 'ENROLLED'),-- Rohan in CS301 (DBMS)
(12, 4, 4, '2026-08-03', 'ENROLLED');-- Priya in EC301 (Signals)

-- Update current_enrolled counts
UPDATE course_offerings SET current_enrolled = 3 WHERE offering_id = 1;
UPDATE course_offerings SET current_enrolled = 2 WHERE offering_id = 2;
UPDATE course_offerings SET current_enrolled = 1 WHERE offering_id = 4;

-- ----------------------------------------------------------------------------
-- 12. ATTENDANCE SESSIONS & RECORDS
-- ----------------------------------------------------------------------------
INSERT INTO attendance_sessions (session_id, offering_id, slot_id, faculty_id, session_date, topic_covered) VALUES
(1, 1, 1, 3, '2026-08-10', 'Introduction to Relational Architecture & ACID Properties'),
(2, 1, 2, 3, '2026-08-12', 'Relational Algebra & Entity Relationship Modeling'),
(3, 1, 3, 3, '2026-08-14', 'SQL DDL, Integrity Constraints & Surrogate Keys'),
(4, 1, 1, 3, '2026-08-17', 'Normalization: 1NF, 2NF, 3NF and BCNF Proofs'),
(5, 2, 4, 1, '2026-08-10', 'Process Lifecycle, PCB & Context Switching'),
(6, 2, 5, 1, '2026-08-12', 'CPU Scheduling Algorithms: Round Robin & Multi-Level Queue');

-- Student Attendance entries
-- Aarav: Present in all sessions (100%)
-- Ananya: Present in all sessions (100%)
-- Rohan: Absent in sessions 3 and 4 (50% - Defaulter!)
INSERT INTO attendance_records (session_id, student_id, status, remarks) VALUES
(1, 1, 'PRESENT', 'On time'),
(1, 2, 'PRESENT', 'On time'),
(1, 3, 'PRESENT', 'On time'),
(2, 1, 'PRESENT', 'On time'),
(2, 2, 'PRESENT', 'On time'),
(2, 3, 'LATE',    '10 mins late'),
(3, 1, 'PRESENT', 'On time'),
(3, 2, 'PRESENT', 'On time'),
(3, 3, 'ABSENT',  'Unexcused absence'),
(4, 1, 'PRESENT', 'On time'),
(4, 2, 'PRESENT', 'On time'),
(4, 3, 'ABSENT',  'Unexcused absence'),
-- OS Sessions
(5, 1, 'PRESENT', 'On time'),
(5, 2, 'PRESENT', 'On time'),
(6, 1, 'PRESENT', 'On time'),
(6, 2, 'PRESENT', 'On time');

-- ----------------------------------------------------------------------------
-- 13. ASSESSMENT COMPONENTS & STUDENT MARKS
-- ----------------------------------------------------------------------------
INSERT INTO assessment_components (component_id, offering_id, component_name, max_marks, weightage_percentage, due_date) VALUES
(1, 1, 'MID_TERM_EXAM', 100.00, 30.00, '2026-09-25'),
(2, 1, 'LAB_PRACTICAL',  50.00, 20.00, '2026-10-15'),
(3, 1, 'FINAL_THEORY',  100.00, 50.00, '2026-12-05'),
(4, 2, 'MID_TERM_EXAM', 100.00, 40.00, '2026-09-28'),
(5, 2, 'FINAL_THEORY',  100.00, 60.00, '2026-12-08');

INSERT INTO student_marks (component_id, student_id, marks_obtained, evaluated_by, remarks) VALUES
(1, 1, 94.50, 3, 'Exceptional understanding of normalization'),
(1, 2, 88.00, 3, 'Strong relational algebra proofs'),
(1, 3, 62.00, 3, 'Needs revision of functional dependencies'),
(2, 1, 48.00, 3, 'Flawless stored procedure syntax'),
(2, 2, 45.00, 3, 'Well implemented index demonstration'),
(2, 3, 30.00, 3, 'Trigger logic incomplete'),
(4, 1, 91.00, 1, 'Excellent synchronization algorithms'),
(4, 2, 85.00, 1, 'Good deadlock avoidance explanations');

-- ----------------------------------------------------------------------------
-- 14. FINANCIAL STRUCTURES, SCHOLARSHIPS & INVOICES
-- ----------------------------------------------------------------------------
INSERT INTO fee_structures (structure_id, program_id, semester_number, academic_year, tuition_fee, development_fee, examination_fee, library_fee) VALUES
(1, 1, 5, '2026-2027', 65000.00, 10000.00, 3000.00, 2000.00), -- Total: 80,000.00
(2, 3, 5, '2026-2027', 60000.00, 10000.00, 3000.00, 2000.00), -- Total: 75,000.00
(3, 4, 3, '2026-2027', 35000.00,  5000.00, 2000.00, 1000.00); -- Total: 43,000.00

INSERT INTO scholarships (scholarship_id, scholarship_name, discount_percentage, fixed_discount_amount, eligibility_criteria) VALUES
(1, 'Merit Excellence Award', 25.00, 0.00, 'CGPA >= 9.0 in previous year'),
(2, 'Economically Weaker Section (EWS) Grant', 50.00, 0.00, 'Annual family income < 3 LPA'),
(3, 'Sports & Cultural Laureate', 0.00, 15000.00, 'National level athletics representative');

-- Aarav Patel has 25% Merit Scholarship
INSERT INTO student_scholarships (award_id, student_id, scholarship_id, awarded_date, is_active) VALUES
(1, 1, 1, '2025-08-01', TRUE);

-- Semester 5 Invoices:
-- Aarav: Gross 80,000 - 20,000 (25% Merit) = Net 60,000. Paid 60,000 (PAID)
-- Ananya: Gross 80,000 - 0 = Net 80,000. Paid 40,000 (PARTIALLY_PAID)
-- Rohan: Gross 80,000 - 0 = Net 80,000. Paid 0.00 (OVERDUE - Defaulter!)
-- Priya: Gross 75,000 - 0 = Net 75,000. Paid 75,000 (PAID)
-- (Notice: paid_amount starts at 0.00, then payments INSERT trigger trg_update_invoice_on_payment updates it!)
INSERT INTO fee_invoices (invoice_id, invoice_number, student_id, semester_id, gross_amount, scholarship_deduction, net_payable, paid_amount, balance_amount, due_date, status) VALUES
(1, 'INV-2026-03-0001', 1, 3, 80000.00, 20000.00, 60000.00, 0.00, 60000.00, '2026-08-25', 'UNPAID'),
(2, 'INV-2026-03-0002', 2, 3, 80000.00,     0.00, 80000.00, 0.00, 80000.00, '2026-08-25', 'UNPAID'),
(3, 'INV-2026-03-0003', 3, 3, 80000.00,     0.00, 80000.00, 0.00, 80000.00, '2026-08-25', 'OVERDUE'),
(4, 'INV-2026-03-0004', 4, 3, 75000.00,     0.00, 75000.00, 0.00, 75000.00, '2026-08-25', 'UNPAID');

-- Payments ledger
INSERT INTO payments (payment_id, receipt_number, invoice_id, amount_paid, payment_mode, transaction_reference, status, received_by) VALUES
(1, 'REC-2026-172345001', 1, 60000.00, 'ONLINE_GATEWAY', 'TXN-RAZOR-89214712', 'SUCCESS', NULL),
(2, 'REC-2026-172345002', 2, 40000.00, 'UPI',            'TXN-UPI-99214819',   'SUCCESS', NULL),
(3, 'REC-2026-172345003', 4, 75000.00, 'NET_BANKING',    'TXN-HDFC-10492812',  'SUCCESS', NULL);

-- ----------------------------------------------------------------------------
-- 15. AUDIT LOGS
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (table_name, operation_type, record_id, performed_by, old_value, new_value, ip_address) VALUES
('fee_invoices', 'INSERT', 'INV-2026-03-0001', 'SYSTEM_BILLING', NULL, JSON_OBJECT('net_payable', 60000.00, 'due_date', '2026-08-25'), '127.0.0.1'),
('enrollments',  'INSERT', 'ENROLL:1|OFFERING:1', 'sp_enroll_student', NULL, JSON_OBJECT('student_id', 1, 'offering_id', 1), '127.0.0.1');
