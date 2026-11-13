# UniSphere: University Management & Academic Intelligence System

<div align="center">

![MySQL 8.0](https://img.shields.io/badge/MySQL-8.0.46_Community-00758F?style=for-the-badge&logo=mysql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v20%2B_%7C_Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Database Architecture](https://img.shields.io/badge/Schema-3NF_%2F_BCNF_Normalized-2563EB?style=for-the-badge)
![ACID Compliant](https://img.shields.io/badge/Transactions-ACID_Serializability-emerald?style=for-the-badge)

<p align="center">
  <strong>A production-grade relational database management system (DBMS) orchestrating academic operations, curriculum knowledge graphs, timetable clash prevention, and continuous assessment algorithms directly inside the database engine.</strong>
</p>

[System Architecture](#-system-architecture) • [Database Design](#-database-design--specifications) • [Quick Start](#-quick-start--installation) • [Subsystem Modules](#-subsystems--modules) • [DBMS Intelligence Lab](#-dbms-intelligence-lab-viva-features) • [RBAC Personas](#-demo-personas--rbac)

</div>

---

## 📌 Executive Overview

Unlike superficial academic dashboards that rely on mock state or unstructured documents, **UniSphere** is engineered from the ground up on a normalized **3NF/BCNF relational model**. Academic integrity is governed directly by the **MySQL 8.0 InnoDB engine** using:
* **8 Database Engine Triggers** intercepting timetable room clashes, faculty double-booking, attendance duplication, and score boundary violations before transactions commit.
* **4 ACID Stored Procedures & 2 Scalar Functions** executing atomic fee payments with pessimistic row locks (`SELECT ... FOR UPDATE`) and weighted 10-point SGPA compilations.
* **5 Analytical Relational Views** calculating real-time attendance compliance against the statutory 75% exam threshold and flagging bursar defaulters.
* **Recursive Common Table Expressions (WITH RECURSIVE)** dynamically traversing multi-tier prerequisite trees.

---

## 🏛️ System Architecture

UniSphere is structured as a three-tier decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 Presentation Layer (Port 3000)              │
│       React 19 • TypeScript • Vite • Tailwind CSS • Framer  │
│  - Minimal institutional UI (pure white & royal blue)       │
│  - Dynamic role-tailored dashboards and side navigation     │
│  - DBMS Viva Laboratory & Live Interactive SQL Terminal     │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API (fetch / JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                 Application Layer (Port 5000)               │
│               Node.js 20+ • Express 5 REST API              │
│  - Stateless JWT authentication & Role-Based Access Control │
│  - mysql2/promise Connection Pool (Limit: 20 connections)   │
│  - Parameterized prepared statements (SQL injection immune) │
└──────────────────────────────┬──────────────────────────────┘
                               │  TCP (Port 3306)
┌──────────────────────────────▼──────────────────────────────┐
│                  Database Layer (MySQL 8.0)                 │
│         unisphere_db • InnoDB Engine • utf8mb4              │
│  - 24 Base Tables strictly normalized to 3NF & BCNF         │
│  - 8 Engine Triggers (Clash, Duplicate, Over-enrollment)    │
│  - 5 Relational Views & 4 Transactional Stored Procedures   │
│  - Composite B-Tree Indexes optimized for sub-millisecond   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Design & Specifications

### 24 Normalized Base Tables
The schema is partitioned into five functional clusters:

| Cluster | Tables | Relational Responsibility |
| :--- | :--- | :--- |
| **Curricular Catalog** | `departments`, `programs`, `courses`, `course_prerequisites`, `academic_semesters` | Governs degrees, credit structures, and self-referential prerequisite dependencies ($M:N$). |
| **Venue & Scheduling** | `classrooms`, `course_offerings`, `timetable_slots`, `enrollments` | Manages physical room capacities, section offerings, and trigger-protected weekly scheduling. |
| **Academic Registry** | `users`, `faculty`, `students`, `student_mentor_allocations` | Role-based authentication identities, employee records, and student academic standing profiles. |
| **Assessment & Attendance** | `attendance_sessions`, `attendance_records`, `assessment_components`, `student_marks`, `grade_scale` | Class session logs, per-student attendance states, component-weighted evaluations, and UGC grade scales. |
| **Bursar & Audit** | `fee_structures`, `fee_invoices`, `payments`, `scholarships`, `student_scholarships`, `semester_results`, `audit_logs` | Double-entry student billing, scholarship deductions, ACID payment settlements, and immutable DML audit trails. |

---

### Database Objects Breakdown

#### 5 Relational Views (`database/02_views.sql`)
1. **`vw_student_360_transcripts`:** Consolidates student GPA, registered credits, and academic standing.
2. **`vw_student_attendance_summary`:** Computes `(attended / conducted) * 100` and flags `DEFAULTER_SHORTAGE` if below 75%.
3. **`vw_faculty_teaching_workload`:** Monitors weekly Lecture, Tutorial, and Practical (L-T-P) contact hours.
4. **`vw_fee_defaulters`:** Identifies overdue invoices and ranks balances past due dates.
5. **`vw_classroom_utilization`:** Tracks physical room occupancy rates against weekly 40-hour capacity.

#### 8 Database Engine Triggers (`database/03_triggers.sql`)
* `trg_prevent_classroom_clash`: Rejects overlapping timeslots in the same classroom.
* `trg_prevent_faculty_clash`: Rejects simultaneous slot assignments for the same faculty member.
* `trg_prevent_duplicate_attendance`: Blocks duplicate attendance marking for a student on the same date/session.
* `trg_check_marks_range`: Enforces that `marks_obtained` cannot be negative or exceed `max_marks`.
* `trg_update_invoice_on_payment`: Automatically updates invoice balance and marks status as `'PAID'` upon payment insertion.
* `trg_audit_student_marks`: Writes an immutable forensic record to `audit_logs` whenever marks are updated.
* `trg_prevent_over_enrollment`: Rejects course registration when class capacity is full.
* `trg_update_offering_capacity_on_enroll`: Automatically increments `current_enrolled`.

#### 4 Stored Procedures & 2 Functions (`database/04_procedures.sql`)
* `sp_calculate_sgpa(student_id, semester_id)`: Calculates weighted UGC 10-point SGPA and updates `semester_results` in an atomic transaction.
* `sp_process_fee_payment(invoice_id, amount, mode, ref, OUT receipt)`: Processes fee payments using pessimistic row locking (`SELECT ... FOR UPDATE`) to prevent race conditions.
* `sp_generate_semester_invoices(...)`: Batch generates semester billing for entire student cohorts.
* `sp_enroll_student_in_offering(...)`: Atomically validates prerequisites, room capacity, and timetable overlaps before enrolling.
* `fn_get_attendance_percentage(student_id, offering_id)`: Scalar function returning attendance percentage.
* `fn_get_grade_point(marks_obtained, max_marks)`: Normalizes percentage scores to UGC 10-point scale.

---

## 🚀 Quick Start & Installation

### Prerequisites
* **MySQL Community Server 8.0+** running locally on port `3306`.
* **Node.js v20+** and **npm** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/unisphere-dbms.git
cd unisphere-dbms
```

### 2. Configure Environment Variables
Copy the server environment template:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with your local MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=unisphere_db
JWT_SECRET=unisphere_super_secret_jwt_key_2026_dbms_cu
```

### 3. Initialize the Database
Run the one-click batch script (Windows):
```cmd
init_database.bat
```
*Or execute manually via MySQL CLI:*
```bash
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_views.sql
mysql -u root -p < database/03_triggers.sql
mysql -u root -p < database/04_procedures.sql
mysql -u root -p < database/05_seed_data.sql
```

### 4. Install Dependencies & Launch
Run the automated launcher:
```cmd
start.bat
```
*Or run services manually in two separate terminal windows:*
```bash
# Terminal 1: Backend API (Port 5000)
cd server
npm install
npm run dev

# Terminal 2: Frontend Client (Port 3000)
cd client
npm install
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Personas & RBAC

Switch between pre-configured roles using the quick role switcher in the navigation bar:

| Role | Username | Password | Institutional Scope |
| :--- | :--- | :--- | :--- |
| **Registrar (Admin)** | `admin` | `password123` | Master executive console, curriculum governance, department analytics, bursar bulk billing, and audit log inspection. |
| **Senior Professor (Faculty)** | `dr_edgar` | `password123` | Section console for CS301 (DBMS), weekly contact hours (L-T-P), daily attendance entry, and component grading. |
| **Dean's List Scholar** | `student_aarav` | `password123` | 5th Sem B.Tech CSE. 9.25 CGPA, 100% attendance, prerequisite validation, ₹0 outstanding balance. |
| **Academic Defaulter** | `student_rohan` | `password123` | Test boundary case: 50% attendance (< 75% exam bar), ₹80,000 overdue bursar invoice, one-click settlement button. |

---

## 🔬 DBMS Intelligence Lab (Viva Features)

The built-in **DBMS Intelligence Lab** provides interactive benchmarking tools designed for technical viva evaluation:

1. **Acyclic Prerequisite Graph Traversal (WITH RECURSIVE CTE):**
   * Dynamically resolves self-referential prerequisite dependencies to arbitrary depths (e.g. *CS401 Distributed Systems* &rarr; *CS301 DBMS* &rarr; *CS201 DSA* &rarr; *CS101 C Programming*). Displays depth levels, row counts, and engine execution latency in milliseconds.
2. **Window Functions Ranking (`DENSE_RANK`, `CUME_DIST`):**
   * Calculates departmental rankings and cumulative percentile distributions without altering table row counts:
     ```sql
     SELECT university_roll_no, sgpa,
            DENSE_RANK() OVER (PARTITION BY department_id ORDER BY sgpa DESC) AS dept_rank,
            ROUND(CUME_DIST() OVER (PARTITION BY department_id ORDER BY sgpa ASC) * 100, 2) AS percentile
     FROM semester_results;
     ```
3. **Execution Plan Inspector (`EXPLAIN ANALYZE`):**
   * Inspects B-Tree index lookups (`idx_ar_student_status`) vs. full-table scans to demonstrate database optimization techniques.
4. **Live Interactive SQL Terminal:**
   * Allows evaluators to type and execute arbitrary SQL queries against `unisphere_db` in real time with formatted results.

---

## 📁 Repository Structure

```
.
├── database/
│   ├── 01_schema.sql           # 24 normalized base tables (3NF/BCNF)
│   ├── 02_views.sql            # 5 relational views
│   ├── 03_triggers.sql         # 8 database engine triggers
│   ├── 04_procedures.sql       # 4 stored procedures + 2 scalar functions
│   ├── 05_seed_data.sql        # Realistic university records
│   └── 06_advanced_queries.sql # Recursive CTE, Window Functions & EXPLAIN queries
│
├── server/                     # Node.js Express 5 REST API (Port 5000)
│   ├── src/
│   │   ├── config/db.js        # mysql2/promise connection pool
│   │   ├── middleware/auth.js  # JWT authentication & RBAC middleware
│   │   ├── routes/             # Modular REST controllers
│   │   └── index.js            # Express application entry point
│   ├── .env.example            # Environment configuration template
│   └── package.json
│
├── client/                     # React 19 + TypeScript Frontend (Port 3000)
│   ├── public/favicon.svg      # UniSphere academic graduation cap icon
│   ├── src/
│   │   ├── components/         # Clean Navbar & role-tailored Sidebar
│   │   ├── views/              # 8 Subsystem modules + DBMS Lab + Landing Page
│   │   ├── api.ts              # Typed API client with JWT support
│   │   └── App.tsx             # Root state management & Framer transitions
│   ├── index.html              # University title & metadata
│   └── package.json
│
├── init_database.bat           # Automated database initialization script
├── start.bat                   # Automated application launcher script
├── .gitignore                  # Git exclusions (credentials, node_modules, dist)
└── README.md                   # Project documentation
```

---

## 🛡️ License

This project was developed as an end-semester Capstone Project for Database Management Systems (DBMS). Distributed under the MIT License.
