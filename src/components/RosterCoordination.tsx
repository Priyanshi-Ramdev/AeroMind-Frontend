import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Users, Shield, Hammer, Clipboard } from 'lucide-react';

export const RosterCoordination: React.FC = () => {
  const { activeStaffShifts } = useStore();
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Group staff by department
  const getDeptCount = (dept: string) => {
    return activeStaffShifts.filter((s) => s.department === dept).length;
  };

  const filteredStaff = selectedDept === 'All'
    ? activeStaffShifts
    : activeStaffShifts.filter((s) => s.department === selectedDept);

  return (
    <div className="space-y-6 p-4">
      {/* Department Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          onClick={() => setSelectedDept('All')}
          className={`cursor-pointer glass-panel rounded-2xl p-5 border transition-all ${
            selectedDept === 'All' ? 'border-blue-500 bg-blue-500/10' : 'border-blue-500/15'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Total Personnel</span>
              <span className="text-3xl font-extrabold text-white tracking-widest font-mono block mt-1">
                {activeStaffShifts.length}
              </span>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedDept('Ops')}
          className={`cursor-pointer glass-panel rounded-2xl p-5 border transition-all ${
            selectedDept === 'Ops' ? 'border-amber-500 bg-amber-500/10' : 'border-blue-500/15'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Operations Team</span>
              <span className="text-3xl font-extrabold text-amber-400 tracking-widest font-mono block mt-1">
                {getDeptCount('Ops')}
              </span>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Clipboard size={24} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedDept('Security')}
          className={`cursor-pointer glass-panel rounded-2xl p-5 border transition-all ${
            selectedDept === 'Security' ? 'border-purple-500 bg-purple-500/10' : 'border-blue-500/15'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Security Team</span>
              <span className="text-3xl font-extrabold text-purple-400 tracking-widest font-mono block mt-1">
                {getDeptCount('Security')}
              </span>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Shield size={24} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedDept('Maintenance')}
          className={`cursor-pointer glass-panel rounded-2xl p-5 border transition-all ${
            selectedDept === 'Maintenance' ? 'border-emerald-500 bg-emerald-500/10' : 'border-blue-500/15'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Engineering Team</span>
              <span className="text-3xl font-extrabold text-emerald-400 tracking-widest font-mono block mt-1">
                {getDeptCount('Maintenance')}
              </span>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Hammer size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Roster Table Grid */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide">Workforce Shift Directory</h3>
            <p className="text-xs text-slate-400">Active roster assignments for current shift date and hours</p>
          </div>
          
          <div className="text-xs text-slate-500 font-mono">
            FILTER: <span className="text-blue-400 font-bold uppercase">{selectedDept}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-blue-500/10 text-slate-500">
                <th className="py-2.5">STAFF ID</th>
                <th>NAME</th>
                <th>DEPARTMENT</th>
                <th>ROLE</th>
                <th>SHIFT TIMING</th>
                <th>TERMINAL LOCATION</th>
                <th>LANGUAGES</th>
                <th>SUPERVISOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5 text-slate-300">
              {filteredStaff.slice(0, 15).map((staff) => (
                <tr key={staff.staffId} className="hover:bg-blue-500/5 transition-colors">
                  <td className="py-3 font-semibold text-blue-400">{staff.staffId}</td>
                  <td className="text-slate-200 font-medium">{staff.name}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      staff.department === 'Ops' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      staff.department === 'Security' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {staff.department.toUpperCase()}
                    </span>
                  </td>
                  <td>{staff.role}</td>
                  <td>{staff.startTime} - {staff.endTime}</td>
                  <td>Terminal {staff.terminal}, Gate {staff.assignedLocation}</td>
                  <td>{staff.languages}</td>
                  <td className="text-slate-400">{staff.supervisorId}</td>
                </tr>
              ))}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    No workforce roster matches for the selected department.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
