// UniSphere Academic ERP - Complete Showcase Dataset
// Provides realistic institutional data when running on Vercel without a live MySQL instance

import { UserSession } from './api';

export const FALLBACK_USERS: Record<string, UserSession> = {
  admin: {
    userId: 1,
    username: 'admin',
    role: 'ADMIN',
    email: 'registrar@unisphere.edu',
    displayName: 'Dr. Rajesh Sharma',
    rollOrCode: 'ADM-001',
    studentId: null,
    facultyId: null
  },
  dr_edgar: {
    userId: 4,
    username: 'dr_edgar',
    role: 'FACULTY',
    email: 'e.codd@unisphere.edu',
    displayName: 'Dr. Edgar Codd',
    rollOrCode: 'FAC-001',
    studentId: null,
    facultyId: 1
  },
  student_aarav: {
    userId: 6,
    username: 'student_aarav',
    role: 'STUDENT',
    email: 'aarav.patel@unisphere.edu',
    displayName: 'Aarav Patel',
    rollOrCode: '2024CSE001',
    studentId: 1,
    facultyId: null
  },
  student_rohan: {
    userId: 8,
    username: 'student_rohan',
    role: 'STUDENT',
    email: 'rohan.mehta@unisphere.edu',
    displayName: 'Rohan Mehta',
    rollOrCode: '2024CSE003',
    studentId: 3,
    facultyId: null
  }
};

export const FALLBACK_KPI = {
  totalStudents: 1420,
  totalFaculty: 96,
  activeOfferings: 38,
  collectionEfficiencyPct: 94.2,
  totalCollected: 7600000,
  totalBilled: 8068000,
  averageAttendance: 88.5
};

export const FALLBACK_DEPARTMENT_STATS = [
  { department_id: 1, department_code: 'CSE', department_name: 'Computer Science & Engineering', total_programs: 4, total_faculty: 32, total_students: 520, budget: 45000000 },
  { department_id: 2, department_code: 'ECE', department_name: 'Electronics & Communication', total_programs: 3, total_faculty: 24, total_students: 380, budget: 38000000 },
  { department_id: 3, department_code: 'MECH', department_name: 'Mechanical Engineering', total_programs: 2, total_faculty: 20, total_students: 290, budget: 32000000 },
  { department_id: 4, department_code: 'CIVIL', department_name: 'Civil Engineering', total_programs: 2, total_faculty: 18, total_students: 230, budget: 28000000 }
];

export const FALLBACK_GRADE_DISTRIBUTION = [
  { grade_letter: 'O', description: 'Outstanding (90-100%)', grade_point: '10.0', awarded_count: 42 },
  { grade_letter: 'A+', description: 'Excellent (80-89%)', grade_point: '9.0', awarded_count: 86 },
  { grade_letter: 'A', description: 'Very Good (70-79%)', grade_point: '8.0', awarded_count: 124 },
  { grade_letter: 'B+', description: 'Good (60-69%)', grade_point: '7.0', awarded_count: 78 },
  { grade_letter: 'B', description: 'Above Average (55-59%)', grade_point: '6.0', awarded_count: 35 },
  { grade_letter: 'F', description: 'Fail (< 40%)', grade_point: '0.0', awarded_count: 12 }
];

export const FALLBACK_AUDIT_LOGS = [
  { log_id: 104, action_type: 'UPDATE', table_name: 'student_marks', record_id: 42, performed_by: 'dr_edgar', performed_at: '2026-11-12T14:20:00Z', details: 'Updated End-Sem score for CS301' },
  { log_id: 103, action_type: 'INSERT', table_name: 'payments', record_id: 88, performed_by: 'student_aarav', performed_at: '2026-11-12T11:45:00Z', details: 'Fee settlement RCP-2026-001' },
  { log_id: 102, action_type: 'INSERT', table_name: 'attendance_sessions', record_id: 12, performed_by: 'dr_edgar', performed_at: '2026-11-12T09:30:00Z', details: 'Session conducted for CS301 Sec A' }
];

export const FALLBACK_STUDENTS = [
  { student_id: 1, university_roll_no: '2024CSE001', first_name: 'Aarav', last_name: 'Patel', full_name: 'Aarav Patel', program_name: 'B.Tech Computer Science & Engineering', program_code: 'BTECH_CSE', department_name: 'Computer Science & Engineering', current_semester: 5, cgpa: '9.25', academic_standing: 'DEANS_LIST', email: 'aarav.patel@unisphere.edu' },
  { student_id: 2, university_roll_no: '2024CSE002', first_name: 'Ananya', last_name: 'Iyer', full_name: 'Ananya Iyer', program_name: 'B.Tech Computer Science & Engineering', program_code: 'BTECH_CSE', department_name: 'Computer Science & Engineering', current_semester: 5, cgpa: '8.80', academic_standing: 'GOOD_STANDING', email: 'ananya.iyer@unisphere.edu' },
  { student_id: 3, university_roll_no: '2024CSE003', first_name: 'Rohan', last_name: 'Mehta', full_name: 'Rohan Mehta', program_name: 'B.Tech Computer Science & Engineering', program_code: 'BTECH_CSE', department_name: 'Computer Science & Engineering', current_semester: 5, cgpa: '6.40', academic_standing: 'ACADEMIC_PROBATION', email: 'rohan.mehta@unisphere.edu' },
  { student_id: 4, university_roll_no: '2024ECE001', first_name: 'Priya', last_name: 'Sharma', full_name: 'Priya Sharma', program_name: 'B.Tech Electronics & Communication', program_code: 'BTECH_ECE', department_name: 'Electronics & Communication', current_semester: 5, cgpa: '9.10', academic_standing: 'DEANS_LIST', email: 'priya.sharma@unisphere.edu' },
  { student_id: 5, university_roll_no: '2025BCA001', first_name: 'Kabir', last_name: 'Das', full_name: 'Kabir Das', program_name: 'Bachelor of Computer Applications', program_code: 'BCA', department_name: 'Computer Science & Engineering', current_semester: 3, cgpa: '7.95', academic_standing: 'GOOD_STANDING', email: 'kabir.das@unisphere.edu' }
];

export const FALLBACK_STUDENT_DETAILS: Record<number, any> = {
  1: {
    profile: FALLBACK_STUDENTS[0],
    enrollments: [
      { enrollment_id: 1, course_code: 'CS301', title: 'Database Management Systems', credits: 4, instructor_name: 'Dr. Edgar Codd', status: 'COMPLETED', grade_point: '10.00' },
      { enrollment_id: 2, course_code: 'CS302', title: 'Operating Systems Principles', credits: 4, instructor_name: 'Dr. Alan Turing', status: 'COMPLETED', grade_point: '9.00' },
      { enrollment_id: 3, course_code: 'CS303', title: 'Computer Networks Architecture', credits: 4, instructor_name: 'Dr. Claude Shannon', status: 'ENROLLED', grade_point: null },
      { enrollment_id: 4, course_code: 'CS304', title: 'Theory of Computation', credits: 4, instructor_name: 'Dr. Ada Lovelace', status: 'ENROLLED', grade_point: null }
    ],
    attendance: [
      { course_code: 'CS301', total_sessions_conducted: 16, total_attended: 16, attendance_percentage: '100.0', examination_eligibility: 'ELIGIBLE' }
    ]
  },
  3: {
    profile: FALLBACK_STUDENTS[2],
    enrollments: [
      { enrollment_id: 5, course_code: 'CS301', title: 'Database Management Systems', credits: 4, instructor_name: 'Dr. Edgar Codd', status: 'ENROLLED', grade_point: null },
      { enrollment_id: 6, course_code: 'CS302', title: 'Operating Systems Principles', credits: 4, instructor_name: 'Dr. Alan Turing', status: 'ENROLLED', grade_point: null }
    ],
    attendance: [
      { course_code: 'CS301', total_sessions_conducted: 16, total_attended: 8, attendance_percentage: '50.0', examination_eligibility: 'DEFAULTER_SHORTAGE' }
    ]
  }
};

export const FALLBACK_FACULTY = [
  { faculty_id: 1, employee_code: 'FAC-001', first_name: 'Edgar', last_name: 'Codd', full_name: 'Dr. Edgar Codd', designation: 'Senior_Professor', department_name: 'Computer Science & Engineering', department_code: 'CSE', qualification: 'Ph.D. Relational Systems (Michigan)', joining_date: '2015-08-01', specialization: 'Relational Database Systems', email: 'e.codd@unisphere.edu', contact_number: '+91 9876543210' },
  { faculty_id: 2, employee_code: 'FAC-002', first_name: 'Alan', last_name: 'Turing', full_name: 'Dr. Alan Turing', designation: 'Professor', department_name: 'Computer Science & Engineering', department_code: 'CSE', qualification: 'Ph.D. Mathematical Logic (Cambridge)', joining_date: '2016-01-15', specialization: 'Theory of Computation & AI', email: 'a.turing@unisphere.edu', contact_number: '+91 9876543211' },
  { faculty_id: 3, employee_code: 'FAC-003', first_name: 'Ada', last_name: 'Lovelace', full_name: 'Dr. Ada Lovelace', designation: 'Associate_Professor', department_name: 'Computer Science & Engineering', department_code: 'CSE', qualification: 'Ph.D. Computational Mathematics (London)', joining_date: '2018-07-20', specialization: 'Algorithm Design & Architecture', email: 'a.lovelace@unisphere.edu', contact_number: '+91 9876543212' }
];

export const FALLBACK_FACULTY_WORKLOAD = [
  { faculty_id: 1, employee_code: 'FAC-001', faculty_name: 'Dr. Edgar Codd', full_name: 'Dr. Edgar Codd', department_code: 'CSE', department_name: 'Computer Science & Engineering', designation: 'Senior_Professor', active_offerings_count: 1, total_weekly_contact_hours: 6, total_students_mentored: 4 },
  { faculty_id: 2, employee_code: 'FAC-002', faculty_name: 'Dr. Alan Turing', full_name: 'Dr. Alan Turing', department_code: 'CSE', department_name: 'Computer Science & Engineering', designation: 'Professor', active_offerings_count: 2, total_weekly_contact_hours: 8, total_students_mentored: 5 }
];

export const FALLBACK_FACULTY_OFFERINGS = [
  { offering_id: 1, course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', credits: 4, building: 'Alan Turing Block', room_number: 'CR-101', current_enrolled: 4, max_capacity: 60, available_seats: 56, instructor_name: 'Dr. Edgar Codd' },
  { offering_id: 2, course_code: 'CS302', course_title: 'Operating Systems Principles', section: 'A', credits: 4, building: 'Alan Turing Block', room_number: 'CR-102', current_enrolled: 4, max_capacity: 60, available_seats: 56, instructor_name: 'Dr. Alan Turing' }
];

export const FALLBACK_COURSES = [
  { course_id: 1, course_code: 'CS101', title: 'Introduction to Computing & C Programming', credits: 4, lecture_hours: 3, tutorial_hours: 0, practical_hours: 2, department_name: 'Computer Science & Engineering', prerequisites: [] },
  { course_id: 2, course_code: 'CS201', title: 'Data Structures & Algorithms', credits: 4, lecture_hours: 3, tutorial_hours: 1, practical_hours: 2, department_name: 'Computer Science & Engineering', prerequisites: ['CS101'] },
  { course_id: 3, course_code: 'CS301', title: 'Database Management Systems', credits: 4, lecture_hours: 3, tutorial_hours: 1, practical_hours: 2, department_name: 'Computer Science & Engineering', prerequisites: ['CS201'] },
  { course_id: 4, course_code: 'CS302', title: 'Operating Systems Principles', credits: 4, lecture_hours: 3, tutorial_hours: 0, practical_hours: 2, department_name: 'Computer Science & Engineering', prerequisites: ['CS201'] },
  { course_id: 5, course_code: 'CS401', title: 'Distributed Systems & Cloud Computing', credits: 4, lecture_hours: 3, tutorial_hours: 1, practical_hours: 0, department_name: 'Computer Science & Engineering', prerequisites: ['CS301', 'CS302'] }
];

export const FALLBACK_ATTENDANCE_SUMMARY = [
  { student_id: 1, university_roll_no: '2024CSE001', student_name: 'Aarav Patel', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', total_sessions_conducted: 16, total_attended: 16, attendance_percentage: '100.0', examination_eligibility: 'ELIGIBLE' },
  { student_id: 2, university_roll_no: '2024CSE002', student_name: 'Ananya Iyer', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', total_sessions_conducted: 16, total_attended: 14, attendance_percentage: '87.5', examination_eligibility: 'ELIGIBLE' },
  { student_id: 3, university_roll_no: '2024CSE003', student_name: 'Rohan Mehta', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', total_sessions_conducted: 16, total_attended: 8, attendance_percentage: '50.0', examination_eligibility: 'DEFAULTER_SHORTAGE' },
  { student_id: 4, university_roll_no: '2024ECE001', student_name: 'Priya Sharma', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', total_sessions_conducted: 16, total_attended: 15, attendance_percentage: '93.75', examination_eligibility: 'ELIGIBLE' }
];

export const FALLBACK_INVOICES = [
  { invoice_id: 1, invoice_number: 'INV-2026-001', student_id: 1, student_name: 'Aarav Patel', university_roll_no: '2024CSE001', semester_code: '2026-ODD', gross_amount: '85000.00', scholarship_deduction: '25000.00', net_payable: '60000.00', balance_amount: '0.00', status: 'PAID', due_date: '2026-08-30' },
  { invoice_id: 2, invoice_number: 'INV-2026-002', student_id: 2, student_name: 'Ananya Iyer', university_roll_no: '2024CSE002', semester_code: '2026-ODD', gross_amount: '85000.00', scholarship_deduction: '0.00', net_payable: '85000.00', balance_amount: '0.00', status: 'PAID', due_date: '2026-08-30' },
  { invoice_id: 3, invoice_number: 'INV-2026-003', student_id: 3, student_name: 'Rohan Mehta', university_roll_no: '2024CSE003', semester_code: '2026-ODD', gross_amount: '80000.00', scholarship_deduction: '0.00', net_payable: '80000.00', balance_amount: '80000.00', status: 'PENDING', due_date: '2026-08-30' }
];

export const FALLBACK_DEFAULTERS = [
  { university_roll_no: '2024CSE003', student_name: 'Rohan Mehta', program_name: 'B.Tech Computer Science & Engineering', balance_amount: '80000.00', days_overdue: 45, guardian_contact: '+91 9988776603' }
];

export const FALLBACK_PAYMENTS = [
  { payment_id: 1, receipt_number: 'RCP-2026-001', invoice_number: 'INV-2026-001', student_name: 'Aarav Patel', amount_paid: '60000.00', payment_mode: 'NET_BANKING', transaction_reference: 'HDFC-TXN-998811', payment_date: '2026-08-15' },
  { payment_id: 2, receipt_number: 'RCP-2026-002', invoice_number: 'INV-2026-002', student_name: 'Ananya Iyer', amount_paid: '85000.00', payment_mode: 'UPI', transaction_reference: 'UPI-TXN-445522', payment_date: '2026-08-18' }
];

export const FALLBACK_CLASSROOMS = [
  { classroom_id: 1, building: 'Alan Turing Block', room_number: 'CR-101', capacity: 60, room_type: 'SMART_CLASSROOM' },
  { classroom_id: 2, building: 'Alan Turing Block', room_number: 'CR-102', capacity: 60, room_type: 'SMART_CLASSROOM' },
  { classroom_id: 3, building: 'Claude Shannon Wing', room_number: 'LAB-204', capacity: 40, room_type: 'COMPUTING_LAB' }
];

export const FALLBACK_TIMETABLE = [
  { slot_id: 1, day_of_week: 'MONDAY', start_time: '09:00:00', end_time: '10:30:00', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', instructor_name: 'Dr. Edgar Codd', building: 'Alan Turing Block', room_number: 'CR-101', room_type: 'SMART_CLASSROOM' },
  { slot_id: 2, day_of_week: 'WEDNESDAY', start_time: '09:00:00', end_time: '10:30:00', course_code: 'CS301', course_title: 'Database Management Systems', section: 'A', instructor_name: 'Dr. Edgar Codd', building: 'Alan Turing Block', room_number: 'CR-101', room_type: 'SMART_CLASSROOM' },
  { slot_id: 3, day_of_week: 'FRIDAY', start_time: '14:00:00', end_time: '16:00:00', course_code: 'CS301', course_title: 'Database Management Systems (Lab)', section: 'A', instructor_name: 'Dr. Edgar Codd', building: 'Claude Shannon Wing', room_number: 'LAB-204', room_type: 'COMPUTING_LAB' }
];

export const FALLBACK_EXAMS_COMPONENTS = [
  { component_id: 1, component_name: 'Mid-Semester Examination', weightage_percentage: 30, max_marks: 50 },
  { component_id: 2, component_name: 'Continuous Lab Practical & Viva', weightage_percentage: 20, max_marks: 25 },
  { component_id: 3, component_name: 'End-Semester Final Examination', weightage_percentage: 50, max_marks: 100 }
];

export const FALLBACK_EXAMS_MARKS = [
  { student_id: 1, university_roll_no: '2024CSE001', student_name: 'Aarav Patel', component_name: 'Mid-Semester Examination', weightage_percentage: 30, marks_obtained: 48, max_marks: 50 },
  { student_id: 1, university_roll_no: '2024CSE001', student_name: 'Aarav Patel', component_name: 'Continuous Lab Practical & Viva', weightage_percentage: 20, marks_obtained: 25, max_marks: 25 },
  { student_id: 3, university_roll_no: '2024CSE003', student_name: 'Rohan Mehta', component_name: 'Mid-Semester Examination', weightage_percentage: 30, marks_obtained: 28, max_marks: 50 }
];

export const FALLBACK_TRANSCRIPTS: Record<number, any> = {
  1: {
    student: {
      student_id: 1,
      university_roll_no: '2024CSE001',
      full_name: 'Aarav Patel',
      program_name: 'B.Tech Computer Science & Engineering',
      current_semester: 5,
      cgpa: '9.25',
      academic_standing: 'DEANS_LIST'
    },
    results: [
      { semester_number: 1, academic_year: '2024-2025', sgpa: '9.10', total_credits_registered: 20, total_credits_earned: 20, academic_standing: 'DEANS_LIST' },
      { semester_number: 2, academic_year: '2024-2025', sgpa: '9.35', total_credits_registered: 22, total_credits_earned: 22, academic_standing: 'DEANS_LIST' },
      { semester_number: 3, academic_year: '2025-2026', sgpa: '9.20', total_credits_registered: 20, total_credits_earned: 20, academic_standing: 'DEANS_LIST' },
      { semester_number: 4, academic_year: '2025-2026', sgpa: '9.30', total_credits_registered: 22, total_credits_earned: 22, academic_standing: 'DEANS_LIST' }
    ]
  },
  3: {
    student: {
      student_id: 3,
      university_roll_no: '2024CSE003',
      full_name: 'Rohan Mehta',
      program_name: 'B.Tech Computer Science & Engineering',
      current_semester: 5,
      cgpa: '6.40',
      academic_standing: 'ACADEMIC_PROBATION'
    },
    results: [
      { semester_number: 1, academic_year: '2024-2025', sgpa: '6.20', total_credits_registered: 20, total_credits_earned: 16, academic_standing: 'GOOD_STANDING' },
      { semester_number: 2, academic_year: '2024-2025', sgpa: '6.50', total_credits_registered: 22, total_credits_earned: 22, academic_standing: 'GOOD_STANDING' }
    ]
  }
};

export const FALLBACK_CTE_DATA = {
  concept: 'Recursive Common Table Expression (CTE) Graph Traversal',
  sql: `WITH RECURSIVE PrerequisiteChain AS (
    SELECT cp.course_id, cp.prerequisite_course_id, 1 AS dependency_depth
    FROM course_prerequisites cp
    WHERE cp.course_id = 5

    UNION ALL

    SELECT cp_parent.course_id, cp_parent.prerequisite_course_id, pc.dependency_depth + 1
    FROM course_prerequisites cp_parent
    JOIN PrerequisiteChain pc ON cp_parent.course_id = pc.prerequisite_course_id
)
SELECT pc.dependency_depth, target_c.course_code AS target_course,
       prereq_c.course_code AS required_prerequisite, prereq_c.title AS prerequisite_title,
       prereq_c.credits, COALESCE(e.final_grade, 'NOT_ATTEMPTED') AS student_grade,
       CASE WHEN e.final_grade IS NOT NULL AND e.final_grade NOT IN ('F', 'I') THEN 'CLEARED'
            ELSE 'PENDING_PREREQUISITE' END AS eligibility_state
FROM PrerequisiteChain pc
JOIN courses target_c ON pc.course_id = target_c.course_id
JOIN courses prereq_c ON pc.prerequisite_course_id = prereq_c.course_id
LEFT JOIN enrollments e ON e.student_id = 1 AND e.course_id = pc.prerequisite_course_id
ORDER BY pc.dependency_depth DESC;`,
  executionMs: '8.45',
  rowCount: 4,
  data: [
    { dependency_depth: 3, target_course: 'CS201', required_prerequisite: 'CS101', prerequisite_title: 'Introduction to Computing & C Programming', credits: 4, student_grade: 'A+', eligibility_state: 'CLEARED' },
    { dependency_depth: 2, target_course: 'CS301', required_prerequisite: 'CS201', prerequisite_title: 'Data Structures & Algorithms', credits: 4, student_grade: 'O', eligibility_state: 'CLEARED' },
    { dependency_depth: 1, target_course: 'CS401', required_prerequisite: 'CS301', prerequisite_title: 'Database Management Systems', credits: 4, student_grade: 'NOT_ATTEMPTED', eligibility_state: 'PENDING_PREREQUISITE' },
    { dependency_depth: 1, target_course: 'CS401', required_prerequisite: 'CS302', prerequisite_title: 'Operating Systems Principles', credits: 4, student_grade: 'NOT_ATTEMPTED', eligibility_state: 'PENDING_PREREQUISITE' }
  ]
};

export const FALLBACK_WINDOW_DATA = {
  concept: 'SQL Window Functions (DENSE_RANK & CUME_DIST)',
  sql: `SELECT s.university_roll_no, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
       d.department_code, sr.sgpa,
       DENSE_RANK() OVER (PARTITION BY s.department_id ORDER BY sr.sgpa DESC) AS department_rank,
       ROUND(CUME_DIST() OVER (PARTITION BY s.department_id ORDER BY sr.sgpa ASC) * 100, 2) AS percentile_standing
FROM semester_results sr
JOIN students s ON sr.student_id = s.student_id
JOIN departments d ON s.department_id = d.department_id
WHERE sr.semester_id = 1;`,
  executionMs: '6.12',
  rowCount: 5,
  data: [
    { university_roll_no: '2024CSE001', student_name: 'Aarav Patel', department_code: 'CSE', sgpa: '9.25', department_rank: 1, percentile_standing: '100.00' },
    { university_roll_no: '2024CSE002', student_name: 'Ananya Iyer', department_code: 'CSE', sgpa: '8.80', department_rank: 2, percentile_standing: '75.00' },
    { university_roll_no: '2024ECE001', student_name: 'Priya Sharma', department_code: 'ECE', sgpa: '9.10', department_rank: 1, percentile_standing: '100.00' },
    { university_roll_no: '2025BCA001', student_name: 'Kabir Das', department_code: 'CSE', sgpa: '7.95', department_rank: 3, percentile_standing: '50.00' },
    { university_roll_no: '2024CSE003', student_name: 'Rohan Mehta', department_code: 'CSE', sgpa: '6.40', department_rank: 4, percentile_standing: '25.00' }
  ]
};
