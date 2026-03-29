/**
 * React Hooks Barrel Export
 * Centralized export of all custom hooks
 */

// Projects hooks
export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectCrud,
} from './useProjects';

// Equipment hooks
export {
  useEquipment,
  useParseFile,
  useUpdateEquipmentItem,
  useDeleteEquipmentItem,
  useValidateSpecs,
  useValidateEquipmentItem,
  usePowerRequirements,
  useWeightDistribution,
} from './useEquipment';

// Estimate hooks
export {
  useEstimate,
  useCalculateEstimate,
  useExportReport,
  useEstimateHistory,
  useEstimateCrud,
} from './useEstimate';
