# UniSphere: End-to-End Examiner Viva & Demonstration Script
## Step-by-Step Technical Defense Guide for Full Marks

This walkthrough is structured to demonstrate **real relational database management systems concepts** directly through the running system.

---

### Step 1: Prove Relational Foundation & Normalization (1–2 minutes)
1. **Open the System in Admin Mode:**
   - Log in as `admin` (Dr. Rajesh Sharma, Registrar).
   - Show the Institutional KPI dashboard: Total Students, Faculty, Offerings, Billed vs Collected fees.
2. **Present the Schema & Normalization:**
   - Explain to the examiner:
     > *"We designed 24 normalized tables conforming to 3NF and BCNF. We decoupled static curriculum catalogs (`courses`) from runtime course execution (`course_offerings`), and eliminated transitive dependencies across programs, departments, and enrollment ledgers."*
   - Open the **DBMS Intelligence Lab** tab in the interface.

---

### Step 2: Live Recursive CTE Demonstration (2 minutes)
1. In the **DBMS Intelligence Lab**, select the **Prerequisite Graph (Recursive CTE)** tab.
2. Select course **CS401 (Distributed Systems)** for student **Aarav Patel (2024CSE001)**.
3. Click **Execute Recursive Query**.
4. Point out to the examiner:
   - *Depth 3:* CS101 $\rightarrow$ Cleared with Grade `A+`
   - *Depth 2:* CS201 $\rightarrow$ Cleared with Grade `O`
   - *Depth 1:* CS301 (DBMS) $\rightarrow$ Pending enrollment
   - *Depth 1:* CS302 (OS) $\rightarrow$ Pending enrollment
5. Key Viva Defense:
   > *"Notice how the database engine recursively resolves arbitrary prerequisite tree depth using `WITH RECURSIVE` without any external recursive looping in JavaScript."*

---

### Step 3: Transactional Enrollment with Concurrency Defense (2 minutes)
1. Open the **Course Offerings** section.
2. Click **Enroll Student** into an offering.
3. Explain the underlying stored procedure `sp_enroll_student`:
   > *"When a student registers, `sp_enroll_student` runs an atomic ACID transaction. It acquires an exclusive pessimistic lock `SELECT ... FOR UPDATE` on `course_offerings` to prevent race conditions during peak registration. It verifies prerequisite fulfillment, checks the student's timetable for time collisions, and commits or rolls back atomically."*

---

### Step 4: Database Triggers in Action (Negative Testing Proof) (2 minutes)
1. Switch Persona to **Faculty (Dr. Edgar Codd)** using the top-bar persona switcher.
2. Go to **Assessment Marks** for **CS301 (Database Management Systems)**.
3. Attempt an illegal update: Enter **150 marks** for a component with max 100 marks, or **-10 marks**.
4. Click **Save Marks**.
5. Show the examiner the live database rejection:
   > *"Integrity Error: marks_obtained exceeds the maximum permissible marks for this component."*
6. Key Viva Defense:
   > *"This validation was NOT performed by frontend JavaScript or Express middleware. It was rejected directly by the MySQL engine trigger `trg_validate_marks_insert`, which raised SQLSTATE '45000'. Even direct SQL injection or direct workbench access cannot bypass our business rules."*
7. Now enter a valid mark update (e.g. 92.00) and show how `trg_audit_marks_change` immediately created a forensic entry in `audit_logs` capturing the old mark, new mark, faculty ID, and timestamp.

---

### Step 5: Procedural SGPA/CGPA Calculation (2 minutes)
1. In the Faculty or Admin portal, click **Compute Official Results (sp_calculate_sgpa)**.
2. Show the calculation:
   - Multiplies each course credit by the 10-point grade scale point.
   - Computes weighted average:
     $$\text{SGPA} = \frac{\sum (C_i \times G_i)}{\sum C_i}$$
   - Commits an official immutable snapshot to `semester_results`.
3. Switch Persona to **Student (Aarav Patel)**:
   - Go to **My Transcripts**.
   - Show the official CGPA, SGPA, and Dean's List standing badge.

---

### Step 6: ACID Transactional Fee Payment & Automatic Trigger Settlement (2 minutes)
1. In the Student Portal, go to **Fees & Financials**.
2. View invoice `INV-2026-03-0002` (Balance: ₹40,000.00).
3. Click **Pay Fees**. Select payment mode `UPI` and enter ₹40,000.00.
4. Click **Complete Transaction**:
   - `sp_process_fee_payment` executes under `START TRANSACTION`.
   - Acquires row lock `FOR UPDATE` on `fee_invoices`.
   - Inserts payment ledger record.
   - Trigger `trg_update_invoice_on_payment` fires, recalculating `paid_amount` and `balance_amount`.
   - Status updates automatically to `'PAID'`.
   - A unique receipt code `REC-2026-...` is generated and returned.

---

### Step 7: Timetable Collision Detection (1 minute)
1. Switch back to **Admin**.
2. Go to **Timetable Management**.
3. Attempt to schedule a new class in **CR-101** on **MONDAY at 09:30 AM** (which overlaps with CS301 from 09:00 to 10:00).
4. Show the examiner the error dialog:
   > *"Classroom Collision: Room is already booked for another course offering during this time interval."*
5. Highlight that trigger `trg_check_room_collision_insert` protects physical infrastructure integrity.

---

### Step 8: EXPLAIN ANALYZE Performance Benchmarking (1 minute)
1. In the **DBMS Intelligence Lab**, open the **Execution Plan (EXPLAIN ANALYZE)** tool.
2. Run the attendance record lookup query.
3. Show the examiner:
   - Tree execution plan.
   - Cost metrics and index scan (`idx_ar_student_status`).
   - Latency in fractions of a millisecond.

