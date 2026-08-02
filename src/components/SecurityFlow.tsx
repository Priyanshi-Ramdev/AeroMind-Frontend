import React from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ShieldCheck, UserCheck, AlertOctagon, Flame } from 'lucide-react';

export const SecurityFlow: React.FC = () => {
  const { activeSecurityScreenings } = useStore();

  // 1. Throughput by hour (past 24h or current simulated day)
  const getHourlyData = () => {
    const hourlyCounts: Record<number, number> = {};
    // Pre-fill all 24 hours
    for (let i = 0; i < 24; i++) {
      hourlyCounts[i] = 0;
    }

    activeSecurityScreenings.forEach((ss) => {
      if (!ss.checkpointTime) return;
      const hour = new Date(ss.checkpointTime.replace(' ', 'T')).getHours();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    });

    return Object.entries(hourlyCounts).map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      passengers: count
    }));
  };

  // 2. Lane comparison (average wait times)
  const getLaneData = () => {
    const laneStats: Record<string, { totalTime: number; count: number }> = {};

    activeSecurityScreenings.forEach((ss) => {
      const lane = ss.laneId || 'XRAY-1';
      const duration = ss.durationSecs || 60;
      if (!laneStats[lane]) {
        laneStats[lane] = { totalTime: 0, count: 0 };
      }
      laneStats[lane].totalTime += duration;
      laneStats[lane].count += 1;
    });

    return Object.entries(laneStats).map(([lane, stat]) => ({
      name: lane,
      avgWaitSecs: Math.round(stat.totalTime / (stat.count || 1)),
      count: stat.count
    }));
  };

  // 3. Stats calculations
  const totalScreened = activeSecurityScreenings.length;
  const alarms = activeSecurityScreenings.filter((ss) => ss.alarmTriggered).length;
  const alarmRate = totalScreened > 0 ? (alarms / totalScreened) * 100 : 0;
  
  const secondaryChecks = activeSecurityScreenings.filter((ss) => ss.status === 'Secondary').length;
  const secondaryRate = totalScreened > 0 ? (secondaryChecks / totalScreened) * 100 : 0;

  const contraband = activeSecurityScreenings.filter((ss) => ss.hasContraband).length;

  const hourlyData = getHourlyData();
  const laneData = getLaneData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 p-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Total Screened</span>
            <span className="text-3xl font-extrabold text-white tracking-widest font-mono block mt-1">
              {totalScreened.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Today's Cumulative Count</span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Checkpoint Alarm Rate</span>
            <span className="text-3xl font-extrabold text-white tracking-widest font-mono block mt-1">
              {alarmRate.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Metal & X-Ray Triggers</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Secondary Searches</span>
            <span className="text-3xl font-extrabold text-white tracking-widest font-mono block mt-1">
              {secondaryRate.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1">Detailed Physical Patdowns</span>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
            <AlertOctagon size={24} />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-mono uppercase tracking-wider block">Contraband Detected</span>
            <span className="text-3xl font-extrabold text-red-400 tracking-widest font-mono block mt-1">
              {contraband}
            </span>
            <span className="text-[10px] text-red-500/40 font-mono block mt-1">Prohibited Items Confiscated</span>
          </div>
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
            <Flame size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Passenger flow Area chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-1">Passenger Checkpoint Throughput</h3>
            <p className="text-xs text-slate-400 mb-6">Hourly volume distribution at security terminal screening lines</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={9} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
                  labelClassName="text-slate-400 text-xs font-mono"
                  itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="passengers" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPass)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lane Wait Time Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-wide mb-1">Average Wait Time by Checkpoint Lane</h3>
            <p className="text-xs text-slate-400 mb-6">Wait time (seconds) comparison across active security lanes</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laneData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                />
                <Bar dataKey="avgWaitSecs" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {laneData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Checkpoint Log Feed */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white tracking-wide mb-1">Security Diagnostics Live Stream</h3>
        <p className="text-xs text-slate-400 mb-4">Real-time checkpoint audits from DEL security lanes</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-blue-500/10 text-slate-500">
                <th className="py-2.5">SCREENING ID</th>
                <th>PASSENGER PNR</th>
                <th>LANE</th>
                <th>DURATION</th>
                <th>STATUS</th>
                <th>ALARM TRIGGERED</th>
                <th>RANDOM</th>
                <th>CONTRABAND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-500/5 text-slate-300">
              {activeSecurityScreenings.slice(-8).reverse().map((ss) => (
                <tr key={ss.screeningId} className="hover:bg-blue-500/5 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{ss.screeningId}</td>
                  <td>{ss.passengerPnr}</td>
                  <td>
                    <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                      {ss.laneId}
                    </span>
                  </td>
                  <td>{ss.durationSecs}s</td>
                  <td>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ss.status === 'Clear'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ss.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={ss.alarmTriggered ? 'text-red-400 font-bold' : 'text-slate-500'}>
                      {ss.alarmTriggered ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td>{ss.randomCheck ? 'YES' : 'NO'}</td>
                  <td>
                    <span className={ss.hasContraband ? 'text-red-400 font-bold bg-red-500/10 px-1 rounded' : 'text-slate-500'}>
                      {ss.hasContraband ? 'ALERT' : 'NONE'}
                    </span>
                  </td>
                </tr>
              ))}
              {activeSecurityScreenings.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-slate-500">
                    No active screenings logged in current simulated time window.
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
