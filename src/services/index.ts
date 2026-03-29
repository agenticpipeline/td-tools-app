/**
 * Services Layer Barrel Export
 * Centralized export of all API clients, hooks, and utilities
 */

// API Client and types
export * from './api';

// React Hooks
export * from './hooks';

// Offline services
export * from './offline';

// Re-export commonly used items for convenience
export {
  apiClient,
  ApiClient,
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  parseFile,
  getEquipmentList,
  updateEquipmentItem,
  deleteEquipmentItem,
  validateSpecs,
  calculateEstimate,
  getEstimate,
  exportReport,
} from './api';

export {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useEquipment,
  useParseFile,
  useUpdateEquipmentItem,
  useDeleteEquipmentItem,
  useValidateSpecs,
  useEstimate,
  useCalculateEstimate,
  useExportReport,
} from './hooks';

export {
  cacheService,
  offlineQueueService,
  networkStatusService,
} from './offline';
