export type Department = 'audio' | 'video' | 'lighting' | 'scenic' | 'softgoods' | 'stagehands';

export interface Equipment {
  id: string;
  name: string;
  department: Department;
  baseWeight: number; // kg
  quantity: number;
  complexity: number; // 1-5 scale
  isFlown: boolean;
  isRigged: boolean;
  installTimeMinutes: number; // baseline
  dismantleTimeMinutes: number; // baseline
  notes?: string;
}

export interface DepartmentEstimate {
  department: Department;
  totalItems: number;
  avgComplexity: number;
  baseCrew: number;
  adjustedCrew: number;
  installHours: number;
  dismantleHours: number;
  totalCost: number;
  notes: string[];
  riskFlags: string[];
}

export interface Estimate {
  projectId: string;
  equipment: Equipment[];
  departmentEstimates: DepartmentEstimate[];
  totalCrew: number;
  totalInstallHours: number;
  totalDismantleHours: number;
  totalCost: number;
  timelineHours: number;
  feasible: boolean;
  constraints: string[];
  generatedAt: Date;
}

export interface ProjectParams {
  projectId: string;
  projectName: string;
  eventDate: Date;
  eventDuration: number; // hours
  venue: string;
  notes?: string;
  equipment: Equipment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project extends ProjectParams {
  estimate?: Estimate;
  status: 'draft' | 'in_progress' | 'estimated' | 'approved' | 'completed';
}

export interface ValidationError {
  equipmentId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface PipelineState {
  projectId: string;
  projectName: string;
  equipment: Equipment[];
  validationErrors: ValidationError[];
  estimate?: Estimate;
  interviewNotes?: string;
  currentStep: 'import' | 'review' | 'validate' | 'interview' | 'estimate' | 'report';
}
