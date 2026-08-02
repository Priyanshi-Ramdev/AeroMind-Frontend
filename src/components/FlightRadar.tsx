import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Compass, Wind, ArrowUpRight } from 'lucide-react';

// Deterministic angle based on airport code
const getAirportAngle = (code: string): number => {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 360);
};

const toDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  return new Date(dateStr.replace(' ', 'T'));
};

interface RadarDot {
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  aircraftType: string;
  altitude: number;
  speed: number;
  x: number;
  y: number;
  bearing: number;
  isDeparting: boolean;
  progress: number;
}

export const FlightRadar: React.FC = () => {
  const { flights, simTime } = useStore();
  const [selectedDot, setSelectedDot] = useState<RadarDot | null>(null);

  const cx = 300;
  const cy = 300;
  const maxRadius = 250;

  // Process all flights to see which ones are currently in the air at the simulated time
  const radarDots: RadarDot[] = flights
    .filter((f) => {
      // Must be currently flying (simTime is between actual departure and actual arrival)
      if (!f.actualDeparture || !f.actualArrival) return false;
      const dep = toDate(f.actualDeparture);
      const arr = toDate(f.actualArrival);
      return simTime >= dep && simTime <= arr;
    })
    .map((f) => {
      const dep = toDate(f.actualDeparture);
      const arr = toDate(f.actualArrival);
      
      const totalDuration = arr.getTime() - dep.getTime();
      const elapsed = simTime.getTime() - dep.getTime();
      const progress = totalDuration > 0 ? elapsed / totalDuration : 0;
      
      const isDeparting = f.origin === 'DEL';
      const otherAirport = isDeparting ? f.destination : f.origin;
      const bearing = getAirportAngle(otherAirport);
      const rad = (bearing * Math.PI) / 180;
      
      // Calculate current radius from center
      // Center is DEL (cx, cy).
      // If departing, they start at center and move out.
      // If arriving, they start at edge and move in.
      const radius = isDeparting ? progress * maxRadius : (1 - progress) * maxRadius;
      
      const x = cx + radius * Math.cos(rad);
      const y = cy + radius * Math.sin(rad);

      // Estimate speed based on distance and duration
      const distance = f.distanceKm || 1000;
      const hours = totalDuration / (1000 * 60 * 60) || 1;
      const speed = Math.round(distance / hours);

      return {
        flightNumber: f.flightNumber,
        airline: f.airline,
        origin: f.origin,
        destination: f.destination,
        aircraftType: f.aircraftType,
        altitude: Math.round(f.altitude * (1 - Math.abs(0.5 - progress) * 0.4)) || 32000, // simple flight profile curve
        speed,
        x,
        y,
        bearing,
        isDeparting,
        progress
      };
    });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-4 h-full">
      {/* Radar Screen Visualizer */}
      <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden bg-slate-950/20">
        <div className="w-full flex items-center justify-between mb-4 border-b border-blue-500/20 pb-3 z-10">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-wide">DEL Terminal Airspace Radar</h2>
            <p className="text-xs text-slate-400">Live active arrivals & departures within 250km airspace</p>
          </div>
          <div className="flex gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {radarDots.length} ACTIVE TARGETS
            </span>
          </div>
        </div>

        {/* Circular Radar Plot */}
        <div className="relative w-[600px] h-[600px] max-w-full aspect-square flex items-center justify-center border border-blue-500/10 rounded-full p-2 bg-slate-950/60">
          <svg viewBox="0 0 600 600" className="w-full h-full">
            {/* Center concentric rings */}
            <circle cx="300" cy="300" r="50" fill="none" stroke="rgba(59, 130, 246, 0.25)" strokeDasharray="3 3" />
            <circle cx="300" cy="300" r="100" fill="none" stroke="rgba(59, 130, 246, 0.2)" />
            <circle cx="300" cy="300" r="150" fill="none" stroke="rgba(59, 130, 246, 0.15)" strokeDasharray="3 3" />
            <circle cx="300" cy="300" r="200" fill="none" stroke="rgba(59, 130, 246, 0.1)" />
            <circle cx="300" cy="300" r="250" fill="none" stroke="rgba(59, 130, 246, 0.3)" />

            {/* Radar Crosshairs */}
            <line x1="50" y1="300" x2="550" y2="300" stroke="rgba(59, 130, 246, 0.15)" />
            <line x1="300" y1="50" x2="300" y2="550" stroke="rgba(59, 130, 246, 0.15)" />

            {/* Sweeper overlay */}
            <g className="radar-scanner">
              <line x1="300" y1="300" x2="300" y2="50" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" />
              <path d="M300,300 L300,50 A250,250 0 0,1 550,300 Z" fill="rgba(59, 130, 246, 0.05)" />
            </g>

            {/* Ring Labels */}
            <text x="305" y="245" className="fill-slate-500 text-[9px] font-mono">50KM</text>
            <text x="305" y="195" className="fill-slate-500 text-[9px] font-mono">100KM</text>
            <text x="305" y="145" className="fill-slate-500 text-[9px] font-mono">150KM</text>
            <text x="305" y="95" className="fill-slate-500 text-[9px] font-mono">200KM</text>
            <text x="305" y="45" className="fill-slate-500 text-[9px] font-mono">250KM</text>

            {/* Center target (DEL Airport) */}
            <circle cx="300" cy="300" r="5" fill="#3b82f6" className="animate-pulse" />
            <text x="312" y="304" className="fill-blue-400 font-mono text-[10px] font-bold">DEL (HUB)</text>

            {/* Radar Active Targets */}
            {radarDots.map((dot) => {
              const isSelected = selectedDot?.flightNumber === dot.flightNumber;
              return (
                <g
                  key={dot.flightNumber}
                  className="cursor-pointer group"
                  onClick={() => setSelectedDot(dot)}
                >
                  {/* Outer pulse */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={isSelected ? 10 : 6}
                    className={`fill-none stroke-1 transition-all ${
                      dot.isDeparting ? 'stroke-blue-400 animate-pulse' : 'stroke-emerald-400 animate-pulse'
                    }`}
                  />

                  {/* Flight Dot */}
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="4"
                    className={`${dot.isDeparting ? 'fill-blue-500' : 'fill-emerald-500'} group-hover:scale-125 transition-transform`}
                  />

                  {/* Target Flight Tag label (rendered on screen) */}
                  <text
                    x={dot.x + 8}
                    y={dot.y - 4}
                    className="fill-slate-300 font-mono text-[9px] pointer-events-none group-hover:fill-blue-400 transition-colors"
                  >
                    {dot.flightNumber}
                  </text>
                  <text
                    x={dot.x + 8}
                    y={dot.y + 6}
                    className="fill-slate-500 font-mono text-[8px] pointer-events-none"
                  >
                    {(dot.altitude / 100).toFixed(0)}C
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Target Diagnostics Dashboard */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        <div className="glass-panel rounded-2xl p-6 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 border-b border-blue-500/20 pb-3 mb-4 flex items-center gap-2">
              <Compass size={16} className="text-blue-400" />
              Target Acquisition & Telemetry
            </h3>

            {selectedDot ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-3xl font-extrabold text-white tracking-widest block">{selectedDot.flightNumber}</span>
                    <span className="text-xs text-slate-400">{selectedDot.airline}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    selectedDot.isDeparting
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {selectedDot.isDeparting ? 'OUTBOUND DEPARTURE' : 'INBOUND ARRIVAL'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Route Vector</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5">
                      {selectedDot.origin} ➔ {selectedDot.destination}
                    </span>
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Radar Altitude</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5 flex items-center gap-1">
                      {selectedDot.altitude.toLocaleString()} FT
                      <ArrowUpRight size={14} className="text-blue-400" />
                    </span>
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Ground Speed</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5">
                      {selectedDot.speed} KT
                    </span>
                  </div>

                  <div className="bg-slate-900/30 p-3 rounded-xl border border-blue-500/5">
                    <span className="text-slate-500 block text-[9px] uppercase">Aircraft Class</span>
                    <span className="text-slate-200 text-sm font-bold block mt-0.5">
                      {selectedDot.aircraftType}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>SECTOR BOUNDARY</span>
                    <span>{Math.round(selectedDot.progress * 100)}% EN-ROUTE</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-blue-500/10">
                    <div
                      className={`h-full transition-all duration-500 ${selectedDot.isDeparting ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedDot.progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center">
                <Compass className="animate-spin text-slate-800 mb-3" size={32} style={{ animationDuration: '8s' }} />
                <p className="text-xs">No active transponder selected.</p>
                <p className="text-[10px] px-8 text-slate-600 mt-1">Select any target dot on the radar sweep grid to lock coordinates and pull telemetry.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-blue-500/10 rounded-xl p-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-2 font-mono uppercase tracking-wider text-[10px]">
              <Wind size={14} className="text-blue-400" />
              Airspace Weather Telemetry
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
              <div>Wind: <span className="text-slate-200">240° / 12 KT</span></div>
              <div>Vis: <span className="text-slate-200">&gt; 10 KM</span></div>
              <div>QNH: <span className="text-slate-200">1012 HPA</span></div>
              <div>Temp: <span className="text-slate-200">28°C</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
