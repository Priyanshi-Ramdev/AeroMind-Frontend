import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Terminal as TerminalIcon, X, ChevronRight, Play } from 'lucide-react';

// Web Audio API Synthesizer to play high-tech sound effects
const playBeep = (freq = 800, type: OscillatorType = 'sine', duration = 0.1) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio autoplay block errors
  }
};

export const OpsTerminal: React.FC = () => {
  const {
    simTime,
    activeFlights,
    triggerManualIncident,
    clearIncidents,
    incidents
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([
    'AEROMIND AOCC DISPATCH TERMINAL [SECURE SHELL v1.4]',
    'Ready. Type "help" to list dispatcher command codes.',
    ''
  ]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    // Play keyboard mechanical key click sound
    playBeep(1000, 'sine', 0.02);

    const parts = cmd.toLowerCase().split(' ');
    const mainCommand = parts[0];

    const newHistory = [...history, `aocc_operator@del-t3:~$ ${cmd}`];

    switch (mainCommand) {
      case 'help':
        newHistory.push(
          '------------------------------------------------------------------',
          'AVAILABLE COMMAND INTERFACE CODES:',
          '  help                 - Display command help console',
          '  sysinfo              - Read parsing telemetry & loaded datasets',
          '  flights              - List total active en-route flights',
          '  alert [cat]          - Simulate threat warning at DEL hub',
          '                         Categories: atc, security, baggage, maint',
          '  resolve all          - Resolve all active threat notifications',
          '  clear                - Reset the terminal logs screen',
          '  time                 - Print local and simulated AOCC timestamps',
          '------------------------------------------------------------------'
        );
        break;

      case 'sysinfo':
        newHistory.push(
          'SYSTEM DATA LOAD TELEMETRY:',
          `  - Flights Logs: ${activeFlights.length} en-route transponders tracking`,
          `  - Live Alerts: ${incidents.filter(i => !i.resolved).length} unhandled`,
          '  - Active Theme: Synthwave-Cyberpunk Glassmorphism V4',
          '  - Audio Telemetry Engine: Web Audio API Oscillator Nodes [ACTIVE]',
          '  - Connection Mode: Local Loopback SECURE'
        );
        break;

      case 'flights':
        if (activeFlights.length === 0) {
          newHistory.push('  No active en-route flights detected at this simulation timestamp.');
        } else {
          newHistory.push('ACTIVE FLIGHT INVENTORY TRANSIT LOGS:');
          activeFlights.slice(0, 5).forEach((f) => {
            newHistory.push(
              `  * ${f.flightNumber} to ${f.destination} | Alt: ${f.altitude}ft | Gate: ${f.gate || 'TAXING'} | Status: ${f.status}`
            );
          });
          if (activeFlights.length > 5) {
            newHistory.push(`  ... and ${activeFlights.length - 5} more en-route targets.`);
          }
        }
        break;

      case 'alert':
        const cat = parts[1];
        // Alarm sound: double beep
        playBeep(440, 'triangle', 0.15);
        setTimeout(() => playBeep(440, 'triangle', 0.15), 180);

        if (cat === 'atc') {
          triggerManualIncident(
            'ATC',
            'GPS Spoofing Alert',
            'Unauthorized telemetry interference reported in airspace sector 4.',
            'Critical'
          );
          newHistory.push('[CRITICAL ALARM] Dispatching GPS spoofing threat alert to ATC Airspace radar...');
        } else if (cat === 'security') {
          triggerManualIncident(
            'Security',
            'Terminal Congestion',
            'Wait time at Security Checkpoint T3-B exceeded 25 minutes.',
            'Warning'
          );
          newHistory.push('[WARNING ALERT] Dispatching terminal passenger overflow alert to flow monitors...');
        } else if (cat === 'baggage') {
          triggerManualIncident(
            'Baggage',
            'Conveyor Mechanical Jam',
            'Baggage carousel belt 3 sorting motor failure detected.',
            'Critical'
          );
          newHistory.push('[CRITICAL ALARM] Dispatching mechanical belt failure alert to baggage handling...');
        } else if (cat === 'maint') {
          triggerManualIncident(
            'Maintenance',
            'Jetbridge Hydraulic Failure',
            'Jet bridge A3 reported hydraulic oil leak during boarding.',
            'Warning'
          );
          newHistory.push('[WARNING ALERT] Dispatching gate infrastructure malfunction warning...');
        } else {
          newHistory.push('  Error: Specify alert category: atc, security, baggage, maint. Example: "alert atc"');
        }
        break;

      case 'resolve':
        if (parts[1] === 'all') {
          clearIncidents();
          playBeep(880, 'sine', 0.1);
          newHistory.push('  All simulated operations center alerts have been successfully resolved.');
        } else {
          newHistory.push('  Error: specify target. Example: "resolve all"');
        }
        break;

      case 'clear':
        setHistory([
          'AEROMIND AOCC DISPATCH TERMINAL [SECURE SHELL v1.4]',
          'Ready. Type "help" to list dispatcher command codes.',
          ''
        ]);
        setInput('');
        return;

      case 'time':
        newHistory.push(
          `  - Simulated Clock Time: ${simTime.toISOString().replace('T', ' ').substring(0, 19)}`,
          `  - Real-Time Timestamp: ${new Date().toLocaleTimeString()}`
        );
        break;

      default:
        newHistory.push(`  Command error: "${cmd}" code not recognized. Type "help" to review manual.`);
        break;
    }

    newHistory.push('');
    setHistory(newHistory);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            playBeep(600, 'sine', 0.05);
          }}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 hover:bg-slate-800 text-[#06b6d4] rounded-full shadow-lg border border-[#06b6d4]/40 glow-blue text-xs uppercase font-mono transition-all font-semibold"
        >
          <TerminalIcon size={16} />
          dispatcher terminal
        </button>
      )}

      {/* Slide-out Bottom terminal console */}
      {isOpen && (
        <div className="w-[360px] md:w-[480px] h-[340px] glass-panel rounded-2xl flex flex-col overflow-hidden border border-[#06b6d4]/30 shadow-2xl transition-all duration-300">
          {/* Header */}
          <div className="bg-slate-950/90 border-b border-[#06b6d4]/20 px-4 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TerminalIcon className="text-[#06b6d4]" size={14} />
              <span className="font-mono text-xs font-bold text-slate-100 tracking-wider">AOCC_DISPATCH_CLI</span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                playBeep(400, 'sine', 0.05);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* CLI Logs Screen */}
          <div className="flex-grow overflow-y-auto p-4 bg-slate-950/80 font-mono text-[11px] text-cyan-400 space-y-1.5 scrollbar-thin">
            {history.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-normal">
                {line.startsWith('aocc_operator') ? (
                  <span>
                    <span className="text-purple-400">aocc_operator@del-t3</span>
                    <span className="text-slate-400">:~$</span>{' '}
                    <span className="text-slate-200">{line.split(':~$ ')[1]}</span>
                  </span>
                ) : line.includes('[CRITICAL') ? (
                  <span className="text-rose-400 font-bold">{line}</span>
                ) : line.includes('[WARNING') ? (
                  <span className="text-amber-400 font-bold">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Form Command input */}
          <form
            onSubmit={handleCommandSubmit}
            className="p-2 border-t border-[#06b6d4]/20 bg-slate-900 flex items-center gap-1.5 shrink-0"
          >
            <ChevronRight className="text-[#06b6d4]" size={14} />
            <input
              type="text"
              placeholder="Enter operations command code..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-slate-950 border border-[#06b6d4]/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-[#06b6d4]/50 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 bg-[#06b6d4]/20 hover:bg-[#06b6d4]/40 text-[#06b6d4] rounded-lg transition-all border border-[#06b6d4]/30"
            >
              <Play size={12} fill="currentColor" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
