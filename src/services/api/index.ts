/**
 * API Services Barrel Export
 * Centralized export of all API client and endpoint modules
 */

// Client
export { apiClient, ApiClient } from './client';

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  Equipment,
  EquipmentSpecs,
  UpdateEquipmentDTO,
  EquipmentParseResult,
  ProjectParams,
  EstimateData,
  EstimateBreakdown,
  ReportExportParams,
  ExportResult,
  FileUploadProgress,
  ApiConfig,
  RequestConfig,
  ResponseConfig,
  ValidationResult,
  NetworkStatus,
  CacheEntry,
  OfflineOperation,
} from './types';

export {
  ApiErrorResponse,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
} from './types';

// Projects endpoints
export {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  duplicateProject,
  getProjectStats,
  shareProject,
  unshareProject,
} from './projects';

// Equipment endpoints
export {
  parseFile,
  getEquipmentList,
  getEquipmentItem,
  updateEquipmentItem,
  deleteEquipmentItem,
  bulkUpdateEquipment,
  bulkDeleteEquipment,
  validateSpecs,
  validateEquipmentItem,
  getEquipmentSuggestions,
  searchEquipmentLibrary,
  getEquipmentCategories,
  exportEquipmentList,
  importEquipmentWithMapping,
  getPowerRequirements,
  getWeightDistribution,
} from './equipment';

// Estimates endpoints
export {
  calculateEstimate,
  getEstimate,
  recalculateEstimate,
  getEstimateHistory,
  compareEstimates,
  exportReport,
  downloadReport,
  generatePdfReport,
  generateCsvReport,
  generateXlsxReport,
  getEstimateTemplates,
  applyEstimateTemplate,
  getCostBreakdown,
  validateEstimateParams,
  getSimilarProjectsEstimates,
  getBulkEstimates,
} from './estimates';
