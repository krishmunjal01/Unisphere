import React, { useEffect, useState } from 'react';
import { facultyApi, UserSession } from '../api';
import { Briefcase, Clock, Users, BookOpen, GraduationCap, Award } from 'lucide-react';

interface FacultyViewProps {
  user: UserSession;
}

export const FacultyView: React.FC<FacultyViewProps> = ({ user }) => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const [facData, wlData] = await Promise.all([
        facultyApi.getAll(),
        facultyApi.getWorkload()
      ]);
      setFaculty(facData);
      setWorkload(wlData);
    } catch (err) {
      console.error('Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Faculty & Department Management</h1>
        <p className="text-xs text-slate-500">Academic staff profiles, designations, department assignments & teaching workload analysis</p>
      </div>

      {/* Teaching Workload Intelligence (From vw_faculty_workload) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Teaching Workload & Course Allocations</h2>
            <p className="text-xs text-slate-500">Live aggregated metrics from database view <code className="text-slate-800 bg-slate-100 font-mono px-1.5 py-0.5 rounded border border-slate-200">vw_faculty_workload</code></p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-mono">
            Active Semester: 2026-ODD
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Faculty Code</th>
                <th className="py-2.5 px-3">Professor Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3 text-center">Active Offerings</th>
                <th className="py-2.5 px-3 text-center">Weekly Hours</th>
                <th className="py-2.5 px-3 text-center">Students Mentored</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workload.map(w => (
                <tr key={w.faculty_id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{w.employee_code}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{w.faculty_name}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700">{w.department_code}</span>
                    <span className="text-[10px] text-slate-400 block">{w.department_name}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {w.designation.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {w.active_offerings_count}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                    {w.total_weekly_contact_hours} hrs/wk
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                    {w.total_students_mentored}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Faculty Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculty.map(f => (
          <div key={f.faculty_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {f.employee_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{f.full_name}</h3>
                  <div className="text-xs text-slate-600 font-semibold">{f.designation.replace('_', ' ')}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-700">{f.department_name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">({f.department_code})</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{f.qualification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Joined: {new Date(f.joining_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{f.email}</span>
              <span className="font-mono">{f.contact_number}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

