export interface Installation {
  id: string;
  dropNumber: string;
  contractorName: string;
  customerName: string;
  installDate: string;
  status: 'pending' | 'complete' | 'incomplete' | 'unpaid';
  completedSteps: number;
  totalSteps: number;
  feedback?: string;
  checklist: ChecklistStep[];
}

export interface ChecklistStep {
  id: string;
  stepNumber: number;
  phase: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  description: string;
  isCompleted: boolean;
  hasPhoto: boolean;
  needsScan?: boolean;
  powerReading?: number;
  notes?: string;
}

export const CHECKLIST_STEPS: Omit<ChecklistStep, 'id' | 'isCompleted' | 'hasPhoto'>[] = [
  // Phase A - Pre-Install Context
  { stepNumber: 1, phase: 'A', title: 'Property Frontage', description: 'Wide shot of house, street number visible' },
  { stepNumber: 2, phase: 'A', title: 'Location on Wall (Before Install)', description: 'Show intended ONT spot + power outlet' },
  { stepNumber: 3, phase: 'A', title: 'Outside Cable Span', description: 'Wide shot showing full span (Pole → Pigtail screw)' },
  { stepNumber: 4, phase: 'A', title: 'Home Entry Point - Outside', description: 'Close-up of pigtail screw/duct entry' },
  { stepNumber: 5, phase: 'A', title: 'Home Entry Point - Inside', description: 'Inside view of same entry penetration' },
  
  // Phase B - Installation Execution
  { stepNumber: 6, phase: 'B', title: 'Fibre Entry to ONT (After Install)', description: 'Show slack loop + clips/conduit' },
  { stepNumber: 7, phase: 'B', title: 'Patched & Labelled Drop', description: 'Label with Drop Number visible' },
  { stepNumber: 8, phase: 'B', title: 'Overall Work Area After Completion', description: 'ONT, fibre routing & electrical outlet in frame' },
  
  // Phase C - Assets & IDs
  { stepNumber: 9, phase: 'C', title: 'ONT Barcode', description: 'Scan barcode + photo of label', needsScan: true },
  { stepNumber: 10, phase: 'C', title: 'Mini-UPS Serial Number (Gizzu)', description: 'Scan/enter serial + photo of label', needsScan: true },
  
  // Phase D - Verification
  { stepNumber: 11, phase: 'D', title: 'Powermeter Reading (Drop/Feeder)', description: 'Enter dBm + photo of meter screen' },
  { stepNumber: 12, phase: 'D', title: 'Powermeter at ONT (Before Activation)', description: 'Enter dBm + photo of meter screen. Acceptable: −25 to −10 dBm' },
  { stepNumber: 13, phase: 'D', title: 'Active Broadband Light', description: 'ONT light ON + Fibertime sticker + Drop No.' },
  
  // Phase E - Customer Acceptance
  { stepNumber: 14, phase: 'E', title: 'Customer Signature', description: 'Collect digital signature + customer name in 1Map' }
];