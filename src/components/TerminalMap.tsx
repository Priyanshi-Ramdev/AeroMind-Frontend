import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plane, AlertTriangle } from 'lucide-react';

interface GateNode {
  id: string;
  name: string;
  x: number;
  y: number;
  terminal: string;
}

const GATES: GateNode[] = [
  { id: 'B1', name: 'Gate B1', x: 100, y: 150, terminal: 'T3' },
  { id: 'B2', name: 'Gate B2', x: 150, y: 120, terminal: 'T3' },
  { id: 'B3', name: 'Gate B3', x: 200, y: 150, terminal: 'T3' },
  { id: 'B4', name: 'Gate B4', x: 250, y: 120, terminal: 'T3' },
  { id: 'B5', name: 'Gate B5', x: 300, y: 150, terminal: 'T3' },
  { id: 'B6', name: 'Gate B6', x: 350, y: 120, terminal: 'T3' },
  { id: 'B7', name: 'Gate B7', x: 600, y: 150, terminal: 'T3' },
  { id: 'B8', name: 'Gate B8', x: 650, y: 120, terminal: 'T3' },
  { id: 'B9', name: 'Gate B9', x: 700, y: 150, terminal: 'T3' },
  { id: 'B10', name: 'Gate B10', x: 750, y: 120, terminal: 'T3' },
  { id: 'B11', name: 'Gate B11', x: 800, y: 150, terminal: 'T3' },
  { id: 'B12', name: 'Gate B12', x: 850, y: 120, terminal: 'T3' }
];

export const TerminalMap: React.FC = () => {
  const { activeFlights, incidents, resolveIncident, triggerManualIncident } = useStore();
  const [selectedGate, setSelectedGate] = useState<GateNode | null>(null);

  // Map flights to gates
  const getFlightAtGate = (gateName: string) => {
    return activeFlights.find((f) => f.gate === gateName && f.status !== 'Arrived' && f.status !== 'Departed');
  };

  // Get gate status color
  const getGateStatusStyles = (gateName: string) => {
    const flight = getFlightAtGate(gateName);
    const hasGateIncident = incidents.some((i) => i.description.includes(gateName) && !i.resolved);
    
    if (hasGateIncident) {
      return {
        fill: 'fill-red-500',
        stroke: 'stroke-red-500',
        glow: 'glow-red',
        label: 'Maintenance Event',
        status: 'INCIDENT'
      };
    }

    if (!flight) {
      return {
        fill: 'fill-slate-600',
        stroke: 'stroke-slate-500',
        glow: '',
        label: 'Gate Idle',
        status: 'IDLE'
      };
    }

    switch (flight.status) {
      case 'Boarding':
        return {
          fill: 'fill-amber-500',
          stroke: 'stroke-amber-400',
          glow: 'glow-amber animate-pulse',
          label: 'Boarding Active',
          status: 'BOARDING'
        };
      case 'Delayed':
        return {
          fill: 'fill-red-500',
          stroke: 'stroke-red-400',
          glow: 'glow-red animate-pulse',
          label: 'Flight Delayed',
          status: 'DELAYED'
        };
      case 'Scheduled':
        return {
          fill: 'fill-blue-500',
          stroke: 'stroke-blue-400',
          glow: 'glow-blue',
          label: 'Pre-flight Prep',
          status: 'SCHEDULED'
        };
      default:
        return {
          fill: 'fill-teal-500',
          stroke: 'stroke-teal-400',
          glow: 'glow-green',
          label: 'Aircraft Grounded',
          status: 'ACTIVE'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 h-full">
      {/* SVG Terminal View */}
      <div className="lg:col-span-3 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 border-b border-blue-500/20 pb-3">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-wide">Terminal 3 Operations Map</h2>
            <p className="text-xs text-slate-400">Live aircraft gate status, boarding phases, and bottleneck alerts</p>
          </div>
          
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Prep</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span> Boarding</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Delayed / Alert</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Idle</span>
          </div>
        </div>

        {/* Vector SVG */}
        <div className="w-full flex-grow flex items-center justify-center min-h-[400px] border border-blue-500/10 rounded-xl bg-slate-950/40 p-4">
          <svg viewBox="0 0 1000 450" className="w-full h-auto text-slate-700">
            {/* Grid Pattern in Background */}
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />

            {/* Radar scanner lines */}
            <circle cx="500" cy="225" r="180" fill="none" stroke="rgba(59, 130, 246, 0.06)" strokeWidth="1.5" />
            <circle cx="500" cy="225" r="300" fill="none" stroke="rgba(59, 130, 246, 0.04)" strokeWidth="1" />

            {/* Terminal Spine Structure */}
            {/* Main Concourse Area */}
            <path
              d="M 100 200 L 900 200 L 900 260 L 100 260 Z"
              fill="rgba(15, 23, 42, 0.6)"
              stroke="rgba(59, 130, 246, 0.25)"
              strokeWidth="2.5"
              className="backdrop-blur-sm"
            />
            {/* Pier North-West */}
            <path d="M 200 200 L 250 110 L 290 110 L 240 200" fill="rgba(15, 23, 42, 0.5)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" />
            {/* Pier North-East */}
            <path d="M 700 200 L 750 110 L 790 110 L 740 200" fill="rgba(15, 23, 42, 0.5)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="2" />
            
            {/* Zones text labels */}
            <g transform="translate(500, 240)" className="text-[11px] font-medium tracking-widest fill-blue-400 opacity-60 text-center">
              <text textAnchor="middle">DEL T3 MAIN CONCOURSE & TRANSIT RETAIL</text>
            </g>

            {/* Zone Areas */}
            {/* Check-In Desk Zone */}
            <g transform="translate(150, 215)">
              <rect width="110" height="30" rx="4" fill="rgba(59, 130, 246, 0.08)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" />
              <text x="55" y="18" textAnchor="middle" className="fill-slate-400 text-[10px] uppercase font-mono">Check-in Desks</text>
            </g>

            {/* Security Screening lanes */}
            <g transform="translate(380, 215)">
              <rect width="130" height="30" rx="4" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" />
              <text x="65" y="18" textAnchor="middle" className="fill-emerald-400 text-[10px] uppercase font-mono">Security Check</text>
            </g>

            {/* Duty Free Duty Shop Zone */}
            <g transform="translate(540, 215)">
              <rect width="130" height="30" rx="4" fill="rgba(139, 92, 246, 0.08)" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" />
              <text x="65" y="18" textAnchor="middle" className="fill-purple-400 text-[10px] uppercase font-mono">Duty Free Shop</text>
            </g>

            {/* Baggage Claim Reclaims */}
            <g transform="translate(710, 215)">
              <rect width="130" height="30" rx="4" fill="rgba(245, 158, 11, 0.08)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" />
              <text x="65" y="18" textAnchor="middle" className="fill-amber-400 text-[10px] uppercase font-mono">Baggage Reclaims</text>
            </g>

            {/* Connection Lines from pier to gates */}
            {GATES.map((g) => (
              <line
                key={`line-${g.id}`}
                x1={g.x}
                y1={g.y}
                x2={g.x}
                y2={200}
                stroke="rgba(59, 130, 246, 0.15)"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            ))}

            {/* Gate Nodes Interactive clickable shapes */}
            {GATES.map((g) => {
              const status = getGateStatusStyles(g.id);
              const flight = getFlightAtGate(g.id);
              const isSelected = selectedGate?.id === g.id;

              return (
                <g
                  key={g.id}
                  transform={`translate(${g.x}, ${g.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedGate(g)}
                >
                  {/* Outer Pulsing Indicator for Selected or Boarding/Alert states */}
                  {((status.status !== 'IDLE') || isSelected) && (
                    <circle
                      r="18"
                      className={`fill-none stroke-2 animate-ping opacity-25 ${status.stroke}`}
                    />
                  )}

                  {/* Gate Base Circle */}
                  <circle
                    r="12"
                    className={`${status.fill} ${status.glow} transition-colors duration-300 stroke-slate-900 stroke-2`}
                  />

                  {/* Icon or Symbol in Gate Node */}
                  {flight ? (
                    <path
                      d="M-4,-4 L4,4 M-4,4 L4,-4"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      className="opacity-70 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <circle r="3" fill="#ffffff" className="opacity-40" />
                  )}

                  {/* Hover ring */}
                  <circle
                    r="16"
                    className="fill-none stroke-blue-400 stroke-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  {/* Gate Label Text */}
                  <text
                    y="-18"
                    textAnchor="middle"
                    className={`font-mono text-[10px] fill-slate-300 font-bold group-hover:fill-blue-400 ${isSelected ? 'fill-blue-400' : ''}`}
                  >
                    {g.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span> Live telemetry updates streaming from DEL database engine. Click any gate circle for diagnostic log.
        </div>
      </div>

      {/* Side Detail Panel / Diagnostics */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Selected Gate Status */}
        <div className="glass-panel rounded-2xl p-5 flex-grow">
          {selectedGate ? (
            (() => {
              const flight = getFlightAtGate(selectedGate.id);
              const statusInfo = getGateStatusStyles(selectedGate.id);
              const hasGateIncident = incidents.find((i) => i.description.includes(selectedGate.id) && !i.resolved);

              return (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b border-blue-500/20 pb-3 mb-4">
                      <div>
                        <span className="font-mono text-2xl font-bold text-white tracking-widest">{selectedGate.id}</span>
                        <span className="text-xs text-slate-400 block">Gate Status: {selectedGate.terminal}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        statusInfo.status === 'BOARDING' ? 'bg-amber-500/20 text-amber-400' :
                        statusInfo.status === 'DELAYED' ? 'bg-red-500/20 text-red-400' :
                        statusInfo.status === 'INCIDENT' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        statusInfo.status === 'SCHEDULED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {statusInfo.status}
                      </span>
                    </div>

                    {hasGateIncident ? (
                      <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 mb-4">
                        <div className="flex gap-2 items-center text-red-400 text-xs font-semibold mb-1">
                          <AlertTriangle size={14} />
                          Active Alert
                        </div>
                        <p className="text-[11px] text-red-200 mb-2">{hasGateIncident.description}</p>
                        <button
                          onClick={() => resolveIncident(hasGateIncident.id)}
                          className="w-full text-center font-mono text-[10px] bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 text-red-300 py-1 rounded transition-colors"
                        >
                          ACKNOWLEDGE & CLEAR ALERT
                        </button>
                      </div>
                    ) : null}

                    {flight ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Plane className="text-blue-400 rotate-45" size={18} />
                          </div>
                          <div>
                            <span className="font-mono text-sm font-bold text-white block">{flight.flightNumber}</span>
                            <span className="text-xs text-slate-400">{flight.airline}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-mono">Routing</span>
                            <span className="font-semibold text-slate-200">{flight.origin} ➔ {flight.destination}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-mono">Aircraft</span>
                            <span className="font-semibold text-slate-200 font-mono">{flight.aircraftType} ({flight.aircraftRegistration})</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-mono">Passengers</span>
                            <span className="font-semibold text-slate-200">{flight.bookedPassengers} / {flight.passengerCapacity}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-mono">Sched Dep</span>
                            <span className="font-semibold text-slate-200 font-mono">{flight.scheduledDeparture.split(' ')[1]}</span>
                          </div>
                        </div>

                        {flight.delayMinutes > 0 && (
                          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <span className="text-amber-400 text-xs font-semibold block mb-1">Delay Incident Log</span>
                            <p className="text-[11px] text-slate-300">Grounded for {flight.delayMinutes} mins. Delay category: **{flight.delayReason}**.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Plane size={24} className="text-slate-700 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-slate-500">No active aircraft docked at this gate position.</p>
                      </div>
                    )}
                  </div>

                  {!hasGateIncident && (
                    <div className="mt-4">
                      <button
                        onClick={() => triggerManualIncident(
                          'Maintenance',
                          `Maintenance Delay at Gate ${selectedGate.id}`,
                          `Aircraft refueling system fault detected at Gate ${selectedGate.id}. Ground team troubleshooting.`,
                          'Warning'
                        )}
                        className="w-full text-center font-mono text-[10px] bg-slate-900 border border-slate-700 hover:border-amber-500/40 text-slate-400 hover:text-amber-400 py-1.5 rounded transition-colors"
                      >
                        REPORT TECHNICAL FAULT
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
              <Plane className="animate-pulse mb-3 text-blue-500/30" size={32} />
              <h3 className="text-sm font-semibold text-slate-300">Terminal Node Diagnostics</h3>
              <p className="text-[11px] px-4 mt-1">Select a gate position on the vector layout to view aircraft status, flight connection data, and operational logs.</p>
            </div>
          )}
        </div>

        {/* Real-time Incident Feed summary */}
        <div className="glass-panel rounded-2xl p-5 h-[160px] flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-blue-500/20 pb-2 mb-2">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">AOCC Incident Radar</span>
            <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
              {incidents.filter((i) => !i.resolved).length} ACTIVE
            </span>
          </div>

          <div className="flex-grow overflow-y-auto pr-1 space-y-2">
            {incidents.filter((i) => !i.resolved).slice(0, 2).map((inc) => (
              <div key={inc.id} className="text-[10px] border-l-2 border-red-500 pl-2 py-0.5">
                <span className="font-semibold text-slate-200 block">{inc.title}</span>
                <span className="text-slate-400 line-clamp-1">{inc.description}</span>
              </div>
            ))}
            {incidents.filter((i) => !i.resolved).length === 0 && (
              <div className="text-slate-500 text-center py-3 text-[11px]">
                System state: nominal. No failures active.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
