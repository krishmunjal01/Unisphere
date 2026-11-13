import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Database, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Briefcase, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  Clock, 
  GitBranch, 
  Activity, 
  CheckCircle2, 
  ChevronRight,
  Layers,
  FileCheck2,
  Server,
  Play,
  Terminal,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface LandingPageViewProps {
  onEnterPortal: (personaUsername?: string, targetTab?: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onEnterPortal }) => {
  const [selectedCluster, setSelectedCluster] = useState<'curricular' | 'operational' | 'academic' | 'fiscal'>('curricular');
  const [activePreviewTab, setActivePreviewTab] = useState<'query' | 'trigger' | 'dag'>('query');

  const schemaClusters = {
    curricular: {
      title: 'Curricular Catalog & Graph Cluster',
      description: 'Static curriculum governance decoupled from term-time instances to satisfy 3NF & BCNF.',
      tables: ['departments', 'programs', 'courses', 'course_prerequisites', 'academic_semesters'],
      highlight: 'Recursive self-referential M:N mapping eliminates curriculum cyclic loops and satisfies BCNF.'
    },
    operational: {
      title: 'Infrastructure & Scheduling Cluster',
      description: 'Physical venue allocations with trigger-enforced collision avoidance.',
      tables: ['classrooms', 'course_offerings', 'timetable_slots', 'enrollments'],
      highlight: 'Pessimistic row locks (SELECT ... FOR UPDATE) serialize concurrent elective course registrations.'
    },
    academic: {
      title: 'Attendance & Assessment Cluster',
      description: 'Continuous assessment marks ledgers and automated 75% attendance clearance.',
      tables: ['attendance_sessions', 'attendance_records', 'assessment_components', 'student_marks', 'grade_scale', 'semester_results'],
      highlight: 'Stored procedure sp_calculate_sgpa executes weighted UGC 10-point grade derivations and snapshot storage.'
    },
    fiscal: {
      title: 'Bursar & Forensic Audit Cluster',
      description: 'Double-entry billing, scholarship offsets, and immutable DML mutation logs.',
      tables: ['fee_structures', 'scholarships', 'student_scholarships', 'fee_invoices', 'payments', 'audit_logs'],
      highlight: 'Trigger trg_update_invoice_on_payment settles ledger balances automatically upon payment receipt.'
    }
  };

  const personas = [
    {
      username: 'admin',
      role: 'Office of the Registrar',
      name: 'Dr. Rajesh Sharma',
      badge: 'Institutional Governance',
      description: 'Master institutional console, curriculum oversight, batch semester fee generation, and audit trail investigation.',
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      username: 'dr_edgar',
      role: 'Senior Professor (CSE)',
      name: 'Dr. Edgar Codd',
      badge: 'Academic Instruction',
      description: 'Direct section management for CS301 (DBMS). Marks session attendance and evaluates marks protected by boundary triggers.',
      badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200'
    },
    {
      username: 'student_aarav',
      role: 'Undergraduate Scholar',
      name: 'Aarav Patel (2024CSE001)',
      badge: "Dean's List Standing",
      description: '5th Semester B.Tech CSE. 100% attendance, verified prerequisite clearance, official transcript with 9.0+ SGPA.',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      username: 'student_rohan',
      role: 'Academic Review Student',
      name: 'Rohan Mehta (2024CSE003)',
      badge: 'Defaulter Shortage Alert',
      description: 'Boundary test case: 50% attendance (< 75% exam threshold) and ₹80,000 outstanding bursar balance flagged by database views.',
      badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  ];

  const modules = [
    {
      id: '01',
      title: 'Student Lifecycle & Registry',
      icon: Users,
      desc: 'Surrogate-key identification, program semester mapping, and unified 360° academic transcripts.'
    },
    {
      id: '02',
      title: 'Faculty Workload Allocation',
      icon: Briefcase,
      desc: 'Weekly contact-hour monitoring across Lecture, Tutorial, and Practical (L-T-P) distribution.'
    },
    {
      id: '03',
      title: 'Curricular Dependency DAG',
      icon: GitBranch,
      desc: 'Prerequisite validation executed via Recursive Common Table Expressions (WITH RECURSIVE).'
    },
    {
      id: '04',
      title: 'Attendance Regulation & Rules',
      icon: CalendarCheck,
      desc: 'Daily session recording with automated 75% examination eligibility flags enforced via database views.'
    },
    {
      id: '05',
      title: 'Continuous Assessment & Grading',
      icon: Award,
      desc: 'Component-weighted evaluations, trigger boundary checks [0, max_marks], and procedural SGPA/CGPA generation.'
    },
    {
      id: '06',
      title: 'Bursar Double-Entry Ledgers',
      icon: CreditCard,
      desc: 'ACID transactional fee settlement with pessimistic row-locking and automatic receipt generation.'
    },
    {
      id: '07',
      title: 'Timetable Clash Prevention',
      icon: Clock,
      desc: 'Database engine triggers intercepting classroom and faculty schedule collisions during overlapping hours.'
    },
    {
      id: '08',
      title: 'Institutional Analytics & Audit',
      icon: Activity,
      desc: 'Real-time recovery metrics, department capacity ratios, and immutable forensic logs on academic changes.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Delicate Technical Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 1. MINIMAL ELEGANT HOMEPAGE NAVIGATION (Matching Reference Design) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Academic Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">UniSphere</span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono">
                3NF / BCNF
              </span>
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Overview
            </button>
            <button 
              onClick={() => {
                document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Role Portals
            </button>
            <button 
              onClick={() => {
                document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              8 Subsystems
            </button>
            <button 
              onClick={() => {
                document.getElementById('schema-explorer')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Schema Topology
            </button>
            <button 
              onClick={() => onEnterPortal('admin', 'dbms-lab')}
              className="px-3 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 transition flex items-center gap-1.5 font-bold"
            >
              <Terminal className="w-3.5 h-3.5" />
              DBMS Viva Lab
            </button>
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>MySQL 8.0 Live</span>
            </div>
            
            <button
              onClick={() => onEnterPortal('admin')}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              <span>Enter ERP Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. SPLIT HERO SECTION (White & Light Blue Elegance) */}
      <section className="pt-12 sm:pt-16 pb-20 border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Action Triggers */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                The relational core for university intelligence, <span className="text-blue-600">query by query.</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Not a superficial dashboard with mock data. A production-grade <strong>3NF/BCNF relational database system</strong> orchestrating 24 tables, ACID double-entry fee ledgers, trigger collision prevention, and UGC 10-point SGPA algorithms executed directly in <strong>MySQL 8.0</strong>.
              </p>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onEnterPortal('admin')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-xs hover:shadow-sm"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Launch ERP Workspace
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('schema-explorer');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm px-5 py-3 rounded-xl transition shadow-2xs"
                >
                  Browse Schema DAG
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => onEnterPortal('admin', 'dbms-lab')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 transition"
                >
                  <Terminal className="w-4 h-4 text-blue-600" />
                  DBMS Viva Queries
                </button>
              </div>

              {/* Key Relational Stats Underneath */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">24</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Relational Tables</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono">8</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Engine Triggers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">4</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">Stored Procedures</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono">100%</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">3NF / BCNF Clean</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Live Preview Card (Matching Reference Aesthetic) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 relative">
                
                {/* Mac-Style Window Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs font-mono text-slate-400 ml-2">live-database-preview</span>
                  </div>

                  {/* Preview Tabs */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600">
                    <button
                      onClick={() => setActivePreviewTab('query')}
                      className={`px-2 py-0.5 rounded-md transition ${activePreviewTab === 'query' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      SQL Query
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('trigger')}
                      className={`px-2 py-0.5 rounded-md transition ${activePreviewTab === 'trigger' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      Trigger
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('dag')}
                      className={`px-2 py-0.5 rounded-md transition ${activePreviewTab === 'dag' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}`}
                    >
                      DAG
                    </button>
                  </div>
                </div>

                {/* Tab 1: Live SQL Query Execution */}
                {activePreviewTab === 'query' && (
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Executed MySQL Query:</span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                        0.38 ms • B-Tree Scan
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl text-left text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed">
                      <span className="text-purple-400">SELECT</span> s.roll_no, s.full_name, r.sgpa, r.cgpa<br />
                      <span className="text-purple-400">FROM</span> students s<br />
                      <span className="text-purple-400">JOIN</span> semester_results r <span className="text-purple-400">ON</span> s.student_id = r.student_id<br />
                      <span className="text-purple-400">WHERE</span> r.academic_standing = <span className="text-emerald-400">'DEANS_LIST'</span>;
                    </div>

                    {/* Result Row Preview */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Live ResultSet (unisphere_db):</div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-blue-700">2024CSE001</span>
                        <span className="font-sans font-medium text-slate-800">Aarav Patel</span>
                        <span className="font-bold text-slate-900">SGPA: 9.25</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          DEAN'S LIST
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Trigger Interceptor */}
                {activePreviewTab === 'trigger' && (
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Engine Trigger Rule:</span>
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-200">
                        BEFORE INSERT / UPDATE
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl text-left text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed">
                      <span className="text-purple-400">CREATE TRIGGER</span> trg_check_room_collision<br />
                      <span className="text-purple-400">BEFORE INSERT ON</span> timetable_slots<br />
                      <span className="text-purple-400">FOR EACH ROW BEGIN</span><br />
                      &nbsp;&nbsp;<span className="text-amber-400">SIGNAL SQLSTATE '45000'</span><br />
                      &nbsp;&nbsp;<span className="text-purple-400">SET MESSAGE_TEXT</span> = <span className="text-emerald-400">'Classroom collision!'</span>;
                    </div>

                    <div className="bg-amber-50 rounded-xl border border-amber-200 p-2.5 text-xs text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Prevents double-booking classrooms and professors at the database level!</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Schema DAG */}
                {activePreviewTab === 'dag' && (
                  <div className="py-4 space-y-3 text-left">
                    <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Referential Hierarchy:</div>
                    
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">1:M</span>
                        <span className="text-slate-800 font-bold">departments &rarr; programs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">1:M</span>
                        <span className="text-slate-800 font-bold">programs &rarr; students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">M:N</span>
                        <span className="text-slate-800 font-bold">courses &harr; course_prerequisites (Recursive)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Footer Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Ready for examiner viva review</span>
                  <button
                    onClick={() => onEnterPortal('admin', 'dbms-lab')}
                    className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 group"
                  >
                    Open DBMS Viva Lab
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ONE-CLICK PERSONA PORTAL LAUNCHERS */}
      <section className="py-16 bg-slate-50/60 border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 tracking-wider">
              Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Live Role Portals Ready for Examiner Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Click any persona below to authenticate instantly and inspect role-segregated database privileges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {personas.map((p) => (
              <div
                key={p.username}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${p.badgeStyle}`}>
                      {p.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{p.username}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3">{p.name}</h3>
                  <div className="text-xs font-semibold text-blue-600 mb-2">{p.role}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onEnterPortal(p.username)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    Enter as {p.name.split(' ')[0]}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. THE 8 CORE ERP SUBSYSTEMS */}
      <section className="py-20 bg-white border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 tracking-wider">
                Functional Decomposition
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">8 Core University Management Modules</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Every academic workflow connects directly to normalized MySQL tables with foreign key referential integrity.
              </p>
            </div>
            <button
              onClick={() => onEnterPortal('admin')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Open Complete ERP Suite &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div 
                  key={m.id}
                  className="bg-slate-50/70 rounded-2xl border border-slate-200 p-5 hover:bg-white hover:border-blue-200 hover:shadow-xs transition group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white text-blue-600 border border-slate-200 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-blue-600">
                      MOD-{m.id}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. INTERACTIVE RELATIONAL CLUSTER EXPLORER */}
      <section id="schema-explorer" className="py-16 bg-slate-50/60 border-b border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 tracking-wider">
              Database Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Normalized Schema Topology (24 Tables)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Interactive cluster viewer showing how our tables eliminate anomalies and satisfy 3NF & BCNF.
            </p>
          </div>

          {/* Cluster Selector Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {(['curricular', 'operational', 'academic', 'fiscal'] as const).map(cKey => (
              <button
                key={cKey}
                onClick={() => setSelectedCluster(cKey)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition ${
                  selectedCluster === cKey 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {schemaClusters[cKey].title}
              </button>
            ))}
          </div>

          {/* Active Cluster Details Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-4xl mx-auto shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{schemaClusters[selectedCluster].title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">{schemaClusters[selectedCluster].description}</p>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
                3NF / BCNF Clean
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Relational Entities in Cluster:</span>
                <div className="flex flex-wrap gap-2">
                  {schemaClusters[selectedCluster].tables.map(tbl => (
                    <span key={tbl} className="font-mono text-xs font-bold bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg">
                      {tbl}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Relational Integrity Rule:</strong> {schemaClusters[selectedCluster].highlight}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. VIVA DEFENSE DIFFERENTIATORS */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 tracking-wider">
              Evaluation Edge
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Standard Student Projects vs. UniSphere
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              The architectural decisions that demonstrate mastery over database systems fundamentals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Typical Student Project */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <span>✕ Typical Student Implementation</span>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Denormalized Tables:</strong> Student name, course title, and marks packed into 2–3 oversized tables.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Mock / Frontend-Only Logic:</strong> Business rules simulated in React state; no real MySQL engine running.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>Elective Seat Race Conditions:</strong> No row locks; simultaneous registrations cause overbooking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span><strong>ORM Abstraction:</strong> Heavy ORMs hide query execution plans, resulting in N+1 full table scans.</span>
                </li>
              </ul>
            </div>

            {/* UniSphere */}
            <div className="p-6 bg-white rounded-2xl border-2 border-blue-600 text-xs space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <span>✓ UniSphere Architecture</span>
              </div>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Strict 3NF/BCNF Decomposition:</strong> 24 normalized tables eliminating insertion, update, and deletion anomalies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Real MySQL 8.0 Engine:</strong> Parameterized SQL, InnoDB storage engine, ACID serializability, and 0 mock data.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Database Engine Triggers:</strong> Boundary checks and collision detection enforced via SQLSTATE 45000 in MySQL.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Advanced SQL Mastery:</strong> Recursive CTEs, Window Functions, and live EXPLAIN ANALYZE benchmarks.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white mx-auto flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">UniSphere Academic Operating System</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Ready for viva examination. Click below to launch the live enterprise workspace.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onEnterPortal('admin')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition shadow-xs"
            >
              Launch Operational Workspace
            </button>
          </div>
          <div className="text-[11px] text-slate-500 pt-6 font-mono">
            DBMS Graded Capstone Project • MySQL 8.0 • React 19 • Express 5 • Pure Relational SQL
          </div>
        </div>
      </footer>

    </div>
  );
};
