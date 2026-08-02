import Papa from 'papaparse';

export interface Flight {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  actualDeparture: string;
  scheduledArrival: string;
  actualArrival: string;
  aircraftType: string;
  aircraftRegistration: string;
  passengerCapacity: number;
  bookedPassengers: number;
  status: string;
  delayMinutes: number;
  delayReason: string;
  terminal: string;
  gate: string;
  isInternational: boolean;
  distanceKm: number;
  altitude: number;
  estimatedEventTime: string;
  onTime: boolean;
  weatherCondition: string;
  loadFactor: number;
  baggageCount: number;
  timeOfDay: string;
  dayOfWeek: string;
  isCargo: boolean;
  season: string;
  routeType: string;
}

export interface Passenger {
  pnrCode: string;
  passengerId: string;
  passportHash: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dob: string;
  gender: string;
  seat: string;
  class: string;
  flightNumber: string;
  checkinTime: string;
  boardingTime: string;
  gate: string;
  baggageWeight: number;
  email: string;
  phone: string;
  specialAssistance: boolean;
  noShow: boolean;
  fareClass: string;
  age: number;
  demographic: string;
}

export interface Baggage {
  baggageId: string;
  pnrCode: string;
  flightNumber: string;
  passportHash: string;
  weight: number;
  dimensions: string;
  status: string;
  location: string;
  checkinTimestamp: string;
  loadedTimestamp: string;
  bagCount: number;
  loadingStatus: string;
  isFragile: boolean;
  handlingLocation: string;
  lastUpdated: string;
  securityScreened: boolean;
}

export interface GateEvent {
  eventId: string;
  flightNumber: string;
  gate: string;
  terminal: string;
  eventType: string;
  timestamp: string;
  handlerStaffId: string;
  durationMins: number;
  status: string;
  isDelayed: boolean;
  lastUpdated: string;
}

export interface SecurityScreening {
  screeningId: string;
  passportHash: string;
  passengerPnr: string;
  baggageCount: number;
  checkpointTime: string;
  scheduledFlightTime: string;
  completionTime: string;
  status: string;
  alarmTriggered: boolean;
  staffId: string;
  laneId: string;
  durationSecs: number;
  hasContraband: boolean;
  randomCheck: boolean;
  shiftId: string;
}

export interface MaintenanceLog {
  workOrderId: string;
  aircraftRegistration: string;
  flightNumber: string;
  type: string;
  staffId: string;
  scheduledStart: string;
  completedAt: string;
  durationHours: number;
  cost: number;
  issue: string;
  action: string;
  priority: number;
  supervisorId: string;
  isCritical: boolean;
}

export interface StaffShift {
  staffId: string;
  name: string;
  department: string;
  role: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  terminal: string;
  assignedLocation: string;
  supervisorId: string;
  shiftHours: number;
  onLeave: boolean;
  hireDate: string;
  languages: string;
}

export interface RetailTransaction {
  transactionId: string;
  staffId: string;
  shopName: string;
  category: string;
  passportHash: string;
  flightNumber: string;
  timestamp: string;
  item: string;
  quantity: number;
  amountLocal: number;
  amountUsd: number;
  paymentMethod: string;
  currency: string;
  terminal: string;
  location: string;
  taxFree: boolean;
}

// Helper to check if a row is just the numeric header row (0,1,2...)
const isHeaderRow = (row: string[]): boolean => {
  return row.length > 1 && row[0] === '0' && row[1] === '1';
};

// Generic parser function
const parseCSV = <T>(url: string, mapper: (row: string[]) => T): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(url, {
      download: true,
      skipEmptyLines: true,
      complete: (results) => {
        let data = results.data;
        if (data.length > 0 && isHeaderRow(data[0])) {
          data = data.slice(1); // skip headers
        }
        const mappedData = data.map(mapper);
        resolve(mappedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const parseFlights = (): Promise<Flight[]> => {
  return parseCSV<Flight>('/dataset/flights.csv', (row) => ({
    flightNumber: row[0] || '',
    airline: row[1] || '',
    airlineCode: row[2] || '',
    origin: row[3] || '',
    destination: row[4] || '',
    scheduledDeparture: row[5] || '',
    actualDeparture: row[6] || '',
    scheduledArrival: row[7] || '',
    actualArrival: row[8] || '',
    aircraftType: row[9] || '',
    aircraftRegistration: row[10] || '',
    passengerCapacity: parseInt(row[11]) || 150,
    bookedPassengers: parseInt(row[12]) || 120,
    status: row[13] || 'Scheduled',
    delayMinutes: parseInt(row[14]) || 0,
    delayReason: row[15] || '',
    terminal: row[16] || 'T3',
    gate: row[17] || '',
    isInternational: row[18]?.toLowerCase() === 'true',
    distanceKm: parseFloat(row[19]) || 0,
    altitude: parseFloat(row[20]) || 0,
    estimatedEventTime: row[21] || '',
    onTime: row[22]?.toLowerCase() === 'true',
    weatherCondition: row[23] || 'Clear',
    loadFactor: parseFloat(row[24]) || 0,
    baggageCount: parseInt(row[25]) || 0,
    timeOfDay: row[27] || '',
    dayOfWeek: row[28] || '',
    isCargo: row[29]?.toLowerCase() === 'true',
    season: row[30] || '',
    routeType: row[31] || ''
  }));
};

export const parsePassengers = (): Promise<Passenger[]> => {
  return parseCSV<Passenger>('/dataset/passengers.csv', (row) => ({
    pnrCode: row[0] || '',
    passengerId: row[1] || '',
    passportHash: row[2] || '',
    firstName: row[3] || '',
    lastName: row[4] || '',
    nationality: row[5] || '',
    dob: row[6] || '',
    gender: row[7] || '',
    seat: row[8] || '',
    class: row[9] || 'Economy',
    flightNumber: row[10] || '',
    checkinTime: row[11] || '',
    boardingTime: row[12] || '',
    gate: row[13] || '',
    baggageWeight: parseFloat(row[14]) || 0,
    email: row[18] || '',
    phone: row[19] || '',
    specialAssistance: row[22]?.toLowerCase() === 'true',
    noShow: row[24]?.toLowerCase() === 'true',
    fareClass: row[25] || 'Economy',
    age: parseInt(row[26]) || 30,
    demographic: row[27] || 'Adult'
  }));
};

export const parseBaggage = (): Promise<Baggage[]> => {
  return parseCSV<Baggage>('/dataset/baggage.csv', (row) => ({
    baggageId: row[0] || '',
    pnrCode: row[1] || '',
    flightNumber: row[2] || '',
    passportHash: row[3] || '',
    weight: parseFloat(row[4]) || 0,
    dimensions: row[5] || '',
    status: row[6] || 'Check-in',
    location: row[7] || '',
    checkinTimestamp: row[8] || '',
    loadedTimestamp: row[9] || '',
    bagCount: parseInt(row[10]) || 1,
    loadingStatus: row[11] || '',
    isFragile: row[12]?.toLowerCase() === 'true',
    handlingLocation: row[14] || '',
    lastUpdated: row[15] || '',
    securityScreened: row[16]?.toLowerCase() === 'true'
  }));
};

export const parseGateEvents = (): Promise<GateEvent[]> => {
  return parseCSV<GateEvent>('/dataset/gate_events.csv', (row) => ({
    eventId: row[0] || '',
    flightNumber: row[1] || '',
    gate: row[2] || '',
    terminal: row[3] || 'T3',
    eventType: row[4] || '',
    timestamp: row[5] || '',
    handlerStaffId: row[6] || '',
    durationMins: parseInt(row[7]) || 0,
    status: row[8] || '',
    isDelayed: row[9]?.toLowerCase() === 'true',
    lastUpdated: row[11] || ''
  }));
};

export const parseSecurityScreening = (): Promise<SecurityScreening[]> => {
  return parseCSV<SecurityScreening>('/dataset/security_screening.csv', (row) => ({
    screeningId: row[0] || '',
    passportHash: row[1] || '',
    passengerPnr: row[2] || '',
    baggageCount: parseInt(row[3]) || 0,
    checkpointTime: row[4] || '',
    scheduledFlightTime: row[5] || '',
    completionTime: row[6] || '',
    status: row[7] || 'Clear',
    alarmTriggered: row[9]?.toLowerCase() === 'true',
    staffId: row[10] || '',
    laneId: row[11] || 'XRAY-1',
    durationSecs: parseInt(row[12]) || 0,
    hasContraband: row[13]?.toLowerCase() === 'true',
    randomCheck: row[14]?.toLowerCase() === 'true',
    shiftId: row[15] || ''
  }));
};

export const parseMaintenanceLogs = (): Promise<MaintenanceLog[]> => {
  return parseCSV<MaintenanceLog>('/dataset/maintenance_logs.csv', (row) => ({
    workOrderId: row[0] || '',
    aircraftRegistration: row[1] || '',
    flightNumber: row[2] || '',
    type: row[3] || 'Routine',
    staffId: row[4] || '',
    scheduledStart: row[5] || '',
    completedAt: row[6] || '',
    durationHours: parseFloat(row[7]) || 0,
    cost: parseFloat(row[8]) || 0,
    issue: row[9] || '',
    action: row[10] || '',
    priority: parseInt(row[11]) || 3,
    supervisorId: row[12] || '',
    isCritical: row[13]?.toLowerCase() === 'true'
  }));
};

export const parseStaffShifts = (): Promise<StaffShift[]> => {
  return parseCSV<StaffShift>('/dataset/staff_shifts.csv', (row) => ({
    staffId: row[0] || '',
    name: row[1] || '',
    department: row[2] || 'Ops',
    role: row[3] || 'Agent',
    shiftDate: row[4] || '',
    startTime: row[5] || '',
    endTime: row[6] || '',
    terminal: row[7] || 'T3',
    assignedLocation: row[8] || '',
    supervisorId: row[9] || '',
    shiftHours: parseInt(row[10]) || 8,
    onLeave: row[11]?.toLowerCase() === 'true',
    hireDate: row[13] || '',
    languages: row[14] || 'English'
  }));
};

export const parseRetailTransactions = (): Promise<RetailTransaction[]> => {
  return parseCSV<RetailTransaction>('/dataset/retail_transactions.csv', (row) => ({
    transactionId: row[0] || '',
    staffId: row[1] || '',
    shopName: row[2] || '',
    category: row[3] || 'Retail',
    passportHash: row[4] || '',
    flightNumber: row[5] || '',
    timestamp: row[6] || '',
    item: row[7] || '',
    quantity: parseInt(row[8]) || 1,
    amountLocal: parseFloat(row[9]) || 0,
    amountUsd: parseFloat(row[10]) || 0,
    paymentMethod: row[11] || 'Card',
    currency: row[12] || 'INR',
    terminal: row[14] || 'T3',
    location: row[15] || '',
    taxFree: row[16]?.toLowerCase() === 'true'
  }));
};
