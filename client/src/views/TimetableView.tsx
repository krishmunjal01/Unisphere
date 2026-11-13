import React, { useEffect, useState } from 'react';
import { timetableApi, coursesApi, UserSession } from '../api';
import { 
  Clock, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  X,
  Layers
} from 'lucide-react';

interface TimetableViewProps {
  user: UserSession;
}

export const TimetableView: React.FC<TimetableViewProps> = ({ user }) => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formSlot, setFormSlot] = useState({
    offeringId: 1,
    classroomId: 1,
    dayOfWeek: 'MONDAY',
    startTime: '09:00:00',
    endTime: '10:00:00'
  });
  const [slotMsg, setSlotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTimetableData();
  }, []);

  const loadTimetableData = async () => {
    try {
      const [ttData, crData, offData] = await Promise.all([
        timetableApi.getMaster(),
        timetableApi.getClassrooms(),
        coursesApi.getOfferings()
      ]);
      setTimetable(ttData);
      setClassrooms(crData);
      setOfferings(offData);
      if (offData.length > 0) setFormSlot(prev => ({ ...prev, offeringId: offData[0].offering_id }));
    } catch (err) {
      console.error('Failed to load timetable:', err);
    }
  };

  const handleScheduleSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotMsg(null);
    try {
      const res = await timetableApi.scheduleSlot(formSlot);
      setSlotMsg({ type: 'success', text: res.message });
      loadTimetableData();
      setTimeout(() => {
        setShowScheduleModal(false);
        setSlotMsg(null);
      }, 1500);
    } catch (err: any) {
      setSlotMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Timetable & Infrastructure Allocation</h1>
          <p className="text-xs text-slate-500">Weekly scheduling matrix, classroom utilization & conflict detection triggers</p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={() => { setShowScheduleModal(true); setSlotMsg(null); }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Schedule Timetable Slot
          </button>
        )}
      </div>

      {/* Collision Alert Feedback */}
      {slotMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-xs ${
          slotMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {slotMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />}
            <div>
              <strong className="block font-semibold">
                {slotMsg.type === 'success' ? 'Schedule Slot Confirmed' : 'Integrity Constraint Blocked (SQLSTATE 45000)'}
              </strong>
              <span>{slotMsg.text}</span>
            </div>
          </div>
          <button onClick={() => setSlotMsg(null)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
        </div>
      )}

      {/* Master Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Institutional Scheduling Grid</h2>
          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            View: vw_master_timetable
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Time Interval</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Classroom</th>
                <th className="py-3 px-4">Instructor</th>
                <th className="py-3 px-4">Room Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timetable.map(slot => (
                <tr key={slot.slot_id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                      {slot.day_of_week}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{slot.course_code}</span>
                    <span className="text-[10px] text-slate-500 block">{slot.course_title} (Sec {slot.section})</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {slot.building} - {slot.room_number}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{slot.instructor_name}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {slot.room_type.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classroom Master Inventory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Classroom & Laboratory Physical Assets</h2>
        <p className="text-xs text-slate-500 mb-4">Master facility database records in <code className="text-slate-800 bg-slate-100 font-mono px-1.5 py-0.5 rounded border border-slate-200">classrooms</code></p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {classrooms.map(cr => (
            <div key={cr.classroom_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">{cr.room_number}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                  Cap: {cr.capacity}
                </span>
              </div>
              <div className="font-medium text-slate-800 truncate">{cr.building}</div>
              <div className="text-[10px] text-slate-400">{cr.room_type.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Slot Modal (Collision Trigger Demo) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                Schedule Class Slot (Conflict Triggers Active)
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSlot} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Offering</label>
                <select
                  value={formSlot.offeringId}
                  onChange={e => setFormSlot({ ...formSlot, offeringId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {offerings.map(o => (
                    <option key={o.offering_id} value={o.offering_id}>
                      {o.course_code} - Sec {o.section} ({o.instructor_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Classroom</label>
                <select
                  value={formSlot.classroomId}
                  onChange={e => setFormSlot({ ...formSlot, classroomId: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  {classrooms.map(cr => (
                    <option key={cr.classroom_id} value={cr.classroom_id}>
                      {cr.building} - {cr.room_number} (Cap: {cr.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Day of Week</label>
                  <select
                    value={formSlot.dayOfWeek}
                    onChange={e => setFormSlot({ ...formSlot, dayOfWeek: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium"
                  >
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    step="1"
                    value={formSlot.startTime}
                    onChange={e => setFormSlot({ ...formSlot, startTime: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    step="1"
                    value={formSlot.endTime}
                    onChange={e => setFormSlot({ ...formSlot, endTime: e.target.value })}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Examiner Demonstration Tip:
                </span>
                <p className="text-[11px] leading-relaxed">
                  Try booking <strong>CR-101</strong> on <strong>MONDAY</strong> between <strong>09:30:00</strong> and <strong>10:30:00</strong>. Trigger <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">trg_check_room_collision_insert</code> will instantly block it!
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setFormSlot({
                    offeringId: 2,
                    classroomId: 1,
                    dayOfWeek: 'MONDAY',
                    startTime: '09:30:00',
                    endTime: '10:30:00'
                  })}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[10px]"
                >
                  Pre-fill Collision (Demo)
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

