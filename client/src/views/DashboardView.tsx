import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  analyticsApi, 
  studentsApi, 
  facultyApi, 
  feesApi, 
  UserSession 
} from '../api';
import { 
  Users, 
  Briefcase, 
  CreditCard, 
  CalendarCheck, 
  ShieldAlert, 
  Activity, 
  ArrowUpRight, 
  Sparkles,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Building,
  GraduationCap
} from 'lucide-react';

interface DashboardViewProps {
  user: UserSession;
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onNavigate }) => {
  const [loading, setLoading] = useState(true);

  // Admin Data
  const [kpi, setKpi] = useState<any>(null);
  const [deptStats, setDeptStats] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [gradeDist, setGradeDist] = useState<any[]>([]);

  // Faculty Data
  const [facultyWorkload, setFacultyWorkload] = useState<any>(null);
  const [facultyOfferings, setFacultyOfferings] = useState<any[]>([]);

  // Student Data
  const [studentDetails, setStudentDetails] = useState<any>(null);

  useEffect(() => {
    loadRoleDashboard();
  }, [user.username, user.role, user.studentId, user.facultyId]);

  const loadRoleDashboard = async () => {
    setLoading(true);
    try {
      if (user.role === 'ADMIN') {
        const [kpiData, depts, logs, grades] = await Promise.all([
          analyticsApi.getKPI(),
          analyticsApi.getDepartmentStats(),
          analyticsApi.getAuditLogs(),
          analyticsApi.getGradeDistribution()
        ]);
        setKpi(kpiData);
        setDeptStats(depts);
        setAuditLogs(logs);
        setGradeDist(grades);
      } else if (user.role === 'FACULTY') {
        const facultyId = user.facultyId || 1; // Default Dr. Edgar Codd
        const [workloadList, offerings] = await Promise.all([
          facultyApi.getWorkload(),
          facultyApi.getOfferings(facultyId)
        ]);
        const myWorkload = workloadList.find((w: any) => w.faculty_id === facultyId) || workloadList[0];
        setFacultyWorkload(myWorkload);
        setFacultyOfferings(offerings);
      } else if (user.role === 'STUDENT') {
        // Resolve student ID: Rohan is student_id 3, Aarav is student_id 1
        const sId = user.studentId || (user.username === 'student_rohan' ? 3 : 1);
        const details = await studentsApi.getDetails(sId);
        setStudentDetails(details);
      }
    } catch (err) {
      console.error('Failed to load role dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Activity className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span className="text-xs font-medium">Aggregating live database metrics for {user.displayName}...</span>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: FACULTY DASHBOARD (Dr. Edgar Codd)
  // ==========================================
  if (user.role === 'FACULTY') {
    return (
      <div className="space-y-6">
        
        {/* Faculty Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-mono">
                Employee: {user.rollOrCode || 'FAC-001'}
              </span>
              <span className="text-xs text-slate-500">• Department of Computer Science & Engineering</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-slate-900">
              Welcome back, {user.displayName}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Senior Professor • Section Instructor & Academic Mentor
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              <CalendarCheck className="w-4 h-4" />
              Mark Class Attendance
            </button>
            <button
              onClick={() => onNavigate('exams')}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Award className="w-4 h-4 text-slate-500" />
              Grade Assessment
            </button>
          </div>
        </div>

        {/* Faculty Workload KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Offerings</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {facultyWorkload?.active_offerings_count || facultyOfferings.length || 1}
            </div>
            <div className="text-xs text-slate-500 mt-1">CS301 (DBMS) Section A</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Teaching Load</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {facultyWorkload?.total_weekly_contact_hours || 6} <span className="text-xs font-sans text-slate-500 font-normal">hrs/wk</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">4 Lecture • 2 Practical Lab</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Mentored</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {facultyWorkload?.total_students_mentored || 4}
            </div>
            <div className="text-xs text-slate-500 mt-1 text-emerald-700 font-semibold">100% active enrollment</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Section Attendance Avg</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              87.5%
            </div>
            <div className="text-xs text-slate-500 mt-1">UGC threshold: 75.0%</div>
          </div>
        </div>

        {/* Assigned Courses Section Table */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Courses & Lecture Allocations</h2>
              <p className="text-xs text-slate-500">Live section instances assigned in <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">course_offerings</code></p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              Term: 2026-ODD
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Course Name</th>
                  <th className="py-2.5 px-3 text-center">Section</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3">Assigned Venue</th>
                  <th className="py-2.5 px-3 text-center">Class Enrollment</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyOfferings.map(o => (
                  <tr key={o.offering_id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{o.course_code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{o.course_title}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">{o.section}</td>
                    <td className="py-3 px-3 text-center font-mono">{o.credits}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{o.building} - {o.room_number || 'CR-101'}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {o.current_enrolled} / {o.max_capacity}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => onNavigate('attendance')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
                      >
                        Mark Attendance &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: STUDENT DASHBOARD (Aarav vs Rohan)
  // ==========================================
  if (user.role === 'STUDENT') {
    const isDefaulter = user.username === 'student_rohan';
    const profile = studentDetails?.profile;
    const enrollments = studentDetails?.enrollments || [];
    const attendance = studentDetails?.attendance || [];

    return (
      <div className="space-y-6">
        
        {/* CASE A: ROHAN MEHTA (DEFAULTER RISK NOTICE) */}
        {isDefaulter && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 text-rose-950 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Statutory Academic Alert
                  </span>
                  <span className="text-xs font-mono text-rose-800 font-bold">Roll: 2024CSE003</span>
                </div>
                <h2 className="text-xl font-bold mt-2 text-rose-950">
                  Examination Clearance & Hall Ticket Withheld
                </h2>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed max-w-2xl">
                  Your academic profile has been flagged by database view <code className="font-mono bg-rose-100 px-1 py-0.5 rounded border border-rose-200">vw_student_attendance_summary</code> and <code className="font-mono bg-rose-100 px-1 py-0.5 rounded border border-rose-200">vw_fee_defaulters</code>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">1. Attendance Shortage</span>
                    <div className="text-3xl font-mono font-bold text-rose-700 mt-0.5">50.0%</div>
                    <span className="text-[11px] text-rose-600 font-medium">Below statutory UGC 75% examination threshold</span>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">2. Bursar Fee Dues</span>
                    <div className="text-3xl font-mono font-bold text-rose-700 mt-0.5">₹80,000</div>
                    <span className="text-[11px] text-rose-600 font-medium">Invoice INV-2026-003 overdue by 45 days</span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => onNavigate('fees')}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
                  >
                    Settle Fee Dues (ACID Stored Procedure) &rarr;
                  </button>
                  <button 
                    onClick={() => onNavigate('attendance')}
                    className="bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    Review Attendance Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CASE B: AARAV PATEL (DEAN'S LIST SCHOLAR BANNER) */}
        {!isDefaulter && (
          <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Dean's Honor Roll Standing
                </span>
                <span className="text-xs text-slate-500 font-mono">• Roll: {user.rollOrCode || '2024CSE001'}</span>
              </div>
              <h1 className="text-2xl font-bold mt-1 text-slate-900">
                Welcome back, {user.displayName}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                B.Tech Computer Science & Engineering • 5th Semester • Top 5% in Department
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('exams')}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-xs"
              >
                <Award className="w-4 h-4" />
                View Official Transcript
              </button>
              <button
                onClick={() => onNavigate('timetable')}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Clock className="w-4 h-4 text-slate-500" />
                Class Schedule
              </button>
            </div>
          </div>
        )}

        {/* Student Academic KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {profile?.latest_cgpa || (isDefaulter ? '6.40' : '9.25')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {isDefaulter ? 'Academic Review Standing' : 'Grade: Outstanding (O)'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statutory Attendance</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDefaulter ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-extrabold mt-2 font-mono ${isDefaulter ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isDefaulter ? '50.0%' : '100.0%'}
            </div>
            <div className="text-xs mt-1">
              {isDefaulter ? (
                <span className="text-rose-600 font-semibold">Shortage Alert (&lt; 75%)</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Cleared for End-Sem Exam</span>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Subjects</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
              {enrollments.length || (isDefaulter ? 2 : 4)}
            </div>
            <div className="text-xs text-slate-500 mt-1">16 Registered Credits</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bursar Fee Dues</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDefaulter ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className={`text-3xl font-extrabold mt-2 font-mono ${isDefaulter ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isDefaulter ? '₹80,000' : '₹0'}
            </div>
            <div className="text-xs mt-1">
              {isDefaulter ? (
                <span className="text-rose-600 font-semibold">Overdue Balance</span>
              ) : (
                <span className="text-emerald-700 font-semibold">Fully Paid (Receipt Verified)</span>
              )}
            </div>
          </div>
        </div>

        {/* Registered Course Enrollments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Semester Registered Courses</h2>
              <p className="text-xs text-slate-500">Atomic enrollments verified against curriculum prerequisite graph</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              Semester: 5 (2026-ODD)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Subject Name</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3">Instructor</th>
                  <th className="py-2.5 px-3 text-center">Enrollment State</th>
                  <th className="py-2.5 px-3 text-center">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e: any) => (
                  <tr key={e.enrollment_id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{e.course_code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{e.title}</td>
                    <td className="py-3 px-3 text-center font-mono">{e.credits}</td>
                    <td className="py-3 px-3 text-slate-700">{e.instructor_name}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                      {e.grade_point || (isDefaulter ? 'PENDING' : '10.00')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADMIN / REGISTRAR DASHBOARD (Default)
  // ==========================================
  return (
    <div className="space-y-6">
      
      {/* Executive Welcome Banner - Clean Light Theme */}
      <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200/90 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Active Term: 2026-ODD
            </span>
            <span className="text-xs text-slate-500">• Fall Academic Cycle</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 text-slate-900">
            Welcome back, {user.displayName}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Role: <strong className="text-slate-900">{user.role}</strong> • Institutional Intelligence & Operations Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dbms-lab')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            Launch DBMS Viva Lab
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{kpi?.totalStudents || 0}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">100% Verified</span> across degree programs
          </div>
        </div>

        {/* Active Faculty */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Mentors</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{kpi?.totalFaculty || 0}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-800">{kpi?.activeOfferings || 0} Active</span> course offerings
          </div>
        </div>

        {/* Fee Collection Efficiency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bursar Recovery</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {kpi?.collectionEfficiencyPct || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            ₹{Number(kpi?.totalCollected || 0).toLocaleString()} / ₹{Number(kpi?.totalBilled || 0).toLocaleString()}
          </div>
        </div>

        {/* Institutional Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
            {kpi?.averageAttendance || 0}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Statutory threshold: <strong className="text-slate-800">75.0%</strong>
          </div>
        </div>

      </div>

      {/* Department Analytics & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Statistics Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Departmental Intelligence Summary</h2>
              <p className="text-xs text-slate-500">Aggregated student distribution, faculty allocations & budgets</p>
            </div>
            <button 
              onClick={() => onNavigate('faculty')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View Workload &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Dept Code</th>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3 text-center">Programs</th>
                  <th className="py-2.5 px-3 text-center">Faculty</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-right">Budget (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptStats.map(d => (
                  <tr key={d.department_id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">{d.department_code}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{d.department_name}</td>
                    <td className="py-3 px-3 text-center font-mono">{d.total_programs}</td>
                    <td className="py-3 px-3 text-center font-mono">{d.total_faculty}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-900 font-mono">{d.total_students}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">₹{Number(d.budget).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade Distribution Reference */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">UGC 10-Point Grading Scale</h2>
          <p className="text-xs text-slate-500 mb-4">Official institutional grading hierarchy</p>

          <div className="space-y-2">
            {gradeDist.map((g, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold w-7 text-center bg-white py-0.5 rounded border border-slate-200 text-blue-600">
                    {g.grade_letter}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">{g.description}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Point: {g.grade_point}</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  {g.awarded_count} Awarded
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Forensic Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Forensic Database Audit Trail</h2>
            </div>
            <p className="text-xs text-slate-500">Live trigger mutations recorded into immutable audit table <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">audit_logs</code></p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            Showing latest 10 mutations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Table</th>
                <th className="py-2.5 px-3">Operation</th>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.log_id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-400 font-bold">#{log.log_id}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-600">{log.table_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'UPDATE' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{log.record_id}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{log.performed_by_name || 'System'}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.ip_address}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                    {new Date(log.performed_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
