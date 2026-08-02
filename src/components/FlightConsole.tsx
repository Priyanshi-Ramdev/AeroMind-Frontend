import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { Plane, Calendar, Hammer, Search, ArrowUpDown, ShieldAlert } from 'lucide-react';

export const FlightConsole: React.FC = () => {
  const { activeFlights, activeMaintenanceLogs } = useStore();
  const [subTab, setSubTab] = useState<'schedules' | 'timeline' | 'maintenance'>('schedules');
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  // Columns for Flight Schedule
  const columns = React.useMemo(() => [
    {
      accessorKey: 'flightNumber',
      header: ({ column }: any) => (
        <button className="flex items-center gap-1 hover:text-white" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          FLIGHT ID <ArrowUpDown size={12} />
        </button>
      ),
      cell: (info: any) => <span className="font-bold text-white">{info.getValue()}</span>
    },
    {
      accessorKey: 'airline',
      header: 'AIRLINE'
    },
    {
      accessorKey: 'routing',
      header: 'ROUTING',
      accessorFn: (row: any) => `${row.origin} ➔ ${row.destination}`
    },
    {
      accessorKey: 'scheduledDeparture',
      header: 'SCHED DEP',
      cell: (info: any) => <span className="font-mono">{info.getValue().split(' ')[1] || info.getValue()}</span>
    },
    {
      accessorKey: 'actualDeparture',
      header: 'ACTUAL DEP',
      cell: (info: any) => <span className="font-mono text-slate-400">{info.getValue().split(' ')[1] || '--:--'}</span>
    },
    {
      accessorKey: 'aircraftType',
      header: 'AIRCRAFT',
      cell: (info: any) => <span className="font-mono">{info.getValue()} ({info.row.original.aircraftRegistration})</span>
    },
    {
      accessorKey: 'gate',
      header: 'GATE',
      cell: (info: any) => <span className="font-mono bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-blue-400 font-bold">{info.getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
            val === 'Boarding' ? 'bg-amber-500/20 text-amber-400' :
            val === 'Delayed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            val === 'Departed' ? 'bg-blue-500/20 text-blue-400' :
            val === 'Arrived' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-slate-800 text-slate-400'
          }`}>
            {val}
          </span>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: activeFlights,
    columns,
    state: {
      sorting,
      globalFilter: search
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div className="space-y-6 p-4">
      {/* Sub-Navigation Control */}
      <div className="flex border-b border-blue-500/20 pb-1">
        <button
          onClick={() => setSubTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-b-2 transition-all ${
            subTab === 'schedules'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plane size={16} />
          FLIGHT SCHEDULES
        </button>

        <button
          onClick={() => setSubTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-b-2 transition-all ${
            subTab === 'timeline'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar size={16} />
          GATE TIMELINE
        </button>

        <button
          onClick={() => setSubTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-sm border-b-2 transition-all ${
            subTab === 'maintenance'
              ? 'border-blue-500 text-white font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hammer size={16} />
          AIRCRAFT ENGINEERING ({activeMaintenanceLogs.length})
        </button>
      </div>

      {/* schedules Tab view */}
      {subTab === 'schedules' && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-wide">Departure & Arrival Board</h2>
              <p className="text-xs text-slate-400">Live operational flight deck for air traffic supervisors</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search Flight ID / Airline / Dest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-blue-500/20 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-blue-500/10 text-slate-500">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="py-2.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-blue-500/5 text-slate-300">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-500/5 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-slate-500">
                      No matching flight logs found in active schedules.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* timeline Tab view */}
      {subTab === 'timeline' && (
        <div className="glass-panel rounded-2xl p-6">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-wide mb-1">Gate Reservation Gantry</h2>
            <p className="text-xs text-slate-400 mb-6">Real-time terminal gates occupancy schedules timeline</p>
          </div>

          <div className="space-y-4">
            {['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12'].map((gateId) => {
              // Find flights assigned to this gate
              const gateFlights = activeFlights.filter((f) => f.gate === gateId);
              
              return (
                <div key={gateId} className="flex items-center gap-4 bg-slate-950/40 p-2.5 rounded-xl border border-blue-500/5 hover:border-blue-500/10 transition-colors">
                  <div className="w-14 font-mono font-bold text-center text-sm bg-slate-900 border border-slate-700 py-1 rounded text-blue-400 glow-blue">
                    {gateId}
                  </div>

                  <div className="flex-grow flex gap-2 overflow-x-auto min-h-[36px] items-center">
                    {gateFlights.length > 0 ? (
                      gateFlights.map((f) => (
                        <div
                          key={f.flightNumber}
                          className={`font-mono text-[10px] px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 shrink-0 ${
                            f.status === 'Boarding' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                            f.status === 'Delayed' ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse' :
                            f.status === 'Departed' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <Plane size={10} className="rotate-45" />
                          {f.flightNumber} ({f.status}) | Sched: {f.scheduledDeparture.split(' ')[1]}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-600 italic">No flights scheduled at gate position</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* maintenance Tab view */}
      {subTab === 'maintenance' && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white tracking-wide mb-1">Aircraft Defects & Maintenance Registry</h2>
            <p className="text-xs text-slate-400">Live hangar work orders and scheduled airframe inspections</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeMaintenanceLogs.map((log) => (
              <div
                key={log.workOrderId}
                className={`border p-5 rounded-2xl flex flex-col justify-between h-[190px] transition-all ${
                  log.isCritical
                    ? 'bg-red-950/15 border-red-500/30 glow-red'
                    : 'bg-slate-900/30 border-blue-500/15 hover:border-blue-500/30'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-white block">{log.aircraftRegistration}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Flight Ref: {log.flightNumber || 'None'}</span>
                    </div>

                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                      log.isCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {log.isCritical ? 'CRITICAL DEFECT' : 'ROUTINE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium line-clamp-2 mt-2">
                    Issue: <span className="text-slate-300 font-normal">{log.issue}</span>
                  </p>
                  
                  <p className="text-xs text-slate-400 mt-1">
                    Action: <span className="text-slate-300 font-normal">{log.action || 'Diagnostics underway'}</span>
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-blue-500/10 pt-3 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><Hammer size={12} /> Priority {log.priority}</span>
                  <span>Order: {log.workOrderId}</span>
                </div>
              </div>
            ))}
            {activeMaintenanceLogs.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-500 flex flex-col items-center justify-center">
                <ShieldAlert className="text-slate-800 mb-2" size={32} />
                <p className="text-xs font-semibold">Zero Active Work Orders</p>
                <p className="text-[10px] text-slate-600 mt-1">All aircraft currently logged in terminal report fully operational.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
