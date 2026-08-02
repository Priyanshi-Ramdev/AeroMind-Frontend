# 🛰️ AeroMind: Next-Gen Airport Operations Control Center (AOCC)

**"Where real-time airport telemetry meets glassmorphic operational intelligence."**

AeroMind is a world-class, high-fidelity digital cockpit designed for Airport Operations Control Centers. Engineered as a mock command platform for high-intensity airport dispatchers, it fuses **8 complex, interconnected real-time datasets** into a seamless, responsive, and stunning dark-mode glassmorphic control station.

---

## 🚀 Key Features

* **⏱️ Real-Time Simulation Engine**: A state-driven clock loop in Zustand that shifts, links, and updates all datasets relative to peak operations (Nov 11, 2024), simulating live events and airport emergencies.
* **📡 DEL Terminal Airspace Radar**: An SVG-based polar coordinate radar sweep plotting live en-route flight transponders, altitude indicators, speed telemetry, and route vector locks.
* **🗺️ Terminal 3 Operations Map**: Interactive SVG floor-plan of DEL T3 gates displaying real-time boarding stages, jetbridge events, and active bottleneck warnings.
* **✈️ Operations Deck**: Tabular flight schedules powered by TanStack Table, allowing quick sortation and filtering of all outbound and inbound flights.
* **🛡️ Security Flow & Queue Diagnostics**: Real-time Recharts monitoring for checkpoint passenger throughput, wait time lane comparison, and contraband triggers.
* **💼 Baggage Claim Gantry**: Conveyor belt status monitors with mechanical speed tracking and manual sorter jam simulations.
* **🛍️ Retail Revenue Ledger**: Continuous sales invoice streams, shop rankings, and cumulative daily revenue accrual tracking.
* **🤖 Context-Aware AI Copilot**: A drawer assistant connected directly to the Zustand store that parses state data and answers operations queries instantly.

---

## 📊 Dataset Architecture & Integration

AeroMind maps the entire airport ecosystem by parsing and synchronizing **8 core tables**:
1. **Flights (`flights.csv`)** – Schedules, delay codes, passenger volumes, weather, routing vectors.
2. **Passengers (`passengers.csv`)** – Check-in logs, boarding passes, demographic data.
3. **Baggage (`baggage.csv`)** – Sorting status, check-in to loaded timelines, weights, fragile logs.
4. **Gate Events (`gate_events.csv`)** – Real-time jetbridge status, handler IDs.
5. **Security Screening (`security_screening.csv`)** – Completion logs, alarm rates, contraband alarms.
6. **Maintenance Logs (`maintenance_logs.csv`)** – Engineering defect priorities, action status.
7. **Staff Shifts (`staff_shifts.csv`)** – Workforce hours, supervisor hierarchies, roles.
8. **Retail Transactions (`retail_transactions.csv`)** – Store transactions, currencies, basket value.

---

## 🛠️ Tech Stack

* **Core**: React 19 + TypeScript + Vite 8
* **Styling**: Tailwind CSS v4 (Glassmorphic panels, neon accents, dark mode)
* **State & Loop**: Zustand 5
* **CSV Handling**: PapaParse 5
* **Data Grids**: TanStack Table v8
* **Charts**: Recharts 3
* **Icons & Motion**: Lucide React + Framer Motion 12

---

## 💻 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [npm](https://www.npmjs.com/)

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Priyanshi-Ramdev/AeroMind-Frontend.git
   cd AeroMind-Frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Launch the Command Center locally:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Verify production bundle compiles:**
   ```bash
   npm run build
   ```
