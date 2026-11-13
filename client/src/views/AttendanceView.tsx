import React, { useEffect, useState } from 'react';
import { attendanceApi, coursesApi, UserSession } from '../api';
import { 
  CalendarCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  X,
  FileCheck2
} from 'lucide-react';

interface AttendanceViewProps {
  user: UserSession;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ user }) => {
  const [summary, setSummary] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number>(1);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicCovered, setTopicCovered] = useState('Transaction Serializability & Concurrency Anomalies');
  const [studentStatuses, setStudentStatuses] = useState<Record<number, string>>({});
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const [sumData, offData] = await Promise.all([
        attendanceApi.getSummary(),
        coursesApi.getOfferings()
      ]);
      setSummary(sumData);
      setOfferings(offData);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    }
  };

  const handleOpenMarkModal = async () => {
    setShowMarkModal(true);
    setSubmitMsg(null);
    try {
      const students = await attendanceApi.getOfferingStudents(selectedOfferingId);
      setEnrolledStudents(students);
      const initial: Record<number, string> = {};
      students.forEach(s => { initial[s.student_id] = 'PRESENT'; });
      setStudentStatuses(initial);
    } catch (err) {
      console.error('Failed to load offering students:', err);
    }
  };

  const handleOfferingChange = async (offeringId: number) => {
    setSelectedOfferingId(offeringId);
    try {
      const students = await attendanceApi.getOfferingStudents(offeringId);
      setEnrolledStudents(students);
      const initial: Record<number, string> = {};
      students.forEach(s => { initial[s.student_id] = 'PRESENT'; });
      setStudentStatuses(initial);
    } catch (err) {
      console.error('Failed to update offering students:', err);
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    try {
      const records = enrolledStudents.map(s => ({
        studentId: s.student_id,
        status: studentStatuses[s.student_id] || 'PRESENT',
        remarks: 'Batch class session'
      }));

      await attendanceApi.createSession({
        offeringId: selectedOfferingId,
        sessionDate,
        topicCovered,
        records
      });

      setSubmitMsg({ type: 'success', text: 'Attendance session successfully saved and committed to database!' });
      loadAttendanceData();
      setTimeout(() => {
        setShowMarkModal(false);
        setSubmitMsg(null);
      }, 1500);
    } catch (err: any) {
      setSubmitMsg({ type: 'error', text: err.message });
    }
  };

  const defaulters = summary.filter(s => s.examination_eligibility === 'DEFAULTER_SHORTAGE');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance & Academic Eligibility</h1>
          <p className="text-xs text-slate-500">Live attendance percentage calculations & 75% examination eligibility enforcement</p>
        </div>

        {user.role !== 'STUDENT' && (
          <button
            onClick={handleOpenMarkModal}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Conduct Attendance Session
          </button>
        )}
      </div>

      {/* Mandatory Shortage Warning Alert */}
      {defaulters.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-rose-950 block">Attendance Defaulter Warning (&lt; 75% Threshold)</strong>
            <span>
              The database view <code className="font-mono bg-rose-100 text-rose-800 px-1 py-0.5 rounded">vw_student_attendance_summary</code> flagged <strong>{defaulters.length} student-course instances</strong> violating attendance criteria. These candidates are barred from university examinations.
            </span>
          </div>
        </div>
      )}

      {/* Main Attendance Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Subject-Wise Attendance Matrix</h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            View: vw_student_attendance_summary
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Attended</th>
                <th className="py-3 px-4 text-center">Percentage</th>
                <th className="py-3 px-4 text-center">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.map((row, idx) => {
                const isShortage = row.examination_eligibility === 'DEFAULTER_SHORTAGE';
                return (
                  <tr key={idx} className={isShortage ? 'bg-rose-50/30' : 'hover:bg-slate-50/70'}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.university_roll_no}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{row.student_name}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{row.course_code}</span>
                      <span className="text-[10px] text-slate-400 block">{row.course_title} (Sec {row.section})</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {row.total_sessions_conducted}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-600">
                      {row.total_attended}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      <span className={isShortage ? 'text-rose-600' : 'text-emerald-700'}>
                        {row.attendance_percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                        row.examination_eligibility === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800' :
                        row.examination_eligibility === 'DEFAULTER_SHORTAGE' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {row.examination_eligibility === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3" />}
                        {row.examination_eligibility === 'DEFAULTER_SHORTAGE' && <XCircle className="w-3 h-3" />}
                        {row.examination_eligibility}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conduct Attendance Session Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-slate-800" />
                Conduct Attendance Session
              </h2>
              <button onClick={() => setShowMarkModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitMsg && (
              <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                submitMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {submitMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                {submitMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitAttendance} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Course Offering</label>
                  <select
                    value={selectedOfferingId}
                    onChange={e => handleOfferingChange(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 font-medium"
                  >
                    {offerings.map(o => (
                      <option key={o.offering_id} value={o.offering_id}>
                        {o.course_code} - Sec {o.section} ({o.course_title})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Session Date</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topic Covered</label>
                <input
                  type="text"
                  required
                  value={topicCovered}
                  onChange={e => setTopicCovered(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400"
                />
              </div>

              {/* Enrolled Students Check List */}
              <div className="pt-2">
                <label className="font-semibold text-slate-700 block mb-2">Mark Student Attendance Status:</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {enrolledStudents.map(s => {
                    const status = studentStatuses[s.student_id] || 'PRESENT';
                    return (
                      <div key={s.student_id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <span className="font-mono font-bold text-slate-900 mr-2">{s.university_roll_no}</span>
                          <span className="font-medium text-slate-800">{s.student_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStudentStatuses({ ...studentStatuses, [s.student_id]: 'PRESENT' })}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                              status === 'PRESENT' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatuses({ ...studentStatuses, [s.student_id]: 'LATE' })}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                              status === 'LATE' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatuses({ ...studentStatuses, [s.student_id]: 'ABSENT' })}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                              status === 'ABSENT' ? 'bg-rose-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Commit Attendance Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

