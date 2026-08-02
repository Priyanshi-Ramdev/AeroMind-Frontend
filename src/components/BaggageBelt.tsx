import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react';

interface CarouselUnit {
  id: string;
  name: string;
  assignedFlight: string | null;
  status: 'Operational' | 'Jammed' | 'Maintenance' | 'Idle';
  speedMps: number;
}

const CAROUSELS: CarouselUnit[] = [
  { id: '1', name: 'Carousel 1 (Intl)', assignedFlight: 'UK-633', status: 'Operational', speedMps: 1.2 },
  { id: '2', name: 'Carousel 2 (Intl)', assignedFlight: 'SQ-3327', status: 'Operational', speedMps: 1.0 },
  { id: '3', name: 'Carousel 3 (Dom)', assignedFlight: null, status: 'Idle', speedMps: 0 },
  { id: '4', name: 'Carousel 4 (Dom)', assignedFlight: null, status: 'Maintenance', speedMps: 0 },
  { id: '5', name: 'Carousel 5 (Intl)', assignedFlight: null, status: 'Operational', speedMps: 1.1 },
  { id: '6', name: 'Carousel 6 (Dom)', assignedFlight: 'AI-2637', status: 'Operational', speedMps: 0.9 }
];

export const BaggageBelt: React.FC = () => {
  const { activeBaggage, incidents, triggerManualIncident, resolveIncident } = useStore();
  const [selectedCarousel, setSelectedCarousel] = useState<CarouselUnit | null>(CAROUSELS[0]);

  // Aggregate status counts
  const getStatusChartData = () => {
    const counts = { 'Check-in': 0, 'Loaded': 0, 'Transit': 0, 'Claimed': 0 };
    activeBaggage.forEach((b) => {
      const statusKey = b.status as keyof typeof counts;
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Get active bags for the selected carousel's flight
  const getCarouselBags = () => {
    if (!selectedCarousel || !selectedCarousel.assignedFlight) return [];
    return activeBaggage.filter((b) => b.flightNumber === selectedCarousel.assignedFlight);
  };

  const statusData = getStatusChartData();
  const carouselBags = getCarouselBags();
  
  const totalBags = activeBaggage.length;
  const fragileCount = activeBaggage.filter((b) => b.isFragile).length;
  const screenedCount = activeBaggage.filter((b) => b.securityScreened).length;
  const screenedRate = totalBags > 0 ? (screenedCount / totalBags) * 100 : 0;
  
  const isJammed = incidents.some((i) => i.title.includes('Baggage Sorting') && !i.resolved);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-4 h-full">
      {/* Conveyor Belt & Carousels Overview */}
      <div className="xl:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-blue-500/20 pb-3">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-wide">Baggage Carousel Distribution</h2>
              <p className="text-xs text-slate-400">Live allocation, belt velocities, and sorting systems</p>
            </div>
            
            <button
              onClick={() => {
                if (isJammed) {
                  const incident = incidents.find((i) => i.title.includes('Baggage Sorting'));
                  if (incident) resolveIncident(incident.id);
                } else {
                  triggerManualIncident(
                    'Baggage',
                    'Baggage Sorting Belt Jam',
                    'Mechanical conveyor jam detected on sorting line 2. Ground crew dispatched for clearing.',
                    'Critical'
                  );
                }
              }}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-colors ${
                isJammed
                  ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-red-500/30 hover:text-red-400'
              }`}
            >
              <AlertCircle size={14} />
              {isJammed ? 'RESOLVE SORTING JAM' : 'SIMULATE BELT JAM'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAROUSELS.map((c) => {
              const isActive = selectedCarousel?.id === c.id;
              const hasAlert = c.assignedFlight && isJammed;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCarousel(c)}
                  className={`cursor-pointer border p-4 rounded-xl transition-all flex flex-col justify-between h-[120px] ${
                    isActive
                      ? 'bg-blue-500/10 border-blue-500 shadow-lg'
                      : hasAlert
                      ? 'bg-red-500/10 border-red-500/50 animate-pulse'
                      : 'bg-slate-900/30 border-blue-500/10 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400 block">{c.name}</span>
                      <span className="text-xs text-slate-200 mt-1 block">
                        {c.assignedFlight ? `Flight: ${c.assignedFlight}` : 'Available'}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      hasAlert ? 'bg-red-500/20 text-red-400' :
                      c.status === 'Operational' ? 'bg-emerald-500/15 text-emerald-400' :
                      c.status === 'Idle' ? 'bg-slate-800 text-slate-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {hasAlert ? 'JAMMED' : c.status}
                    </span>
                  </div>

                  {c.status === 'Operational' && c.speedMps > 0 && !hasAlert ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                      <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                      CONVEYOR: {c.speedMps} M/S
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono">
                      CONVEYOR: OFFLINE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Baggage status bar chart */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white tracking-wide mb-1">Baggage Processing State Distribution</h3>
          <p className="text-xs text-slate-400 mb-6">Quantity of bags categorized by operational handling state</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1220', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Selected Carousel baggage details */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        <div className="glass-panel rounded-2xl p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 border-b border-blue-500/20 pb-3 mb-4 flex items-center gap-2">
              <Package size={16} className="text-blue-400" />
              Carousel Diagnostics
            </h3>

            {selectedCarousel ? (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-2xl font-extrabold text-white block">{selectedCarousel.name}</span>
                  <span className="text-xs text-slate-400">
                    {selectedCarousel.assignedFlight
                      ? `Assigned: Flight ${selectedCarousel.assignedFlight}`
                      : 'Conveyor Standby'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5 col-span-2">
                    <span className="text-slate-500 block text-[9px] uppercase">Screened Rate</span>
                    <span className="text-emerald-400 text-base font-bold block mt-0.5">
                      {screenedRate.toFixed(1)}% SECURE
                    </span>
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Fragile Count</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5">
                      {fragileCount} bags
                    </span>
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Belt Capacity</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5">
                      {carouselBags.length} / 250 bags
                    </span>
                  </div>
                </div>

                {/* Baggage scanning logs */}
                <div className="space-y-2">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Belt Scanning Feed</span>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {carouselBags.slice(0, 5).map((bag) => (
                      <div key={bag.baggageId} className="flex justify-between items-center text-[10px] font-mono bg-slate-900/40 p-2 rounded border border-blue-500/5">
                        <span className="text-slate-200 font-bold">{bag.baggageId}</span>
                        <span className="text-slate-400">{bag.weight.toFixed(1)}kg</span>
                        <span className={`px-1 rounded-sm text-[8px] font-bold ${
                          bag.status === 'Transit' ? 'bg-blue-500/10 text-blue-400' :
                          bag.status === 'Loaded' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {bag.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {carouselBags.length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-xs">
                        No active luggage scanned on this conveyor belt.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="bg-slate-900/40 border border-blue-500/10 rounded-xl p-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2 font-mono uppercase tracking-wider text-[10px]">
              <ShieldAlert size={14} className="text-blue-400" />
              Baggage Security Compliance
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              All luggage items are passed through explosive trace detectors and dual-energy X-ray imaging before loading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
