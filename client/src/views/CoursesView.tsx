import React, { useEffect, useState } from 'react';
import { coursesApi, UserSession } from '../api';
import { 
  BookOpen, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Layers, 
  Clock, 
  X 
} from 'lucide-react';

interface CoursesViewProps {
  user: UserSession;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ user }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'offerings' | 'catalog'>('offerings');
  const [selectedPrereqCourse, setSelectedPrereqCourse] = useState<any>(null);
  const [prereqTree, setPrereqTree] = useState<any[]>([]);
  const [loadingPrereqs, setLoadingPrereqs] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, offeringsData] = await Promise.all([
        coursesApi.getAll(),
        coursesApi.getOfferings()
      ]);
      setCourses(coursesData);
      setOfferings(offeringsData);
    } catch (err) {
      console.error('Failed to load courses data:', err);
    }
  };

  const handleEnroll = async (offeringId: number) => {
    setEnrollMsg(null);
    try {
      const studentId = user.role === 'STUDENT' ? user.studentId : 1; // Default Aarav for Admin demo
      const result = await coursesApi.enroll(studentId, offeringId);
      setEnrollMsg({ type: 'success', text: result.message });
      loadData();
    } catch (err: any) {
      setEnrollMsg({ type: 'error', text: err.message });
    }
  };

  const handleViewPrereqs = async (course: any) => {
    setSelectedPrereqCourse(course);
    setLoadingPrereqs(true);
    try {
      const studentId = user.role === 'STUDENT' ? (user.studentId || 1) : 1;
      const data = await coursesApi.getPrerequisites(course.course_id, studentId);
      setPrereqTree(data);
    } catch (err) {
      console.error('Failed to fetch prerequisites:', err);
    } finally {
      setLoadingPrereqs(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Curriculum & Course Registration</h1>
          <p className="text-xs text-slate-500">Degree programs, semester course offerings & atomic registration procedures</p>
        </div>

        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('offerings')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'offerings' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Semester Offerings
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Catalog (3NF)
          </button>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {enrollMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          enrollMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {enrollMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <div>
              <strong className="block font-semibold">
                {enrollMsg.type === 'success' ? 'Stored Procedure [sp_enroll_student] Committed' : 'Integrity Rollback Triggered'}
              </strong>
              <span>{enrollMsg.text}</span>
            </div>
          </div>
          <button onClick={() => setEnrollMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW: Course Offerings */}
      {activeTab === 'offerings' && (
        <div className="space-y-4">
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Current Term: <strong>2026-ODD</strong> • All registrations execute under pessimistic row locks (<code className="font-mono bg-slate-200 px-1 py-0.5 rounded">FOR UPDATE</code>)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offerings.map(o => (
              <div key={o.offering_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {o.course_code}
                        </span>
                        <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Sec {o.section}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{o.course_title}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">Instructor: <strong className="text-slate-700">{o.instructor_name}</strong></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                      {o.credits} Credits
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Seat Allocation</span>
                      <span className="font-mono font-semibold">
                        {o.current_enrolled} / {o.max_capacity} ({o.available_seats} remaining)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (o.current_enrolled / o.max_capacity) >= 0.9 ? 'bg-rose-500' : 'bg-slate-900'
                        }`}
                        style={{ width: `${(o.current_enrolled / o.max_capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                    <span>Room: <strong className="text-slate-700">{o.building} - {o.room_number || 'TBD'}</strong></span>
                    <button
                      onClick={() => handleViewPrereqs(o)}
                      className="text-slate-800 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Prerequisites
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">Offering ID: #{o.offering_id}</span>
                  <button
                    onClick={() => handleEnroll(o.offering_id)}
                    disabled={o.available_seats <= 0}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {user.role === 'STUDENT' ? 'Register Subject' : 'Enroll Student (Demo)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: Master Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-center">L-T-P Split</th>
                  <th className="py-3 px-4">Course Type</th>
                  <th className="py-3 px-4 text-right">Dependency Tree</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map(c => (
                  <tr key={c.course_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.course_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.title}</td>
                    <td className="py-3 px-4 text-slate-600">{c.department_name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{c.credits}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {c.lecture_hours}-{c.tutorial_hours}-{c.practical_hours}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {c.course_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewPrereqs(c)}
                        className="text-slate-800 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Analyze CTE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recursive Prerequisite Modal */}
      {selectedPrereqCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-900">{selectedPrereqCourse.course_code}</span>
                <h2 className="text-base font-bold text-slate-900">Prerequisite Dependency Graph</h2>
                <p className="text-xs text-slate-500">Resolved via MySQL 8 Recursive Common Table Expression (WITH RECURSIVE)</p>
              </div>
              <button onClick={() => setSelectedPrereqCourse(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loadingPrereqs ? (
                <div className="text-center py-8 text-slate-400 text-xs">Traversing recursive prerequisite graph...</div>
              ) : prereqTree.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>No prerequisites required for this course. Open for direct registration.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {prereqTree.map((p, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                            Depth {p.dependency_depth}
                          </span>
                          <span className="font-bold text-slate-900">{p.required_prerequisite}</span>
                          <span className="text-slate-600">({p.prerequisite_title})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Student Clearance Grade: <strong className="font-mono text-slate-700">{p.student_grade}</strong>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        p.eligibility_state === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.eligibility_state}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPrereqCourse(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

