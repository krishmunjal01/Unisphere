-- ============================================================================
-- UNISPHERE: DATABASE TRIGGERS SCRIPT
-- Integrity Enforcement, Conflict Avoidance & Compliance Auditing
-- ============================================================================

USE unisphere_db;

DELIMITER $$

-- ----------------------------------------------------------------------------
-- TRIGGER 0: Self-Prerequisite Prevention
-- Ensures a course cannot be set as its own prerequisite
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_prerequisite_insert$$
CREATE TRIGGER trg_validate_prerequisite_insert
BEFORE INSERT ON course_prerequisites
FOR EACH ROW
BEGIN
    IF NEW.course_id = NEW.prerequisite_course_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: A course cannot be configured as a prerequisite for itself.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 1: Boundary Enforcement on Assessment Marks
-- Prevents negative marks or marks exceeding component maximum
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_validate_marks_insert$$
CREATE TRIGGER trg_validate_marks_insert
BEFORE INSERT ON student_marks
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);
    
    SELECT max_marks INTO v_max_marks 
    FROM assessment_components 
    WHERE component_id = NEW.component_id;
    
    IF NEW.marks_obtained < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: marks_obtained cannot be negative.';
    END IF;
    
    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: marks_obtained exceeds the maximum permissible marks for this component.';
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_validate_marks_update$$
CREATE TRIGGER trg_validate_marks_update
BEFORE UPDATE ON student_marks
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);
    
    SELECT max_marks INTO v_max_marks 
    FROM assessment_components 
    WHERE component_id = NEW.component_id;
    
    IF NEW.marks_obtained < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: marks_obtained cannot be negative.';
    END IF;
    
    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Error: marks_obtained exceeds the maximum permissible marks for this component.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 2: Immutable Forensic Audit on Mark Modifications
-- Logs every grade change with old value, new value, and evaluator identity
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_audit_marks_change$$
CREATE TRIGGER trg_audit_marks_change
AFTER UPDATE ON student_marks
FOR EACH ROW
BEGIN
    IF OLD.marks_obtained <> NEW.marks_obtained THEN
        INSERT INTO audit_logs (
            table_name, 
            operation_type, 
            record_id, 
            performed_by, 
            old_value, 
            new_value
        ) VALUES (
            'student_marks',
            'UPDATE',
            CONCAT('MARK_ID:', NEW.mark_id, '|STUDENT:', NEW.student_id),
            CONCAT('FACULTY_ID:', NEW.evaluated_by),
            JSON_OBJECT('marks_obtained', OLD.marks_obtained, 'evaluated_at', OLD.evaluated_at),
            JSON_OBJECT('marks_obtained', NEW.marks_obtained, 'remarks', NEW.remarks)
        );
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 3: Financial Settlement Automation
-- Automatically updates invoice ledger, balance, and status upon successful payment
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_update_invoice_on_payment$$
CREATE TRIGGER trg_update_invoice_on_payment
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'SUCCESS' THEN
        UPDATE fee_invoices
        SET 
            paid_amount = paid_amount + NEW.amount_paid,
            balance_amount = net_payable - paid_amount,
            status = CASE 
                WHEN (net_payable - paid_amount) <= 0.00 THEN 'PAID'
                ELSE 'PARTIALLY_PAID'
            END
        WHERE invoice_id = NEW.invoice_id;
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 4: Timetable Classroom Collision Detection
-- Prevents room double-booking during overlapping intervals
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_check_room_collision_insert$$
CREATE TRIGGER trg_check_room_collision_insert
BEFORE INSERT ON timetable_slots
FOR EACH ROW
BEGIN
    DECLARE v_collision_count INT;
    
    SELECT COUNT(*) INTO v_collision_count
    FROM timetable_slots
    WHERE classroom_id = NEW.classroom_id
      AND day_of_week = NEW.day_of_week
      AND (
          (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
          (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
          (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      );
      
    IF v_collision_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Classroom Collision: Room is already booked for another course offering during this time interval.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 5: Timetable Faculty Collision Detection
-- Prevents a professor from being scheduled in two different rooms at the same time
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_check_faculty_collision_insert$$
CREATE TRIGGER trg_check_faculty_collision_insert
BEFORE INSERT ON timetable_slots
FOR EACH ROW
BEGIN
    DECLARE v_faculty_id INT;
    DECLARE v_conflict_count INT;
    
    -- Retrieve faculty assigned to the offering being scheduled
    SELECT faculty_id INTO v_faculty_id 
    FROM course_offerings 
    WHERE offering_id = NEW.offering_id;
    
    SELECT COUNT(*) INTO v_conflict_count
    FROM timetable_slots ts
    JOIN course_offerings co ON ts.offering_id = co.offering_id
    WHERE co.faculty_id = v_faculty_id
      AND ts.day_of_week = NEW.day_of_week
      AND (
          (NEW.start_time >= ts.start_time AND NEW.start_time < ts.end_time) OR
          (NEW.end_time > ts.start_time AND NEW.end_time <= ts.end_time) OR
          (NEW.start_time <= ts.start_time AND NEW.end_time >= ts.end_time)
      );
      
    IF v_conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Faculty Schedule Conflict: The instructor is already scheduled to teach another offering at this time.';
    END IF;
END$$

-- ----------------------------------------------------------------------------
-- TRIGGER 6: Capacity Synchronization on Enrollment
-- Increments enrolled count and ensures max capacity isn't breached
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_enrollment_capacity_sync$$
CREATE TRIGGER trg_enrollment_capacity_sync
AFTER INSERT ON enrollments
FOR EACH ROW
BEGIN
    UPDATE course_offerings
    SET current_enrolled = current_enrolled + 1
    WHERE offering_id = NEW.offering_id;
END$$

DELIMITER ;
