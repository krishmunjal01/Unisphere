# UniSphere: University Management & Academic Intelligence System
## Complete Relational Schema Specification & Data Dictionary

### Target RDBMS: MySQL 8.0+ (InnoDB Engine, utf8mb4)
### Normalization Target: 3NF / BCNF Compliant

---

## 1. Relational Entities & Structural Matrix

| Table Name | Primary Key | Candidate / Unique Keys | Foreign Keys & References | Cardinality & Relationships |
| :--- | :--- | :--- | :--- | :--- |
| **users** | `user_id` | `username`, `email` | None | 1:1 with `faculty` or `students` (Inheritance / Subtype) |
| **departments** | `department_id` | `department_code` | `hod_faculty_id` $\rightarrow$ `faculty(faculty_id)` | 1:N with `programs`, 1:N with `faculty`, 1:N with `courses` |
| **programs** | `program_id` | `program_code` | `department_id` $\rightarrow$ `departments(department_id)` | 1:N with `students`, 1:N with `fee_structures` |
| **academic_semesters** | `semester_id` | `semester_code` | None | 1:N with `course_offerings`, 1:N with `fee_invoices` |
| **faculty** | `faculty_id` | `user_id`, `employee_code` | `user_id` $\rightarrow$ `users(user_id)`, `department_id` $\rightarrow$ `departments(department_id)` | 1:N with `course_offerings`, 1:N with `attendance_sessions` |
| **students** | `student_id` | `user_id`, `university_roll_no`, `enrollment_number` | `user_id` $\rightarrow$ `users(user_id)`, `program_id` $\rightarrow$ `programs(program_id)` | 1:N with `enrollments`, 1:N with `attendance_records`, 1:N with `fee_invoices` |
| **courses** | `course_id` | `course_code` | `department_id` $\rightarrow$ `departments(department_id)` | 1:N with `course_offerings`, M:N self via `course_prerequisites` |
| **course_prerequisites** | `(course_id, prerequisite_course_id)` | None (Composite PK) | `course_id` $\rightarrow$ `courses`, `prerequisite_course_id` $\rightarrow$ `courses` | M:N recursive association table |
| **classrooms** | `classroom_id` | `(building, room_number)` | None | 1:N with `timetable_slots`, 1:N with `course_offerings` |
| **course_offerings** | `offering_id` | `(course_id, semester_id, section)` | `course_id` $\rightarrow$ `courses`, `semester_id` $\rightarrow$ `academic_semesters`, `faculty_id` $\rightarrow$ `faculty`, `classroom_id` $\rightarrow$ `classrooms` | 1:N with `enrollments`, 1:N with `timetable_slots`, 1:N with `attendance_sessions` |
| **timetable_slots** | `slot_id` | None | `offering_id` $\rightarrow$ `course_offerings`, `classroom_id` $\rightarrow$ `classrooms` | Represents weekly scheduled lecture intervals |
| **enrollments** | `enrollment_id` | `(student_id, offering_id)` | `student_id` $\rightarrow$ `students`, `offering_id` $\rightarrow$ `course_offerings` | 1:N with `assessment_marks` (indirectly via student/offering) |
| **attendance_sessions** | `session_id` | None | `offering_id` $\rightarrow$ `course_offerings`, `slot_id` $\rightarrow$ `timetable_slots`, `faculty_id` $\rightarrow$ `faculty` | 1:N with `attendance_records` |
| **attendance_records** | `record_id` | `(session_id, student_id)` | `session_id` $\rightarrow$ `attendance_sessions`, `student_id` $\rightarrow$ `students` | Captures individual attendance status |
| **grade_scale** | `grade_letter` | None | None | Reference lookup table for UGC 10-point scale |
| **assessment_components** | `component_id` | None | `offering_id` $\rightarrow$ `course_offerings` | 1:N with `student_marks` |
| **student_marks** | `mark_id` | `(component_id, student_id)` | `component_id` $\rightarrow$ `assessment_components`, `student_id` $\rightarrow$ `students`, `evaluated_by` $\rightarrow$ `faculty` | Stores component raw scores |
| **semester_results** | `result_id` | `(student_id, semester_id)` | `student_id` $\rightarrow$ `students`, `semester_id` $\rightarrow$ `academic_semesters` | Official immutable published transcript records |
| **fee_structures** | `structure_id` | `(program_id, semester_number, academic_year)` | `program_id` $\rightarrow$ `programs` | Base institutional tuition & fee schedule |
| **scholarships** | `scholarship_id` | None | None | 1:N with `student_scholarships` |
| **student_scholarships** | `award_id` | None | `student_id` $\rightarrow$ `students`, `scholarship_id` $\rightarrow$ `scholarships` | M:N junction between students and awards |
| **fee_invoices** | `invoice_id` | `invoice_number`, `(student_id, semester_id)` | `student_id` $\rightarrow$ `students`, `semester_id` $\rightarrow$ `academic_semesters` | 1:N with `payments` |
| **payments** | `payment_id` | `receipt_number`, `transaction_reference` | `invoice_id` $\rightarrow$ `fee_invoices`, `received_by` $\rightarrow$ `users` | Financial transaction audit ledger |
| **audit_logs** | `log_id` | None | None | Engine-level historical log of DML mutations |

---

## 2. Integrity Constraints & Business Invariants

1. **Referential Integrity Actions:**
   - Deletions of parent academic units (e.g., `departments`, `programs`, `courses`) are constrained with `ON DELETE RESTRICT` to prevent orphan cascades in academic records.
   - Child transactional entries (e.g., `attendance_records`, `timetable_slots`, `student_marks`) use `ON DELETE CASCADE` when their parent offering or session is pruned.
2. **Database Check Constraints:**
   - `academic_semesters.chk_semester_dates`: Enforces `end_date > start_date`.
   - `courses.chk_course_credits`: Enforces `credits > 0`.
   - `classrooms.chk_room_capacity`: Enforces `capacity > 0`.
   - `course_offerings.chk_capacity`: Enforces `max_capacity > 0 AND current_enrolled <= max_capacity`.
   - `timetable_slots.chk_slot_time`: Enforces `end_time > start_time`.
   - `grade_scale.chk_grade_points`: Enforces `grade_point >= 0.00 AND grade_point <= 10.00`.
   - `assessment_components.chk_max_marks`: Enforces `max_marks > 0`.
   - `scholarships.chk_scholarship_discount`: Enforces `discount_percentage >= 0 AND discount_percentage <= 100`.
   - `payments.chk_payment_amount`: Enforces `amount_paid > 0`.
3. **Database Triggers (Automated Invariants):**
   - Self-prerequisite loop prevention on `course_prerequisites`.
   - Upper and lower boundary check on `student_marks` against dynamic component maxima.
   - Timetable classroom interval overlap collision detection.
   - Timetable faculty schedule overlap collision detection.
   - Automatic invoice balance decrement and status transition on payment success.
   - Complete forensic audit logging on mark updates.

