import React, { useEffect, useState } from 'react';
import { studentsApi, UserSession } from '../api';
import { 
  Users, 
  Search, 
  UserPlus, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  CreditCard, 
  CalendarCheck,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentsViewProps {
  user: UserSession;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ user }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    universityRollNo: '',
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '2004-01-01',
    gender: 'MALE',
    programId: 1,
    currentSemester: 1,
    admissionYear: 2026,
    contactNumber: '+91 9988776655',
    bloodGroup: 'B+',
    guardianName: 'Guardian Name',
    guardianContact: '+91 9988776600'
  });
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };

  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setLoadingDetails(true);
    try {
      const details = await studentsApi.getDetails(student.student_id);
      setStudentDetails(details);
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      await studentsApi.create(formData);
      setFormMsg({ type: 'success', text: 'Student profile created atomically in database!' });
      loadStudents();
      setTimeout(() => {
        setShowAddModal(false);
        setFormMsg(null);
      }, 1500);
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message });
    }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.university_roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.program_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Information Management</h1>
          <p className="text-xs text-slate-500">Master student profiles, department mapping, and 360-degree academic history</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roll, name, program..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 w-64"
            />
          </div>

          {user.role === 'ADMIN' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Register Student
            </button>
          )}
        </div>
      </div>

      {/* Main Student Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program & Dept</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr 
                  key={s.student_id} 
                  onClick={() => handleSelectStudent(s)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.university_roll_no}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{s.full_name}</div>
                    <div className="text-[10px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700">{s.program_code}</span>
                    <span className="text-[10px] text-slate-400 block">{s.department_name}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-semibold">
                      Sem {s.current_semester}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.academic_status === 'ENROLLED' ? 'bg-emerald-100 text-emerald-800' :
                      s.academic_status === 'PROBATION' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {s.academic_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{s.contact_number}</td>
                  <td className="py-3 px-4 text-right text-slate-800">
                    <span className="inline-flex items-center gap-1 font-semibold hover:underline">
                      View 360°
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student 360-Degree Modal Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-slate-800 text-slate-200 px-2 py-0.5 rounded border border-slate-700">
                    {selectedStudent.university_roll_no}
                  </span>
                  <span className="text-xs text-slate-400">Enrollment: {selectedStudent.enrollment_number}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{selectedStudent.full_name}</h2>
                <p className="text-xs text-slate-300">{selectedStudent.program_name}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {loadingDetails ? (
                <div className="text-center py-12 text-slate-400">
                  Loading complete academic record from database...
                </div>
              ) : (
                <>
                  {/* Performance Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase">Cumulative CGPA</span>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {studentDetails?.profile?.latest_cgpa || '0.00'}
                      </div>
                    </div>
                    <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-700 uppercase">Latest SGPA</span>
                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {studentDetails?.profile?.latest_sgpa || '0.00'}
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase">Enrolled Subjects</span>
                      <div className="text-xl font-bold text-emerald-900 mt-0.5">
                        {studentDetails?.profile?.total_enrolled_courses || 0}
                      </div>
                    </div>
                    <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100">
                      <span className="text-[11px] font-semibold text-rose-700 uppercase">Fee Dues</span>
                      <div className="text-xl font-bold text-rose-900 mt-0.5 font-mono">
                        ₹{Number(studentDetails?.profile?.total_fee_dues || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Active Course Enrollments */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-700" />
                      Active Semester Enrollments
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Course Code</th>
                            <th className="py-2.5 px-3">Subject Title</th>
                            <th className="py-2.5 px-3 text-center">Credits</th>
                            <th className="py-2.5 px-3">Instructor</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentDetails?.enrollments?.map((e: any) => (
                            <tr key={e.enrollment_id}>
                              <td className="py-2 px-3 font-mono font-bold text-slate-900">{e.course_code}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{e.title}</td>
                              <td className="py-2 px-3 text-center font-mono">{e.credits}</td>
                              <td className="py-2 px-3 text-slate-600">{e.instructor_name}</td>
                              <td className="py-2 px-3 text-center">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                  {e.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Attendance Performance */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-indigo-600" />
                      Subject-Wise Attendance Summary (75% Threshold View)
                    </h3>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Course</th>
                            <th className="py-2.5 px-3 text-center">Conducted</th>
                            <th className="py-2.5 px-3 text-center">Attended</th>
                            <th className="py-2.5 px-3 text-center">Percentage</th>
                            <th className="py-2.5 px-3 text-center">Eligibility</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {studentDetails?.attendance?.map((a: any) => (
                            <tr key={a.offering_id}>
                              <td className="py-2 px-3 font-semibold text-slate-800">{a.course_code} - {a.course_title}</td>
                              <td className="py-2 px-3 text-center font-mono">{a.total_sessions_conducted}</td>
                              <td className="py-2 px-3 text-center font-mono">{a.total_attended}</td>
                              <td className="py-2 px-3 text-center font-bold">
                                <span className={a.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {a.attendance_percentage}%
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  a.examination_eligibility === 'ELIGIBLE' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {a.examination_eligibility}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Register New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Register New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMsg && (
              <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">University Roll No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026CSE099"
                    value={formData.universityRollNo}
                    onChange={e => setFormData({ ...formData, universityRollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Enrollment Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENR-2026-CSE-099"
                    value={formData.enrollmentNumber}
                    onChange={e => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username (Login)</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Program</label>
                  <select
                    value={formData.programId}
                    onChange={e => setFormData({ ...formData, programId: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>B.Tech Computer Science & Engineering</option>
                    <option value={2}>M.Tech Artificial Intelligence</option>
                    <option value={3}>B.Tech Electronics & Communication</option>
                    <option value={4}>BCA (Computer Applications)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Semester</label>
                  <select
                    value={formData.currentSemester}
                    onChange={e => setFormData({ ...formData, currentSemester: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Submit Registration (Atomic Transaction)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

