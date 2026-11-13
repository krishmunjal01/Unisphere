import React, { useEffect, useState } from 'react';
import { examsApi, coursesApi, studentsApi, UserSession } from '../api';
import { 
  Award, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  FileText, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ExamsViewProps {
  user: UserSession;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ user }) => {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<number>(1);
  const [components, setComponents] = useState<any[]>([]);
  const [marksGrid, setMarksGrid] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [transcripts, setTranscripts] = useState<any>(null);
  const [editMark, setEditMark] = useState<{ componentId: number; studentId: number; value: number }>({ componentId: 1, studentId: 1, value: 85 });
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    if (selectedOfferingId) {
      loadOfferingData(selectedOfferingId);
    }
  }, [selectedOfferingId]);

  useEffect(() => {
    loadTranscript(selectedStudentId);
  }, [selectedStudentId]);

  const loadOfferings = async () => {
    try {
      const [offs, stds] = await Promise.all([
        coursesApi.getOfferings(),
        studentsApi.getAll()
      ]);
      setOfferings(offs);
      setStudents(stds);
      if (offs.length > 0) setSelectedOfferingId(offs[0].offering_id);
      if (user.role === 'STUDENT' && user.studentId) {
        setSelectedStudentId(user.studentId);
      }
    } catch (err) {
      console.error('Failed to load offerings:', err);
    }
  };

  const loadOfferingData = async (offeringId: number) => {
    try {
      const [comps, marks] = await Promise.all([
        examsApi.getComponents(offeringId),
        examsApi.getMarks(offeringId)
      ]);
      setComponents(comps);
      setMarksGrid(marks);
    } catch (err) {
      console.error('Failed to load offering marks data:', err);
    }
  };

  const loadTranscript = async (studentId: number) => {
    try {
      const data = await examsApi.getTranscripts(studentId);
      setTranscripts(data);
    } catch (err) {
      console.error('Failed to load transcript:', err);
    }
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);
    try {
      const res = await examsApi.saveMarks({
        componentId: editMark.componentId,
        studentId: editMark.studentId,
        marksObtained: editMark.value,
        remarks: 'Faculty viva grade entry'
      });
      setActionMsg({ type: 'success', text: res.message });
      loadOfferingData(selectedOfferingId);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  const handleComputeSGPA = async () => {
    setActionMsg(null);
    try {
      const res = await examsApi.calculateSGPA(selectedStudentId, 3);
      setActionMsg({
        type: 'success',
        text: `Stored procedure [sp_calculate_sgpa] executed: Computed SGPA = ${res.sgpa}, CGPA = ${res.cgpa}`
      });
      loadTranscript(selectedStudentId);
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examinations, Grading & Transcripts</h1>
          <p className="text-xs text-slate-500">Component weighting, trigger boundary checks, and procedural SGPA/CGPA computation</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleComputeSGPA}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <Calculator className="w-4 h-4" />
            Execute sp_calculate_sgpa()
          </button>
        </div>
      </div>

      {/* Action Banner (Triggers or Procedures feedback) */}
      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          actionMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <div>
              <strong className="block font-semibold">
                {actionMsg.type === 'success' ? 'Database Engine Confirmation' : 'Trigger Validation Exception (SQLSTATE 45000)'}
              </strong>
              <span>{actionMsg.text}</span>
            </div>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* Faculty Assessment Marks Section */}
      {user.role !== 'STUDENT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Marks Entry & Trigger Test Console */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Enter / Update Assessment Marks</h2>
            <p className="text-xs text-slate-500 mb-4">
              Protected by MySQL trigger <code className="text-slate-800 bg-slate-100 font-mono px-1 py-0.5 rounded border border-slate-200">trg_validate_marks_insert</code>
            </p>

            <form onSubmit={handleSaveMark} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Course Offering</label>
                <select
                  value={selectedOfferingId}
                  onChange={e => setSelectedOfferingId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {offerings.map(o => (
                    <option key={o.offering_id} value={o.offering_id}>
                      {o.course_code} - Sec {o.section} ({o.course_title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assessment Component</label>
                <select
                  value={editMark.componentId}
                  onChange={e => setEditMark({ ...editMark, componentId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {components.map(c => (
                    <option key={c.component_id} value={c.component_id}>
                      {c.component_name} (Max Marks: {c.max_marks}, Weight: {c.weightage_percentage}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student</label>
                <select
                  value={editMark.studentId}
                  onChange={e => setEditMark({ ...editMark, studentId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.university_roll_no} - {s.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Marks Obtained <span className="text-slate-400 font-normal">(Try entering &gt; 100 or negative to test trigger!)</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editMark.value}
                  onChange={e => setEditMark({ ...editMark, value: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl transition shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  Save Marks
                </button>
                <button
                  type="button"
                  onClick={() => setEditMark({ ...editMark, value: 150 })}
                  className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-[10px]"
                  title="Simulate examiner negative test by exceeding max marks"
                >
                  Test 150 (Trigger)
                </button>
              </div>
            </form>
          </div>

          {/* Current Offering Marks Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Registered Assessment Scores</h2>
                <p className="text-xs text-slate-500">Live evaluation records in <code className="text-slate-800 bg-slate-100 font-mono px-1 py-0.5 rounded border border-slate-200">student_marks</code></p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Component</th>
                    <th className="py-2.5 px-3 text-center">Weight</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marksGrid.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.university_roll_no}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{m.student_name}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{m.component_name}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{m.weightage_percentage}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {m.marks_obtained} / {m.max_marks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Official Academic Transcript Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Official Semester Transcript & Standing</h2>
            </div>
            <p className="text-xs text-slate-500">Immutable results calculated and snapshot-persisted into <code className="text-slate-800 bg-slate-100 font-mono px-1 py-0.5 rounded border border-slate-200">semester_results</code></p>
          </div>

          {user.role !== 'STUDENT' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Inspect Student:</span>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(parseInt(e.target.value, 10))}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
              >
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.university_roll_no} - {s.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Semester Snapshot Cards */}
        <div className="mt-6 space-y-6">
          {transcripts?.semesters?.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No computed semester results available. Click <strong>Execute sp_calculate_sgpa()</strong> above to generate!
            </div>
          ) : (
            transcripts?.semesters?.map((sem: any) => (
              <div key={sem.result_id} className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                      {sem.semester_code} ({sem.academic_year})
                    </span>
                    <span className="text-xs text-slate-500 ml-2">Published: {new Date(sem.published_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-semibold">
                      SGPA: <strong className="text-slate-900 font-mono text-sm">{sem.sgpa}</strong>
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">
                      CGPA: <strong className="text-slate-900 font-mono text-sm">{sem.cgpa}</strong>
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {sem.academic_standing.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Course Marks in this semester */}
                <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Course Code</th>
                        <th className="py-2 px-3">Subject Name</th>
                        <th className="py-2 px-3 text-center">Credits</th>
                        <th className="py-2 px-3 text-center">Grade Letter</th>
                        <th className="py-2 px-3 text-center">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transcripts.courses
                        .filter((c: any) => c.semester_code === sem.semester_code)
                        .map((c: any) => (
                          <tr key={c.enrollment_id}>
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">{c.course_code}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{c.title}</td>
                            <td className="py-2 px-3 text-center font-mono">{c.credits}</td>
                            <td className="py-2 px-3 text-center font-bold">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono border border-slate-200">
                                {c.final_grade || 'PENDING'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                              {c.grade_point || '0.00'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

