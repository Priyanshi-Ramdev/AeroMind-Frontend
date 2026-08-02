import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { TerminalMap } from './components/TerminalMap';
import { FlightRadar } from './components/FlightRadar';
import { FlightConsole } from './components/FlightConsole';
import { SecurityFlow } from './components/SecurityFlow';
import { BaggageBelt } from './components/BaggageBelt';
import { RosterCoordination } from './components/RosterCoordination';
import { RetailConsole } from './components/RetailConsole';
import { AICopilot } from './components/AICopilot';
import { OpsTerminal } from './components/OpsTerminal';
import {
  Activity,
  Plane,
  Shield,
  Package,
  Users,
  ShoppingBag,
  Play,
  Pause,
  AlertTriangle,
  Radio,
  Clock,
  ChevronRight
} from 'lucide-react';

function App() {
  const {
    loading,
    loadAllData,
    simTime,
    simSpeed,
    isSimulating,
    setSimSpeed,
    toggleSimulation,
    tickSimulation,
    metrics,
    incidents
  } = useStore();

  const [activeTab, setActiveTab] = useState<'map' | 'radar' | 'flights' | 'security' | 'baggage' | 'roster' | 'retail'>('map');

  // Trigger initial load of CSV datasets
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Set up the simulation tick timer (ticking every 1s of real time)
  useEffect(() => {
    let timer: any;
    if (isSimulating && !loading) {
      timer = setInterval(() => {
        tickSimulation(1); // ticks by 1 real-time second multiplied by speed in Zustand
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSimulating, loading, tickSimulation]);

  const formatClockTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080718] text-white">
        <div className="relative flex flex-col items-center justify-center p-8 glass-panel rounded-3xl border border-blue-500/20 max-w-md w-full">
          <Activity className="animate-spin text-blue-500 mb-6" size={48} style={{ animationDuration: '3s' }} />
          <h1 className="text-xl font-bold font-mono tracking-widest text-glow-blue">AEROMIND AOCC</h1>
          <p className="text-xs text-slate-400 mt-2 text-center">Synchronizing live operational datasets for Indira Gandhi International Airport (DEL)...</p>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-6 border border-blue-500/10">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const activeAlertsCount = incidents.filter((i) => !i.resolved).length;

  return (
    <div className="min-h-screen bg-[#080718] text-slate-200 flex flex-col overflow-hidden">
      {/* Top Banner Control Room Header */}
      <header className="glass-panel border-b border-blue-500/20 px-6 py-4 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 shadow-lg">
        {/* Brand logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/30 rounded-xl glow-blue">
            <Activity className="text-blue-500 animate-pulse" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-widest font-mono text-white m-0 text-glow-blue">AEROMIND</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">AIRPORT OPERATIONS COMMAND CENTER (DEL)</p>
          </div>
        </div>

        {/* Central clock and simulation controllers */}
        <div className="flex items-center gap-6 bg-slate-950/60 px-5 py-2.5 rounded-2xl border border-blue-500/15">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-400" size={16} />
            <span className="font-mono text-sm font-bold text-white tracking-widest text-glow-blue">
              {formatClockTime(simTime)}
            </span>
          </div>

          <div className="w-px h-6 bg-blue-500/10" />

          {/* Simulation controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className={`p-1.5 rounded-lg border transition-all ${
                isSimulating
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title={isSimulating ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Speed selectors */}
            <div className="flex gap-1.5 text-[10px] font-mono">
              {[1, 5, 15, 60].map((s) => (
                <button
                  key={s}
                  onClick={() => setSimSpeed(s)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    simSpeed === s
                      ? 'bg-blue-600 text-white border-blue-500 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {s}X
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Threat Level & Alerts */}
        <div className="flex items-center gap-4">
          {/* Threats status */}
          <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">THREAT LEVEL:</span>
            <span className="text-emerald-400 font-bold">ALPHA (NOMINAL)</span>
          </div>

          {/* Active alerts count */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono font-bold ${
            activeAlertsCount > 0
              ? 'bg-red-500/15 border-red-500/35 text-red-400 glow-red animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}>
            <AlertTriangle size={14} />
            {activeAlertsCount} WARNINGS
          </div>
        </div>
      </header>

      {/* Main dashboard content view */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Side Tab Navigation */}
        <nav className="w-64 glass-panel border-r border-blue-500/15 p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block mb-3 pl-3">OPERATIONAL UNITS</span>
            
            <button
              onClick={() => setActiveTab('map')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'map'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Activity size={15} />
                TERMINAL 3 MAP
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'radar'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Radio size={15} />
                AIRSPACE RADAR
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('flights')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'flights'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Plane size={15} />
                FLIGHT DECK
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'security'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Shield size={15} />
                SECURITY FLOW
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('baggage')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'baggage'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Package size={15} />
                BAGGAGE BELTS
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'roster'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Users size={15} />
                WORKFORCE ROSTER
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab('retail')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'retail'
                  ? 'bg-blue-600/10 border border-blue-500/40 text-white font-bold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/35'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShoppingBag size={15} />
                RETAIL CONSOLE
              </span>
              <ChevronRight size={12} className="opacity-50" />
            </button>
          </div>

          {/* Mini Live Telemetry Panel in Navigation bottom */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-blue-500/10 space-y-3">
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block border-b border-blue-500/10 pb-1.5">LIVE STATISTICS</span>
            
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Delay Rate:</span>
              <span className={`font-bold ${metrics.delayRate > 20 ? 'text-red-400' : 'text-slate-300'}`}>
                {metrics.delayRate.toFixed(0)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Sec Wait:</span>
              <span className="text-slate-300 font-bold">{metrics.avgSecurityWaitMins.toFixed(1)}m</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Bag backlog:</span>
              <span className="text-slate-300 font-bold">{metrics.baggageBacklog}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Retail Rev:</span>
              <span className="text-emerald-400 font-bold">${Math.round(metrics.totalRetailRevenue).toLocaleString()}</span>
            </div>
          </div>
        </nav>

        {/* Central Operations Viewport */}
        <main className="flex-grow overflow-y-auto bg-slate-950/30">
          {activeTab === 'map' && <TerminalMap />}
          {activeTab === 'radar' && <FlightRadar />}
          {activeTab === 'flights' && <FlightConsole />}
          {activeTab === 'security' && <SecurityFlow />}
          {activeTab === 'baggage' && <BaggageBelt />}
          {activeTab === 'roster' && <RosterCoordination />}
          {activeTab === 'retail' && <RetailConsole />}
        </main>
      </div>

      {/* Floating Copilot and CLI terminal widgets */}
      <AICopilot />
      <OpsTerminal />
    </div>
  );
}

export default App;
