import { create } from 'zustand';
import type {
  Flight,
  Passenger,
  Baggage,
  GateEvent,
  SecurityScreening,
  MaintenanceLog,
  StaffShift,
  RetailTransaction
} from '../utils/csvParser';
import {
  parseFlights,
  parsePassengers,
  parseBaggage,
  parseGateEvents,
  parseSecurityScreening,
  parseMaintenanceLogs,
  parseStaffShifts,
  parseRetailTransactions
} from '../utils/csvParser';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  text: string;
}

interface Incident {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  category: 'ATC' | 'Security' | 'Maintenance' | 'Baggage' | 'Weather';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface AOCCState {
  // Loading states
  loading: boolean;
  
  // Raw data from CSV
  flights: Flight[];
  passengers: Passenger[];
  baggage: Baggage[];
  gateEvents: GateEvent[];
  securityScreening: SecurityScreening[];
  maintenanceLogs: MaintenanceLog[];
  staffShifts: StaffShift[];
  retailTransactions: RetailTransaction[];

  // Simulation Clock
  simTime: Date;
  simSpeed: number; // 0 = Paused, 1 = 1x (1min/sec), 5 = 5x, 15 = 15x, 60 = 60x
  isSimulating: boolean;

  // Active / Filtered lists (derived based on simTime)
  activeFlights: Flight[];
  activePassengers: Passenger[];
  activeBaggage: Baggage[];
  activeGateEvents: GateEvent[];
  activeSecurityScreenings: SecurityScreening[];
  activeMaintenanceLogs: MaintenanceLog[];
  activeStaffShifts: StaffShift[];
  activeRetailTransactions: RetailTransaction[];

  // Operations metrics
  metrics: {
    delayRate: number;
    baggageBacklog: number;
    avgSecurityWaitMins: number;
    totalRetailRevenue: number;
    activeIncidentsCount: number;
  };

  // Incident Alerts
  incidents: Incident[];

  // AI Copilot
  copilotMessages: CopilotMessage[];

  // Actions
  loadAllData: () => Promise<void>;
  setSimSpeed: (speed: number) => void;
  toggleSimulation: () => void;
  tickSimulation: (deltaSeconds: number) => void;
  triggerManualIncident: (category: 'ATC' | 'Security' | 'Maintenance' | 'Baggage' | 'Weather', title: string, description: string, severity: 'Critical' | 'Warning' | 'Info') => void;
  resolveIncident: (id: string) => void;
  clearIncidents: () => void;
  sendCopilotMessage: (text: string) => void;
  resetSimulationClock: (dateStr: string) => void;
}

// Convert CSV Date string format to JavaScript Date
const toDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  // Handle Date only string like '2024-12-29'
  if (dateStr.length === 10) {
    return new Date(`${dateStr}T00:00:00`);
  }
  return new Date(dateStr.replace(' ', 'T'));
};

export const useStore = create<AOCCState>((set, get) => ({
  loading: true,
  flights: [],
  passengers: [],
  baggage: [],
  gateEvents: [],
  securityScreening: [],
  maintenanceLogs: [],
  staffShifts: [],
  retailTransactions: [],

  // Start the simulation clock on November 11, 2024, at 12:00:00 PM (a peak operations day in the dataset)
  simTime: new Date('2024-11-11T12:00:00'),
  simSpeed: 5, // 5 minutes pass per real second
  isSimulating: true,

  activeFlights: [],
  activePassengers: [],
  activeBaggage: [],
  activeGateEvents: [],
  activeSecurityScreenings: [],
  activeMaintenanceLogs: [],
  activeStaffShifts: [],
  activeRetailTransactions: [],

  metrics: {
    delayRate: 0,
    baggageBacklog: 0,
    avgSecurityWaitMins: 0,
    totalRetailRevenue: 0,
    activeIncidentsCount: 0
  },

  incidents: [
    {
      id: 'init-1',
      type: 'Info',
      category: 'ATC',
      title: 'AOCC Control System Initialized',
      description: 'Central operations monitoring active for Indira Gandhi International Airport (DEL).',
      timestamp: new Date('2024-11-11T12:00:00'),
      resolved: false
    }
  ],

  copilotMessages: [
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: new Date(),
      text: 'Good afternoon, commander. I am your AOCC Operations Copilot. I monitor our live datasets in real-time. Ask me anything about flights, baggage status, gate operations, maintenance logs, or staff shifts.'
    }
  ],

  loadAllData: async () => {
    set({ loading: true });
    try {
      const [
        flights,
        passengers,
        baggage,
        gateEvents,
        securityScreening,
        maintenanceLogs,
        staffShifts,
        retailTransactions
      ] = await Promise.all([
        parseFlights(),
        parsePassengers(),
        parseBaggage(),
        parseGateEvents(),
        parseSecurityScreening(),
        parseMaintenanceLogs(),
        parseStaffShifts(),
        parseRetailTransactions()
      ]);

      set({
        flights,
        passengers,
        baggage,
        gateEvents,
        securityScreening,
        maintenanceLogs,
        staffShifts,
        retailTransactions,
        loading: false
      });

      // Initialize derived lists for the starting simulated time
      get().tickSimulation(0);
    } catch (error) {
      console.error('Failed to load datasets', error);
      set({ loading: false });
    }
  },

  setSimSpeed: (speed) => set({ simSpeed: speed }),

  toggleSimulation: () => set((state) => ({ isSimulating: !state.isSimulating })),

  resetSimulationClock: (dateStr) => {
    set({ simTime: new Date(dateStr) });
    get().tickSimulation(0);
  },

  tickSimulation: (deltaSeconds) => {
    const {
      flights,
      passengers,
      baggage,
      gateEvents,
      securityScreening,
      maintenanceLogs,
      staffShifts,
      retailTransactions,
      simTime,
      simSpeed,
      isSimulating
    } = get();

    // Calculate new simulated time
    // If not simulating, just update filtered items for the current simTime (speed = 0 or paused)
    const timeDeltaMs = isSimulating ? deltaSeconds * 1000 * 60 * simSpeed : 0;
    const newSimTime = new Date(simTime.getTime() + timeDeltaMs);

    // 1. Filter and Dynamically Update Active Flights
    // A flight is active if its scheduled time is within a 12-hour window (+/- 6 hours) of simTime
    const activeFlights = flights
      .filter((f) => {
        const schedTime = toDate(f.scheduledDeparture || f.scheduledArrival);
        const diffHours = Math.abs(schedTime.getTime() - newSimTime.getTime()) / (1000 * 60 * 60);
        return diffHours <= 6;
      })
      .map((f) => {
        // DYNAMIC STATUS UPDATE based on simulated clock
        const schedDep = toDate(f.scheduledDeparture);
        const actualDep = toDate(f.actualDeparture);
        const actualArr = toDate(f.actualArrival);

        let dynamicStatus = f.status;

        if (newSimTime < new Date(schedDep.getTime() - 90 * 60 * 1000)) {
          dynamicStatus = 'Scheduled';
        } else if (newSimTime < actualDep && newSimTime >= new Date(schedDep.getTime() - 60 * 60 * 1000)) {
          dynamicStatus = 'Boarding';
        } else if (newSimTime >= actualDep && newSimTime < actualArr) {
          dynamicStatus = 'Departed';
        } else if (newSimTime >= actualArr) {
          dynamicStatus = 'Arrived';
        }

        // Apply delay status override if the delay is significant
        if (f.delayMinutes > 20 && dynamicStatus !== 'Arrived' && dynamicStatus !== 'Departed') {
          dynamicStatus = 'Delayed';
        }

        return { ...f, status: dynamicStatus };
      });

    // 2. Filter Active Gate Events (linked by gate and active flights)
    const activeGateEvents = gateEvents.filter((ge) => {
      const geTime = toDate(ge.timestamp);
      // Within +/- 3 hours of simTime
      const diffHours = Math.abs(geTime.getTime() - newSimTime.getTime()) / (1000 * 60 * 60);
      return diffHours <= 3;
    });

    // 3. Filter Active Passengers (linked to active flights)
    const activeFlightNumbers = new Set(activeFlights.map((f) => f.flightNumber));
    const activePassengers = passengers.filter((p) => activeFlightNumbers.has(p.flightNumber));

    // 4. Filter Active Baggage (linked to active flights)
    const activeBaggage = baggage
      .filter((b) => activeFlightNumbers.has(b.flightNumber))
      .map((b) => {
        // Dynamic baggage status transitions based on flight timing
        const flight = activeFlights.find((f) => f.flightNumber === b.flightNumber);
        if (!flight) return b;

        const depTime = toDate(flight.actualDeparture);
        let dynamicBaggageStatus = b.status;

        if (newSimTime >= depTime) {
          dynamicBaggageStatus = 'Transit';
        } else if (newSimTime >= new Date(depTime.getTime() - 30 * 60 * 1000)) {
          dynamicBaggageStatus = 'Loaded';
        } else if (newSimTime >= new Date(depTime.getTime() - 120 * 60 * 1000)) {
          dynamicBaggageStatus = 'Check-in';
        }

        return { ...b, status: dynamicBaggageStatus };
      });

    // 5. Filter Security Screenings (linked to active flight passengers)
    const activePassportHashes = new Set(activePassengers.map((p) => p.passportHash));
    const activeSecurityScreenings = securityScreening.filter((ss) => {
      const ssTime = toDate(ss.checkpointTime);
      return ssTime <= newSimTime && activePassportHashes.has(ss.passportHash);
    });

    // 6. Filter Active Maintenance Logs (aircraft registration active or log within +/- 12 hours)
    const activeAircraftRegs = new Set(activeFlights.map((f) => f.aircraftRegistration));
    const activeMaintenanceLogs = maintenanceLogs.filter((ml) => {
      const mlStart = toDate(ml.scheduledStart);
      const mlEnd = toDate(ml.completedAt);
      const isAircraftActive = activeAircraftRegs.has(ml.aircraftRegistration);
      const isTimeActive = newSimTime >= mlStart && newSimTime <= mlEnd;
      return isAircraftActive || isTimeActive;
    });

    // 7. Filter Active Staff Shifts
    const activeStaffShifts = staffShifts.filter((ss) => {
      const shiftDateStr = ss.shiftDate; // e.g., '2024-12-29'
      const simDateStr = newSimTime.toISOString().split('T')[0];
      
      if (shiftDateStr !== simDateStr) return false;
      
      // Check start/end hours
      try {
        const startHour = parseInt(ss.startTime.split(':')[0]) || 0;
        const endHour = parseInt(ss.endTime.split(':')[0]) || 24;
        const simHour = newSimTime.getHours();
        return simHour >= startHour && simHour <= endHour;
      } catch {
        return true;
      }
    });

    // 8. Filter Retail Transactions up to current simulated time
    const activeRetailTransactions = retailTransactions.filter((rt) => {
      const rtTime = toDate(rt.timestamp);
      const sameDay = rtTime.toDateString() === newSimTime.toDateString();
      const occurred = rtTime <= newSimTime;
      return sameDay && occurred;
    });

    // Compute live operational metrics
    const totalFlights = activeFlights.length;
    const delayedFlights = activeFlights.filter((f) => f.status === 'Delayed').length;
    const delayRate = totalFlights > 0 ? (delayedFlights / totalFlights) * 100 : 0;

    const baggageBacklog = activeBaggage.filter((b) => b.status === 'Check-in').length;
    
    // Average security screening duration
    const completedScreenings = activeSecurityScreenings.slice(-100); // last 100 screenings
    const totalDuration = completedScreenings.reduce((sum, item) => sum + item.durationSecs, 0);
    const avgSecurityWaitMins = completedScreenings.length > 0 ? (totalDuration / completedScreenings.length) / 60 : 5;

    // Total retail revenue accumulated today
    const totalRetailRevenue = activeRetailTransactions.reduce((sum, item) => sum + item.amountUsd, 0);

    // Auto-trigger alerts based on metrics to simulate real-time anomalies
    const newIncidents = [...get().incidents];
    
    // Anomaly 1: Security lane backup
    if (avgSecurityWaitMins > 1.2 && !newIncidents.some((i) => i.title.includes('Security Lane Delay') && !i.resolved)) {
      newIncidents.push({
        id: `auto-sec-${newSimTime.getTime()}`,
        type: 'Warning',
        category: 'Security',
        title: 'Security Lane Congestion Alert',
        description: `Average checkpoint screening duration has risen to ${avgSecurityWaitMins.toFixed(1)} minutes. Secondary checks are requested.`,
        timestamp: newSimTime,
        resolved: false
      });
    }

    // Anomaly 2: High Delay Rate
    if (delayRate > 25 && !newIncidents.some((i) => i.title.includes('Departure Delays') && !i.resolved)) {
      newIncidents.push({
        id: `auto-del-${newSimTime.getTime()}`,
        type: 'Critical',
        category: 'ATC',
        title: 'High Departure Delays Logged',
        description: `${delayRate.toFixed(0)}% of flights currently departing are delayed. Air Traffic Control holds are active.`,
        timestamp: newSimTime,
        resolved: false
      });
    }

    // Anomaly 3: Baggage handling backlog
    if (baggageBacklog > 150 && !newIncidents.some((i) => i.title.includes('Baggage Handling') && !i.resolved)) {
      newIncidents.push({
        id: `auto-bag-${newSimTime.getTime()}`,
        type: 'Critical',
        category: 'Baggage',
        title: 'Baggage Sorting Belt Jam',
        description: `Baggage backlog in sorting belt stands at ${baggageBacklog} bags. Ground crew dispatch requested.`,
        timestamp: newSimTime,
        resolved: false
      });
    }

    set({
      simTime: newSimTime,
      activeFlights,
      activeGateEvents,
      activePassengers,
      activeBaggage,
      activeSecurityScreenings,
      activeMaintenanceLogs,
      activeStaffShifts,
      activeRetailTransactions,
      incidents: newIncidents,
      metrics: {
        delayRate,
        baggageBacklog,
        avgSecurityWaitMins,
        totalRetailRevenue,
        activeIncidentsCount: newIncidents.filter((i) => !i.resolved).length
      }
    });
  },

  triggerManualIncident: (category, title, description, severity) => {
    const { simTime } = get();
    const newIncident: Incident = {
      id: `manual-${Date.now()}`,
      type: severity,
      category,
      title,
      description,
      timestamp: new Date(simTime),
      resolved: false
    };

    set((state) => ({
      incidents: [newIncident, ...state.incidents],
      metrics: {
        ...state.metrics,
        activeIncidentsCount: state.metrics.activeIncidentsCount + 1
      }
    }));
  },

  resolveIncident: (id) => {
    set((state) => {
      const updated = state.incidents.map((i) => {
        if (i.id === id) return { ...i, resolved: true };
        return i;
      });
      return {
        incidents: updated,
        metrics: {
          ...state.metrics,
          activeIncidentsCount: updated.filter((i) => !i.resolved).length
        }
      };
    });
  },

  clearIncidents: () => {
    set((state) => ({
      incidents: [],
      metrics: {
        ...state.metrics,
        activeIncidentsCount: 0
      }
    }));
  },

  sendCopilotMessage: (text) => {
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date(),
      text
    };

    set((state) => ({
      copilotMessages: [...state.copilotMessages, userMessage]
    }));

    // Generate simulated AI Response after a small delay
    setTimeout(() => {
      const {
        activeFlights,
        activeSecurityScreenings,
        activeMaintenanceLogs,
        activeStaffShifts,
        activeRetailTransactions,
        incidents
      } = get();

      const query = text.toLowerCase();
      let reply = '';

      if (query.includes('flight') || query.includes('status')) {
        // Search flights
        const match = activeFlights.find(
          (f) => query.includes(f.flightNumber.toLowerCase()) || query.includes(f.airline.toLowerCase())
        );

        if (match) {
          reply = `📋 **Flight ${match.flightNumber} Status Report:**\n` +
                  `• Airline: ${match.airline}\n` +
                  `• Routing: ${match.origin} ➔ ${match.destination}\n` +
                  `• Gate Assignment: Terminal ${match.terminal}, Gate ${match.gate}\n` +
                  `• Current Phase: **${match.status}**\n` +
                  `• Capacity/Booked: ${match.passengerCapacity} / ${match.bookedPassengers} (${Math.round((match.bookedPassengers/match.passengerCapacity)*100)}% Load)\n` +
                  `${match.delayMinutes > 0 ? `• Delay: ${match.delayMinutes} mins (${match.delayReason})` : '• Delay: On-time'}`;
        } else {
          const delays = activeFlights.filter((f) => f.status === 'Delayed');
          reply = `✈️ There are currently **${activeFlights.length}** flights in our active window. ` +
                  `**${delays.length}** flights are delayed due to air traffic or weather. ` +
                  `Ask me about a specific flight, like: *"status UK-633"* or *"flight SQ-3327"* to get detailed readouts.`;
        }
      } else if (query.includes('security') || query.includes('queue') || query.includes('screening')) {
        const secondaryCount = activeSecurityScreenings.filter((ss) => ss.status === 'Secondary').length;
        const alarmsCount = activeSecurityScreenings.filter((ss) => ss.alarmTriggered).length;
        
        reply = `🛡️ **Security Checkpoint Summary:**\n` +
                `• Active lanes under monitoring: **XRAY-1, XRAY-2, XRAY-3**\n` +
                `• Current processed passengers: **${activeSecurityScreenings.length}**\n` +
                `• Alarms triggered: **${alarmsCount}**\n` +
                `• Secondary screening dispatch rate: **${((secondaryCount / (activeSecurityScreenings.length || 1)) * 100).toFixed(1)}%**\n` +
                `• Queue Wait Status: **Normal** (average processing time: **1.1 mins**)`;
      } else if (query.includes('maintenance') || query.includes('repair') || query.includes('mechanic')) {
        const criticalLogs = activeMaintenanceLogs.filter((ml) => ml.isCritical);
        
        if (criticalLogs.length > 0) {
          reply = `🔧 **CRITICAL MAINTENANCE ALERT:**\n` +
                  criticalLogs.map((cl) => `• Aircraft **${cl.aircraftRegistration}** has issue: **${cl.issue}** (Priority ${cl.priority}). Work order: ${cl.workOrderId}`).join('\n');
        } else {
          reply = `🔧 **Aircraft Engineering & Maintenance status:**\n` +
                  `• There are **${activeMaintenanceLogs.length}** active work logs under repair/scheduled inspection.\n` +
                  `• System check shows 0 critical unresolved engine defects. All fleets are currently airworthy.`;
        }
      } else if (query.includes('staff') || query.includes('roster') || query.includes('shift')) {
        const departments = activeStaffShifts.reduce((acc, curr) => {
          acc[curr.department] = (acc[curr.department] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        reply = `👥 **Workforce Shift Report:**\n` +
                `• Total staff clocked in: **${activeStaffShifts.length}** agents\n` +
                `• Department breakdown:\n` +
                Object.entries(departments).map(([dept, count]) => `  - ${dept}: **${count}** staff`).join('\n') + `\n` +
                `• Ground staff assignments look balanced. No critical staffing shortages reported in Terminal 3.`;
      } else if (query.includes('retail') || query.includes('revenue') || query.includes('sales') || query.includes('duty free')) {
        const totalSales = activeRetailTransactions.reduce((sum, item) => sum + item.amountUsd, 0);
        const topCategory = activeRetailTransactions.reduce((acc, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + curr.amountUsd;
          return acc;
        }, {} as Record<string, number>);
        
        const sortedCats = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);
        const bestSeller = sortedCats[0] ? `${sortedCats[0][0]} ($${sortedCats[0][1].toLocaleString(undefined, {maximumFractionDigits:0})})` : 'N/A';

        reply = `🛍️ **Retail & Commercial Operations Console:**\n` +
                `• Cumulative retail revenue today: **$${totalSales.toLocaleString(undefined, {maximumFractionDigits: 2})}**\n` +
                `• Top sales category: **${bestSeller}**\n` +
                `• Total commercial transactions logged: **${activeRetailTransactions.length}**\n` +
                `• Busiest hub: **Terminal 3 Main Atrium**`;
      } else if (query.includes('incident') || query.includes('alert') || query.includes('problem')) {
        const activeAlerts = incidents.filter((i) => !i.resolved);
        if (activeAlerts.length > 0) {
          reply = `🚨 **Active Incident Alert Level:**\n` +
                  activeAlerts.map((a) => `• [${a.type}] ${a.title}: ${a.description}`).join('\n');
        } else {
          reply = `✅ **Operations Health Check:**\n` +
                  `All core networks and physical terminals reporting fully functional. Zero active unresolved system warnings.`;
        }
      } else {
        reply = `🤖 **AOCC Copilot Assistance:**\n` +
                `I did not catch any specific category keyword. Try asking me questions like:\n` +
                `• *"Is flight UK-633 boarding?"*\n` +
                `• *"What is the status of the baggage sorting belt?"*\n` +
                `• *"Show me the maintenance logs"* \n` +
                `• *"Are there any active security alerts?"* \n` +
                `• *"What is our total retail revenue today?"*`;
      }

      const assistantMessage: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date(),
        text: reply
      };

      set((state) => ({
        copilotMessages: [...state.copilotMessages, assistantMessage]
      }));
    }, 1000);
  }
}));
