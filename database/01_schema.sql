-- ============================================================================
-- UNISPHERE: UNIVERSITY MANAGEMENT & ACADEMIC INTELLIGENCE SYSTEM
-- Relational Database Definition Script (DDL)
-- Target RDBMS: MySQL 8.0+ (InnoDB Engine, utf8mb4)
-- Normalization Level: 3NF / BCNF Compliant
-- ============================================================================

DROP DATABASE IF EXISTS unisphere_db;
CREATE DATABASE unisphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unisphere_db;

-- ----------------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION (RBAC Foundation)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. ACADEMIC STRUCTURE: DEPARTMENTS & PROGRAMS
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    hod_faculty_id INT NULL, -- Resolved via post-faculty update or trigger
    established_year INT NOT NULL,
    budget DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE programs (
    program_id INT AUTO_INCREMENT PRIMARY KEY,
    program_code VARCHAR(15) NOT NULL UNIQUE,
    program_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    degree_level ENUM('UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORAL', 'DIPLOMA') NOT NULL,
    duration_years INT NOT NULL DEFAULT 4,
    total_semesters INT NOT NULL DEFAULT 8,
    total_credits_required INT NOT NULL DEFAULT 160,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_program_department FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE academic_semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    semester_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., '2026-FALL', '2026-SPRING'
    academic_year VARCHAR(10) NOT NULL,        -- e.g., '2026-2027'
    term_type ENUM('ODD', 'EVEN', 'SUMMER') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_semester_dates CHECK (end_date > start_date)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. FACULTY PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INT NOT NULL,
    designation ENUM('PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'ADJUNCT') NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    status ENUM('ACTIVE', 'ON_LEAVE', 'RESIGNED', 'RETIRED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Circular reference resolve: link departments HOD to faculty
ALTER TABLE departments
ADD CONSTRAINT fk_department_hod FOREIGN KEY (hod_faculty_id) 
    REFERENCES faculty(faculty_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- 4. STUDENT PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    university_roll_no VARCHAR(20) NOT NULL UNIQUE,
    enrollment_number VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    program_id INT NOT NULL,
    current_semester INT NOT NULL DEFAULT 1,
    admission_year INT NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    blood_group VARCHAR(5) NULL,
    guardian_name VARCHAR(100) NOT NULL,
    guardian_contact VARCHAR(15) NOT NULL,
    academic_status ENUM('ENROLLED', 'PROBATION', 'SUSPENDED', 'ALUMNI', 'WITHDRAWN') NOT NULL DEFAULT 'ENROLLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_student_program FOREIGN KEY (program_id) 
        REFERENCES programs(program_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_student_sem CHECK (current_semester >= 1 AND current_semester <= 12)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. COURSE CATALOG & PREREQUISITES
-- ----------------------------------------------------------------------------
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(15) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    department_id INT NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    lecture_hours INT NOT NULL DEFAULT 3,
    tutorial_hours INT NOT NULL DEFAULT 0,
    practical_hours INT NOT NULL DEFAULT 0,
    course_type ENUM('CORE', 'PROGRAM_ELECTIVE', 'OPEN_ELECTIVE', 'LABORATORY', 'PROJECT') NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_dept FOREIGN KEY (department_id) 
        REFERENCES departments(department_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_course_credits CHECK (credits > 0)
) ENGINE=InnoDB;

CREATE TABLE course_prerequisites (
    course_id INT NOT NULL,
    prerequisite_course_id INT NOT NULL,
    min_grade_required VARCHAR(5) NOT NULL DEFAULT 'D',
    PRIMARY KEY (course_id, prerequisite_course_id),
    CONSTRAINT fk_cp_course FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cp_prereq FOREIGN KEY (prerequisite_course_id) 
        REFERENCES courses(course_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. CLASSROOMS & PHYSICAL INFRASTRUCTURE
-- ----------------------------------------------------------------------------
CREATE TABLE classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL DEFAULT 1,
    capacity INT NOT NULL DEFAULT 60,
    room_type ENUM('LECTURE_HALL', 'COMPUTER_LAB', 'SEMINAR_ROOM', 'WORKSHOP') NOT NULL DEFAULT 'LECTURE_HALL',
    has_projector BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_building_room UNIQUE (building, room_number),
    CONSTRAINT chk_room_capacity CHECK (capacity > 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. COURSE OFFERINGS (Runtime Section Realization)
-- ----------------------------------------------------------------------------
CREATE TABLE course_offerings (
    offering_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    faculty_id INT NOT NULL,
    section VARCHAR(5) NOT NULL DEFAULT 'A',
    max_capacity INT NOT NULL DEFAULT 60,
    current_enrolled INT NOT NULL DEFAULT 0,
    classroom_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_course_sem_section UNIQUE (course_id, semester_id, section),
    CONSTRAINT fk_co_course FOREIGN KEY (course_id) 
        REFERENCES courses(course_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_co_semester FOREIGN KEY (semester_id) 
        REFERENCES academic_semesters(semester_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_co_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_co_classroom FOREIGN KEY (classroom_id) 
        REFERENCES classrooms(classroom_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_capacity CHECK (max_capacity > 0 AND current_enrolled <= max_capacity)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. TIMETABLE & SCHEDULING
-- ----------------------------------------------------------------------------
CREATE TABLE timetable_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    classroom_id INT NOT NULL,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ts_offering FOREIGN KEY (offering_id) 
        REFERENCES course_offerings(offering_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ts_classroom FOREIGN KEY (classroom_id) 
        REFERENCES classrooms(classroom_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_slot_time CHECK (end_time > start_time),
    INDEX idx_ts_lookup (classroom_id, day_of_week, start_time, end_time)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. STUDENT COURSE ENROLLMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    offering_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('ENROLLED', 'DROPPED', 'COMPLETED', 'WITHDRAWN') NOT NULL DEFAULT 'ENROLLED',
    final_grade VARCHAR(5) NULL,
    grade_point DECIMAL(4,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_offering UNIQUE (student_id, offering_id),
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_enroll_offering FOREIGN KEY (offering_id) 
        REFERENCES course_offerings(offering_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 10. ATTENDANCE SYSTEM
-- ----------------------------------------------------------------------------
CREATE TABLE attendance_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    slot_id INT NULL,
    faculty_id INT NOT NULL,
    session_date DATE NOT NULL,
    topic_covered VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_as_offering FOREIGN KEY (offering_id) 
        REFERENCES course_offerings(offering_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_as_slot FOREIGN KEY (slot_id) 
        REFERENCES timetable_slots(slot_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_as_faculty FOREIGN KEY (faculty_id) 
        REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_as_offering_date (offering_id, session_date)
) ENGINE=InnoDB;

CREATE TABLE attendance_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL DEFAULT 'PRESENT',
    remarks VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_session_student UNIQUE (session_id, student_id),
    CONSTRAINT fk_ar_session FOREIGN KEY (session_id) 
        REFERENCES attendance_sessions(session_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ar_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ar_student_status (student_id, status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 11. EXAMINATIONS, ASSESSMENTS & GRADING
-- ----------------------------------------------------------------------------
CREATE TABLE grade_scale (
    grade_letter VARCHAR(5) PRIMARY KEY,
    grade_point DECIMAL(4,2) NOT NULL,
    min_percentage DECIMAL(5,2) NOT NULL,
    max_percentage DECIMAL(5,2) NOT NULL,
    description VARCHAR(50) NOT NULL,
    CONSTRAINT chk_grade_points CHECK (grade_point >= 0.00 AND grade_point <= 10.00)
) ENGINE=InnoDB;

CREATE TABLE assessment_components (
    component_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    component_name VARCHAR(50) NOT NULL, -- e.g. 'MID_TERM', 'FINAL_EXAM', 'ASSIGNMENT_1'
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    weightage_percentage DECIMAL(5,2) NOT NULL, -- Must sum to 100 across offering
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ac_offering FOREIGN KEY (offering_id) 
        REFERENCES course_offerings(offering_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_max_marks CHECK (max_marks > 0)
) ENGINE=InnoDB;

CREATE TABLE student_marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    component_id INT NOT NULL,
    student_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    evaluated_by INT NOT NULL,
    remarks VARCHAR(150) NULL,
    evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_component_student UNIQUE (component_id, student_id),
    CONSTRAINT fk_sm_component FOREIGN KEY (component_id) 
        REFERENCES assessment_components(component_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sm_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sm_faculty FOREIGN KEY (evaluated_by) 
        REFERENCES faculty(faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE semester_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    total_credits_earned INT NOT NULL DEFAULT 0,
    sgpa DECIMAL(4,2) NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    academic_standing ENUM('DEANS_LIST', 'GOOD_STANDING', 'PROBATION', 'TERMINATED') NOT NULL DEFAULT 'GOOD_STANDING',
    published_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_semester_result UNIQUE (student_id, semester_id),
    CONSTRAINT fk_sr_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sr_semester FOREIGN KEY (semester_id) 
        REFERENCES academic_semesters(semester_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 12. FEES, SCHOLARSHIPS & FINANCIAL TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE fee_structures (
    structure_id INT AUTO_INCREMENT PRIMARY KEY,
    program_id INT NOT NULL,
    semester_number INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    tuition_fee DECIMAL(10,2) NOT NULL,
    development_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    examination_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    library_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_standard_fee DECIMAL(10,2) GENERATED ALWAYS AS (tuition_fee + development_fee + examination_fee + library_fee) STORED,
    CONSTRAINT uq_program_sem_fee UNIQUE (program_id, semester_number, academic_year),
    CONSTRAINT fk_fee_program FOREIGN KEY (program_id) 
        REFERENCES programs(program_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE scholarships (
    scholarship_id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_name VARCHAR(100) NOT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    fixed_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    eligibility_criteria TEXT NULL,
    CONSTRAINT chk_scholarship_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
) ENGINE=InnoDB;

CREATE TABLE student_scholarships (
    award_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    scholarship_id INT NOT NULL,
    awarded_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ss_scholarship FOREIGN KEY (scholarship_id) 
        REFERENCES scholarships(scholarship_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE fee_invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    gross_amount DECIMAL(10,2) NOT NULL,
    scholarship_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_payable DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_invoice UNIQUE (student_id, semester_id),
    CONSTRAINT fk_inv_student FOREIGN KEY (student_id) 
        REFERENCES students(student_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inv_semester FOREIGN KEY (semester_id) 
        REFERENCES academic_semesters(semester_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_invoice_status (status, due_date)
) ENGINE=InnoDB;

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(40) NOT NULL UNIQUE,
    invoice_id INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('ONLINE_GATEWAY', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'DEMAND_DRAFT', 'CASH') NOT NULL,
    transaction_reference VARCHAR(80) NOT NULL UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED') NOT NULL DEFAULT 'SUCCESS',
    received_by INT NULL, -- references users(user_id) if cash/counter
    CONSTRAINT fk_pay_invoice FOREIGN KEY (invoice_id) 
        REFERENCES fee_invoices(invoice_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pay_user FOREIGN KEY (received_by) 
        REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount_paid > 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGS (Compliance & Forensics)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    performed_by VARCHAR(60) NOT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(45) NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_table (table_name, operation_type),
    INDEX idx_audit_time (performed_at)
) ENGINE=InnoDB;
