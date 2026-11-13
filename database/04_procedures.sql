-- ============================================================================
-- UNISPHERE: DATABASE PROCEDURES & FUNCTIONS SCRIPT
-- Transactional Orchestration & Mathematical Grading Logic
-- ============================================================================

USE unisphere_db;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- FUNCTION 1: Scalar Grade Calculator
-- Maps a calculated aggregate percentage to the standardized institutional grade
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_calculate_grade$$
CREATE FUNCTION fn_calculate_grade(p_percentage DECIMAL(5,2))
RETURNS VARCHAR(5)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_grade VARCHAR(5);
    
    SELECT grade_letter INTO v_grade
    FROM grade_scale
    WHERE p_percentage >= min_percentage AND p_percentage <= max_percentage
    LIMIT 1;
    
    IF v_grade IS NULL THEN
        IF p_percentage > 100.00 THEN
            SET v_grade = 'O';
        ELSE
            SET v_grade = 'F';
        END IF;
    END IF;
    
    RETURN v_grade;
END$$

-- ----------------------------------------------------------------------------
-- FUNCTION 2: Attendance Eligibility Evaluator
-- Determines whether a student meets the 75% threshold for final exam clearance
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_attendance_eligibility$$
CREATE FUNCTION fn_attendance_eligibility(p_student_id INT, p_offering_id INT)
RETURNS VARCHAR(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_attended INT DEFAULT 0;
    DECLARE v_pct DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT 
        COUNT(ar.record_id),
        COALESCE(SUM(CASE WHEN ar.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END), 0)
    INTO v_total, v_attended
    FROM attendance_sessions att_s
    JOIN attendance_records ar ON att_s.session_id = ar.session_id
    WHERE att_s.offering_id = p_offering_id
      AND ar.student_id = p_student_id;
      
    IF v_total = 0 THEN
        RETURN 'NO_CLASSES_HELD';
    END IF;
    
    SET v_pct = (v_attended * 100.0) / v_total;
    
    IF v_pct >= 75.00 THEN
        RETURN 'ELIGIBLE';
    ELSE
        RETURN 'DEFAULTER';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- PROCEDURE 1: Atomic Course Enrollment with Concurrency Defense
-- Validates prerequisites, checks room/schedule conflicts, and locks capacity
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_enroll_student$$
CREATE PROCEDURE sp_enroll_student(
    IN p_student_id INT,
    IN p_offering_id INT,
    OUT p_status_code VARCHAR(30),
    OUT p_message VARCHAR(255)
)
proc_block: BEGIN
    DECLARE v_course_id INT;
    DECLARE v_current_enrolled INT;
    DECLARE v_max_capacity INT;
    DECLARE v_already_enrolled INT DEFAULT 0;
    DECLARE v_prereq_unmet_count INT DEFAULT 0;
    DECLARE v_timetable_conflict_count INT DEFAULT 0;

    -- Error handler rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'TRANSACTION_ERROR';
        SET p_message = 'Internal database exception encountered during enrollment.';
    END;

    START TRANSACTION;

    -- 1. Check if already enrolled in this offering
    SELECT COUNT(*) INTO v_already_enrolled
    FROM enrollments
    WHERE student_id = p_student_id 
      AND offering_id = p_offering_id
      AND status = 'ENROLLED';

    IF v_already_enrolled > 0 THEN
        ROLLBACK;
        SET p_status_code = 'ALREADY_ENROLLED';
        SET p_message = 'Student is already actively enrolled in this course offering.';
        LEAVE proc_block;
    END IF;

    -- 2. Retrieve offering details and acquire exclusive row lock (FOR UPDATE)
    SELECT course_id, current_enrolled, max_capacity
    INTO v_course_id, v_current_enrolled, v_max_capacity
    FROM course_offerings
    WHERE offering_id = p_offering_id
    FOR UPDATE;

    IF v_course_id IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'OFFERING_NOT_FOUND';
        SET p_message = 'The specified course offering does not exist.';
        LEAVE proc_block;
    END IF;

    -- 3. Validate Course Capacity
    IF v_current_enrolled >= v_max_capacity THEN
        ROLLBACK;
        SET p_status_code = 'CAPACITY_EXCEEDED';
        SET p_message = 'Course offering has reached maximum seating capacity.';
        LEAVE proc_block;
    END IF;

    -- 4. Validate Academic Prerequisites
    SELECT COUNT(*) INTO v_prereq_unmet_count
    FROM course_prerequisites cp
    WHERE cp.course_id = v_course_id
      AND cp.prerequisite_course_id NOT IN (
          SELECT co_completed.course_id
          FROM enrollments en_comp
          JOIN course_offerings co_completed ON en_comp.offering_id = co_completed.offering_id
          WHERE en_comp.student_id = p_student_id 
            AND en_comp.status = 'COMPLETED'
            AND en_comp.final_grade NOT IN ('F', 'I')
      );

    IF v_prereq_unmet_count > 0 THEN
        ROLLBACK;
        SET p_status_code = 'PREREQUISITE_FAILED';
        SET p_message = 'Student has not fulfilled one or more required prerequisite courses with a passing grade.';
        LEAVE proc_block;
    END IF;

    -- 5. Detect Timetable Slot Overlaps with Student's Existing Schedule
    SELECT COUNT(*) INTO v_timetable_conflict_count
    FROM timetable_slots ts_new
    JOIN timetable_slots ts_existing ON ts_new.day_of_week = ts_existing.day_of_week
      AND (
          (ts_new.start_time >= ts_existing.start_time AND ts_new.start_time < ts_existing.end_time) OR
          (ts_new.end_time > ts_existing.start_time AND ts_new.end_time <= ts_existing.end_time) OR
          (ts_new.start_time <= ts_existing.start_time AND ts_new.end_time >= ts_existing.end_time)
      )
    JOIN enrollments e_existing ON ts_existing.offering_id = e_existing.offering_id
    WHERE ts_new.offering_id = p_offering_id
      AND e_existing.student_id = p_student_id
      AND e_existing.status = 'ENROLLED';

    IF v_timetable_conflict_count > 0 THEN
        ROLLBACK;
        SET p_status_code = 'TIMETABLE_COLLISION';
        SET p_message = 'Scheduling collision detected with an existing course in student timetable.';
        LEAVE proc_block;
    END IF;

    -- 6. Insert Enrollment (Trigger will sync capacity counter)
    INSERT INTO enrollments (student_id, offering_id, enrollment_date, status)
    VALUES (p_student_id, p_offering_id, CURRENT_DATE, 'ENROLLED');

    COMMIT;
    SET p_status_code = 'SUCCESS';
    SET p_message = 'Course enrollment completed and confirmed successfully.';
END proc_block$$

-- ----------------------------------------------------------------------------
-- PROCEDURE 2: Comprehensive SGPA & CGPA Academic Calculation
-- Computes component-weighted percentages, letter grades, SGPA & CGPA
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_calculate_sgpa$$
CREATE PROCEDURE sp_calculate_sgpa(
    IN p_student_id INT,
    IN p_semester_id INT,
    OUT p_sgpa DECIMAL(4,2),
    OUT p_cgpa DECIMAL(4,2)
)
BEGIN
    DECLARE v_total_weighted_points DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total_credits INT DEFAULT 0;
    DECLARE v_standing VARCHAR(30) DEFAULT 'GOOD_STANDING';

    -- Temporary cursor variables
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_offering_id INT;
    DECLARE v_course_credits INT;
    DECLARE v_course_percentage DECIMAL(5,2);
    DECLARE v_grade_letter VARCHAR(5);
    DECLARE v_grade_point DECIMAL(4,2);

    -- Cursor to iterate through each enrolled course for the student in this semester
    DECLARE course_cur CURSOR FOR
        SELECT 
            co.offering_id,
            c.credits,
            COALESCE(
                SUM((sm.marks_obtained / ac.max_marks) * ac.weightage_percentage),
                0.00
            ) AS aggregate_pct
        FROM enrollments e
        JOIN course_offerings co ON e.offering_id = co.offering_id
        JOIN courses c ON co.course_id = c.course_id
        LEFT JOIN assessment_components ac ON co.offering_id = ac.offering_id
        LEFT JOIN student_marks sm ON ac.component_id = sm.component_id AND sm.student_id = p_student_id
        WHERE e.student_id = p_student_id 
          AND co.semester_id = p_semester_id
        GROUP BY co.offering_id, c.credits;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    START TRANSACTION;

    OPEN course_cur;

    read_loop: LOOP
        FETCH course_cur INTO v_offering_id, v_course_credits, v_course_percentage;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Retrieve Grade Letter and Grade Point from Reference Scale
        SELECT grade_letter, grade_point 
        INTO v_grade_letter, v_grade_point
        FROM grade_scale
        WHERE v_course_percentage >= min_percentage AND v_course_percentage <= max_percentage
        LIMIT 1;

        IF v_grade_letter IS NULL THEN
            IF v_course_percentage >= 90.0 THEN
                SET v_grade_letter = 'O';
                SET v_grade_point = 10.00;
            ELSE
                SET v_grade_letter = 'F';
                SET v_grade_point = 0.00;
            END IF;
        END IF;

        -- Update Enrollment Record with official grade and points
        UPDATE enrollments
        SET 
            final_grade = v_grade_letter,
            grade_point = v_grade_point,
            status = 'COMPLETED'
        WHERE student_id = p_student_id 
          AND offering_id = v_offering_id;

        -- Accumulate credits and quality points
        SET v_total_weighted_points = v_total_weighted_points + (v_course_credits * v_grade_point);
        SET v_total_credits = v_total_credits + v_course_credits;

    END LOOP;

    CLOSE course_cur;

    -- Calculate SGPA
    IF v_total_credits > 0 THEN
        SET p_sgpa = ROUND(v_total_weighted_points / v_total_credits, 2);
    ELSE
        SET p_sgpa = 0.00;
    END IF;

    -- Calculate Cumulative CGPA across all completed semesters
    SELECT 
        ROUND(
            SUM(c.credits * e.grade_point) / NULLIF(SUM(c.credits), 0),
            2
        ) INTO p_cgpa
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    WHERE e.student_id = p_student_id
      AND e.status = 'COMPLETED'
      AND e.grade_point IS NOT NULL;

    IF p_cgpa IS NULL THEN
        SET p_cgpa = p_sgpa;
    END IF;

    -- Determine Academic Standing
    IF p_sgpa >= 9.00 THEN
        SET v_standing = 'DEANS_LIST';
    ELSEIF p_sgpa < 4.00 THEN
        SET v_standing = 'PROBATION';
    ELSE
        SET v_standing = 'GOOD_STANDING';
    END IF;

    -- Upsert Semester Result snapshot
    INSERT INTO semester_results (
        student_id, 
        semester_id, 
        total_credits_earned, 
        sgpa, 
        cgpa, 
        academic_standing, 
        published_date
    ) VALUES (
        p_student_id, 
        p_semester_id, 
        v_total_credits, 
        p_sgpa, 
        p_cgpa, 
        v_standing, 
        CURRENT_DATE
    )
    ON DUPLICATE KEY UPDATE 
        total_credits_earned = VALUES(total_credits_earned),
        sgpa = VALUES(sgpa),
        cgpa = VALUES(cgpa),
        academic_standing = VALUES(academic_standing),
        published_date = VALUES(published_date);

    COMMIT;
END$$

-- ----------------------------------------------------------------------------
-- PROCEDURE 3: Bulk Semester Invoice Generation with Scholarship Offset
-- Computes program fees, deducts scholarships, and generates ledger items
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_generate_semester_invoices$$
CREATE PROCEDURE sp_generate_semester_invoices(
    IN p_semester_id INT,
    IN p_due_date DATE,
    OUT p_generated_count INT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_student_id INT;
    DECLARE v_program_id INT;
    DECLARE v_curr_sem INT;
    DECLARE v_gross DECIMAL(10,2);
    DECLARE v_disc_pct DECIMAL(5,2);
    DECLARE v_disc_fixed DECIMAL(10,2);
    DECLARE v_scholarship_deduction DECIMAL(10,2);
    DECLARE v_net DECIMAL(10,2);
    DECLARE v_inv_number VARCHAR(30);

    DECLARE student_cur CURSOR FOR
        SELECT student_id, program_id, current_semester
        FROM students
        WHERE academic_status IN ('ENROLLED', 'PROBATION');

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    SET p_generated_count = 0;

    OPEN student_cur;

    gen_loop: LOOP
        FETCH student_cur INTO v_student_id, v_program_id, v_curr_sem;
        IF done THEN
            LEAVE gen_loop;
        END IF;

        -- Retrieve Base Fee Structure for this program & semester
        SELECT total_standard_fee INTO v_gross
        FROM fee_structures
        WHERE program_id = v_program_id
          AND semester_number = v_curr_sem
        ORDER BY structure_id DESC
        LIMIT 1;

        IF v_gross IS NOT NULL THEN
            -- Check for active scholarships
            SELECT 
                COALESCE(MAX(s.discount_percentage), 0.00),
                COALESCE(MAX(s.fixed_discount_amount), 0.00)
            INTO v_disc_pct, v_disc_fixed
            FROM student_scholarships ss
            JOIN scholarships s ON ss.scholarship_id = s.scholarship_id
            WHERE ss.student_id = v_student_id AND ss.is_active = TRUE;

            SET v_scholarship_deduction = ROUND((v_gross * (v_disc_pct / 100.0)) + v_disc_fixed, 2);
            IF v_scholarship_deduction > v_gross THEN
                SET v_scholarship_deduction = v_gross;
            END IF;

            SET v_net = v_gross - v_scholarship_deduction;
            SET v_inv_number = CONCAT('INV-', YEAR(p_due_date), '-', LPAD(p_semester_id, 2, '0'), '-', LPAD(v_student_id, 4, '0'));

            -- Insert Fee Invoice (Ignore if already billed for this semester)
            INSERT INTO fee_invoices (
                invoice_number, 
                student_id, 
                semester_id, 
                gross_amount, 
                scholarship_deduction, 
                net_payable, 
                paid_amount, 
                balance_amount, 
                due_date, 
                status
            ) VALUES (
                v_inv_number,
                v_student_id,
                p_semester_id,
                v_gross,
                v_scholarship_deduction,
                v_net,
                0.00,
                v_net,
                p_due_date,
                'UNPAID'
            )
            ON DUPLICATE KEY UPDATE due_date = VALUES(due_date);

            SET p_generated_count = p_generated_count + 1;
        END IF;

    END LOOP;

    CLOSE student_cur;
END$$

-- ----------------------------------------------------------------------------
-- PROCEDURE 4: ACID Transactional Fee Payment Processing
-- Locks ledger record, generates receipt, and commits settled balances
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_process_fee_payment$$
CREATE PROCEDURE sp_process_fee_payment(
    IN p_invoice_id INT,
    IN p_amount_paid DECIMAL(10,2),
    IN p_payment_mode VARCHAR(30),
    IN p_transaction_ref VARCHAR(80),
    IN p_received_by INT,
    OUT p_receipt_number VARCHAR(40),
    OUT p_status_code VARCHAR(30),
    OUT p_message VARCHAR(255)
)
pay_block: BEGIN
    DECLARE v_balance DECIMAL(10,2);
    DECLARE v_inv_status VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'TRANSACTION_FAILED';
        SET p_message = 'Database rollback: Payment transaction could not be completed.';
    END;

    START TRANSACTION;

    -- Lock the target invoice
    SELECT balance_amount, status
    INTO v_balance, v_inv_status
    FROM fee_invoices
    WHERE invoice_id = p_invoice_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'INVOICE_NOT_FOUND';
        SET p_message = 'Invoice record does not exist.';
        LEAVE pay_block;
    END IF;

    IF v_inv_status = 'PAID' OR v_balance <= 0.00 THEN
        ROLLBACK;
        SET p_status_code = 'ALREADY_SETTLED';
        SET p_message = 'Invoice is already settled with zero balance due.';
        LEAVE pay_block;
    END IF;

    IF p_amount_paid > v_balance THEN
        ROLLBACK;
        SET p_status_code = 'OVERPAYMENT_PROHIBITED';
        SET p_message = CONCAT('Payment amount (', p_amount_paid, ') exceeds outstanding balance (', v_balance, ').');
        LEAVE pay_block;
    END IF;

    -- Generate Unique Receipt
    SET p_receipt_number = CONCAT('REC-', YEAR(CURRENT_DATE), '-', UNIX_TIMESTAMP(), '-', FLOOR(RAND() * 899 + 100));

    -- Insert payment (Triggers will adjust fee_invoices balance and status)
    INSERT INTO payments (
        receipt_number,
        invoice_id,
        amount_paid,
        payment_mode,
        transaction_reference,
        status,
        received_by
    ) VALUES (
        p_receipt_number,
        p_invoice_id,
        p_amount_paid,
        p_payment_mode,
        p_transaction_ref,
        'SUCCESS',
        p_received_by
    );

    COMMIT;
    SET p_status_code = 'SUCCESS';
    SET p_message = 'Payment captured and balance updated successfully.';
END pay_block$$

DELIMITER ;

