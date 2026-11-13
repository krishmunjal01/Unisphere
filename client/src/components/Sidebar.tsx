import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  CreditCard, 
  Clock, 
  Cpu,
  Layers
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'students' 
  | 'faculty' 
  | 'courses' 
  | 'attendance' 
  | 'exams' 
  | 'fees' 
  | 'timetable' 
  | 'dbms-lab';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, userRole }) => {
  const getNavItems = () => {
    if (userRole === 'STUDENT') {
      return [
        { id: 'dashboard' as TabType, label: 'My Academic Dashboard', icon: LayoutDashboard },
        { id: 'courses' as TabType, label: 'My Registered Courses', icon: BookOpen },
        { id: 'attendance' as TabType, label: 'My Subject Attendance', icon: CalendarCheck },
        { id: 'exams' as TabType, label: 'My Grades & Transcripts', icon: Award },
        { id: 'fees' as TabType, label: 'My Fee Invoices & Receipts', icon: CreditCard },
        { id: 'timetable' as TabType, label: 'My Class Schedule', icon: Clock },
        { id: 'dbms-lab' as TabType, label: 'DBMS Intelligence Lab', icon: Cpu, badge: 'VIVA' }
      ];
    }

    if (userRole === 'FACULTY') {
      return [
        { id: 'dashboard' as TabType, label: 'My Teaching Console', icon: LayoutDashboard },
        { id: 'students' as TabType, label: 'Student Directory', icon: Users },
        { id: 'faculty' as TabType, label: 'My Teaching Workload', icon: Briefcase },
        { id: 'courses' as TabType, label: 'Assigned Courses & Syllabus', icon: BookOpen },
        { id: 'attendance' as TabType, label: 'Mark Class Attendance', icon: CalendarCheck },
        { id: 'exams' as TabType, label: 'Grade Assessments & Marks', icon: Award },
        { id: 'timetable' as TabType, label: 'My Lecture Timetable', icon: Clock },
        { id: 'dbms-lab' as TabType, label: 'DBMS Intelligence Lab', icon: Cpu, badge: 'VIVA' }
      ];
    }

    // Default: ADMIN / Registrar
    return [
      { id: 'dashboard' as TabType, label: 'Institutional Overview', icon: LayoutDashboard },
      { id: 'students' as TabType, label: 'Student Information System', icon: Users },
      { id: 'faculty' as TabType, label: 'Faculty & Workload Distribution', icon: Briefcase },
      { id: 'courses' as TabType, label: 'Courses & Curriculum DAG', icon: BookOpen },
      { id: 'attendance' as TabType, label: 'University Attendance Operations', icon: CalendarCheck },
      { id: 'exams' as TabType, label: 'Exams & SGPA Calculation', icon: Award },
      { id: 'fees' as TabType, label: 'Fees & Transaction Ledgers', icon: CreditCard },
      { id: 'timetable' as TabType, label: 'Timetable & Room Allocations', icon: Clock },
      { id: 'dbms-lab' as TabType, label: 'DBMS Intelligence Lab', icon: Cpu, badge: 'VIVA' }
    ];
  };

  const navItems = getNavItems();

  const getSectionTitle = () => {
    if (userRole === 'STUDENT') return 'Student Academic Portal';
    if (userRole === 'FACULTY') return 'Faculty Teaching Console';
    return 'Institutional Administration';
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50/60 rounded-lg mb-2 border border-blue-100 flex items-center justify-between">
          <span>{getSectionTitle()}</span>
          <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 text-slate-700">
            {userRole}
          </span>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isLab = item.id === 'dbms-lab';

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : isLab
                    ? 'text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Relational Database Blueprint Indicator */}
      <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-between font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            Database Specs
          </span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">3NF</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          24 Relational Tables • 5 Views • 8 Triggers • 4 Stored Procedures • InnoDB
        </p>
      </div>
    </aside>
  );
};

