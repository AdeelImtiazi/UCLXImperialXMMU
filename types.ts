

export enum ItemType {
  INSULIN = 'Insulin',
  ANTIBIOTICS = 'Antibiotics',
  ANESTHESIA = 'Anesthesia',
  O2 = 'O2 Tanks',
  FLUIDS = 'IV Fluids',
  ANALGESICS = 'Analgesics'
}

export interface HistoryPoint {
  timestamp: number;
  value: number;
  type: 'manual_update' | 'usage' | 'restock' | 'initial';
}

export interface InventoryItem {
  id: string;
  name: ItemType;
  quantity: number;
  dailyUsageRate: number; // To calculate Days of Supply
  history: HistoryPoint[];
}

export interface Department {
  id: string;
  name: string;
  specialistTitle: string; // e.g., 'Trauma Surgeons', 'Oncologists'
  specialistCount: number;
  inventory: InventoryItem[];
}

export interface PatientCensus {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Hospital {
  id: string;
  name: string;
  maxPatients: number; // Maximum capacity
  departments: Department[];
  coordinates: { x: number; y: number }; // For SVG Map
  patientCensus: PatientCensus[];
  isOnline?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  hospitalName: string;
}

export interface PendingUpdate {
  id: string;
  itemId: string;
  departmentId: string;
  delta: number;
  timestamp: number;
}