import {
  Equipment,
  Department,
  DepartmentEstimate,
  Estimate,
} from '../types';

const CREW_HOURLY_COST = 65; // dollars per hour
const CREW_SHIFT_HOURS = 8;

/**
 * Calculate base crew size based on equipment quantity
 * Thresholds: 1-4 items=2 crew, 5-12=4, 13-24=6, 25-48=8, 49+=ceil(qty/6)
 */
function calculateBaseCrew(quantity: number): number {
  if (quantity <= 4) return 2;
  if (quantity <= 12) return 4;
  if (quantity <= 24) return 6;
  if (quantity <= 48) return 8;
  return Math.ceil(quantity / 6);
}

/**
 * Calculate install/dismantle time with batch repetition scaling
 * Formula: installTime = baseTime + (qty-1) * baseTime * 0.6
 */
function calculateBatchTime(baseTimeMinutes: number, quantity: number): number {
  if (quantity <= 1) return baseTimeMinutes;
  const additionalTime = (quantity - 1) * baseTimeMinutes * 0.6;
  return baseTimeMinutes + additionalTime;
}

/**
 * Estimate equipment for a single department
 */
function estimateDepartment(
  equipment: Equipment[],
  department: Department
): DepartmentEstimate {
  const deptEquipment = equipment.filter((e) => e.department === department);

  if (deptEquipment.length === 0) {
    return {
      department,
      totalItems: 0,
      avgComplexity: 0,
      baseCrew: 0,
      adjustedCrew: 0,
      installHours: 0,
      dismantleHours: 0,
      totalCost: 0,
      notes: [],
      riskFlags: [],
    };
  }

  // Calculate totals
  const totalQuantity = deptEquipment.reduce((sum, e) => sum + e.quantity, 0);
  const totalComplexity = deptEquipment.reduce((sum, e) => sum + e.complexity, 0);
  const avgComplexity = totalComplexity / deptEquipment.length;

  // Calculate times
  let totalInstallMinutes = 0;
  let totalDismantleMinutes = 0;

  deptEquipment.forEach((eq) => {
    const installTime = calculateBatchTime(eq.installTimeMinutes, eq.quantity);
    const dismantleTime = calculateBatchTime(eq.dismantleTimeMinutes, eq.quantity);
    totalInstallMinutes += installTime;
    totalDismantleMinutes += dismantleTime;
  });

  const installHours = totalInstallMinutes / 60;
  const dismantleHours = totalDismantleMinutes / 60;

  // Calculate base crew
  let baseCrew = calculateBaseCrew(totalQuantity);

  // Apply OSHA weight adjustment
  const hasHeavyItems = deptEquipment.some((e) => e.baseWeight > 50);
  if (hasHeavyItems) {
    baseCrew = Math.max(baseCrew, 4);
  }

  // Apply flown/rigged adjustment
  const hasFlownRigged = deptEquipment.some((e) => e.isFlown || e.isRigged);
  if (hasFlownRigged) {
    baseCrew = Math.max(baseCrew, 4);
  }

  // Apply complexity adjustment
  let adjustedCrew = baseCrew;
  if (avgComplexity >= 4) {
    adjustedCrew = Math.ceil(baseCrew * 1.25);
  }

  // Calculate cost
  const crewCost = adjustedCrew * (installHours + dismantleHours) * CREW_HOURLY_COST;

  // Collect notes and risk flags
  const notes: string[] = [];
  const riskFlags: string[] = [];

  if (hasFlownRigged) {
    notes.push('Rigging equipment detected - requires certified riggers');
    riskFlags.push('RIGGING_REQUIRED');
  }

  if (hasHeavyItems) {
    notes.push('Heavy items detected - OSHA regulations apply');
    riskFlags.push('HEAVY_EQUIPMENT');
  }

  if (avgComplexity >= 4) {
    notes.push('High complexity - may require specialist crew');
    riskFlags.push('HIGH_COMPLEXITY');
  }

  if (installHours > 8 || dismantleHours > 8) {
    notes.push('Extended hours - may require split crew shifts');
    riskFlags.push('EXTENDED_DURATION');
  }

  return {
    department,
    totalItems: deptEquipment.length,
    avgComplexity,
    baseCrew,
    adjustedCrew,
    installHours,
    dismantleHours,
    totalCost: crewCost,
    notes,
    riskFlags,
  };
}

/**
 * Validate equipment data for completeness and reasonableness
 */
function validateEquipment(equipment: Equipment[]): string[] {
  const errors: string[] = [];

  equipment.forEach((eq, index) => {
    if (!eq.name || eq.name.trim().length === 0) {
      errors.push(`Item ${index + 1}: Name is required`);
    }

    if (eq.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }

    if (eq.complexity < 1 || eq.complexity > 5) {
      errors.push(`Item ${index + 1}: Complexity must be between 1 and 5`);
    }

    if (eq.baseWeight < 0) {
      errors.push(`Item ${index + 1}: Weight cannot be negative`);
    }

    if (eq.installTimeMinutes <= 0 || eq.dismantleTimeMinutes <= 0) {
      errors.push(`Item ${index + 1}: Time estimates must be positive`);
    }
  });

  return errors;
}

/**
 * Check schedule feasibility
 */
function checkFeasibility(
  estimate: Estimate,
  availableHoursPerDay: number,
  daysUntilEvent: number
): { feasible: boolean; constraints: string[] } {
  const constraints: string[] = [];
  const totalCriticalHours = estimate.totalInstallHours + estimate.totalDismantleHours;

  // Check if timeline is realistic
  if (totalCriticalHours > availableHoursPerDay * daysUntilEvent) {
    constraints.push(
      `Estimated work (${totalCriticalHours.toFixed(1)} hours) exceeds available time (${availableHoursPerDay * daysUntilEvent} hours)`
    );
  }

  // Check for excessive daily requirements
  const dailyCrewHours = totalCriticalHours / daysUntilEvent;
  if (dailyCrewHours > availableHoursPerDay) {
    constraints.push(
      `Daily crew requirement (${dailyCrewHours.toFixed(1)} hours) exceeds available hours (${availableHoursPerDay})`
    );
  }

  // Check for multiple high-risk items
  const riskCount = estimate.departmentEstimates
    .flatMap((d) => d.riskFlags)
    .filter((f) => f === 'RIGGING_REQUIRED' || f === 'HEAVY_EQUIPMENT').length;

  if (riskCount > 3) {
    constraints.push('Multiple high-risk items may compound complexity');
  }

  return {
    feasible: constraints.length === 0,
    constraints,
  };
}

/**
 * Main estimation function
 */
export function generateEstimate(
  projectId: string,
  equipment: Equipment[],
  availableHoursPerDay: number = 8,
  daysUntilEvent: number = 5
): Estimate {
  // Validate equipment
  const validationErrors = validateEquipment(equipment);
  if (validationErrors.length > 0) {
    console.warn('Equipment validation warnings:', validationErrors);
  }

  // Get all departments
  const departments: Department[] = [
    'audio',
    'video',
    'lighting',
    'scenic',
    'softgoods',
    'stagehands',
  ];

  // Estimate each department
  const departmentEstimates = departments
    .map((dept) => estimateDepartment(equipment, dept))
    .filter((est) => est.totalItems > 0);

  // Calculate totals
  const totalCrew = departmentEstimates.reduce(
    (sum, dept) => sum + dept.adjustedCrew,
    0
  );

  const totalInstallHours = departmentEstimates.reduce(
    (sum, dept) => sum + dept.installHours,
    0
  );

  const totalDismantleHours = departmentEstimates.reduce(
    (sum, dept) => sum + dept.dismantleHours,
    0
  );

  const totalCost = departmentEstimates.reduce((sum, dept) => sum + dept.totalCost, 0);

  // Estimate timeline as longest sequential path
  const timelineHours = Math.max(
    ...departmentEstimates.map((d) => Math.max(d.installHours, d.dismantleHours)),
    1
  );

  // Check feasibility
  const { feasible, constraints } = checkFeasibility(
    {
      projectId,
      equipment,
      departmentEstimates,
      totalCrew,
      totalInstallHours,
      totalDismantleHours,
      totalCost,
      timelineHours,
      feasible: true,
      constraints: [],
      generatedAt: new Date(),
    },
    availableHoursPerDay,
    daysUntilEvent
  );

  return {
    projectId,
    equipment,
    departmentEstimates,
    totalCrew,
    totalInstallHours,
    totalDismantleHours,
    totalCost,
    timelineHours,
    feasible,
    constraints,
    generatedAt: new Date(),
  };
}

/**
 * Update crew size based on user adjustments
 */
export function adjustCrewSize(
  estimate: Estimate,
  department: Department,
  newCrew: number
): Estimate {
  const updatedEstimates = estimate.departmentEstimates.map((dept) => {
    if (dept.department === department) {
      const crewDifference = newCrew - dept.adjustedCrew;
      const totalHours = dept.installHours + dept.dismantleHours;
      const costDifference = crewDifference * totalHours * CREW_HOURLY_COST;

      return {
        ...dept,
        adjustedCrew: newCrew,
        totalCost: dept.totalCost + costDifference,
      };
    }
    return dept;
  });

  const newTotalCrew = updatedEstimates.reduce(
    (sum, dept) => sum + dept.adjustedCrew,
    0
  );

  const newTotalCost = updatedEstimates.reduce((sum, dept) => sum + dept.totalCost, 0);

  return {
    ...estimate,
    departmentEstimates: updatedEstimates,
    totalCrew: newTotalCrew,
    totalCost: newTotalCost,
  };
}

/**
 * Calculate crew schedule (number of shifts needed)
 */
export function calculateSchedule(
  estimate: Estimate,
  hoursPerShift: number = 8
): {
  installShifts: number;
  dismantleShifts: number;
  totalShifts: number;
} {
  const installShifts = Math.ceil(estimate.totalInstallHours / hoursPerShift);
  const dismantleShifts = Math.ceil(estimate.totalDismantleHours / hoursPerShift);

  return {
    installShifts,
    dismantleShifts,
    totalShifts: installShifts + dismantleShifts,
  };
}
