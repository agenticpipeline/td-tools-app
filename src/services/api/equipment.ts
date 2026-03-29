/**
 * Equipment API Endpoints
 * Handles equipment parsing, validation, and management
 */

import { apiClient } from './client';
import {
  ApiResponse,
  Equipment,
  UpdateEquipmentDTO,
  EquipmentParseResult,
  ValidationResult,
  FileUploadProgress,
} from './types';

/**
 * Parse equipment file (.vwx, .csv, .tsv)
 * Returns parsed equipment items and errors
 */
export async function parseFile(
  file: File,
  projectId: string,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<ApiResponse<EquipmentParseResult>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);

  return apiClient.uploadFile<EquipmentParseResult>(
    '/equipment/parse',
    formData,
    (event) => {
      if (onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded * 100) / event.total),
        });
      }
    }
  );
}

/**
 * Get equipment list for a project
 */
export async function getEquipmentList(
  projectId: string
): Promise<ApiResponse<Equipment[]>> {
  return apiClient.get<Equipment[]>(`/projects/${projectId}/equipment`);
}

/**
 * Get a single equipment item
 */
export async function getEquipmentItem(
  projectId: string,
  itemId: string
): Promise<ApiResponse<Equipment>> {
  return apiClient.get<Equipment>(`/projects/${projectId}/equipment/${itemId}`);
}

/**
 * Update equipment item (inline editing)
 */
export async function updateEquipmentItem(
  projectId: string,
  itemId: string,
  data: UpdateEquipmentDTO
): Promise<ApiResponse<Equipment>> {
  return apiClient.patch<Equipment>(
    `/projects/${projectId}/equipment/${itemId}`,
    data
  );
}

/**
 * Delete equipment item
 */
export async function deleteEquipmentItem(
  projectId: string,
  itemId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/projects/${projectId}/equipment/${itemId}`);
}

/**
 * Bulk update equipment items
 */
export async function bulkUpdateEquipment(
  projectId: string,
  updates: Array<{ id: string; data: UpdateEquipmentDTO }>
): Promise<ApiResponse<Equipment[]>> {
  return apiClient.post<Equipment[]>(
    `/projects/${projectId}/equipment/bulk-update`,
    { updates }
  );
}

/**
 * Bulk delete equipment items
 */
export async function bulkDeleteEquipment(
  projectId: string,
  itemIds: string[]
): Promise<ApiResponse<{ deleted: number }>> {
  return apiClient.post(`/projects/${projectId}/equipment/bulk-delete`, {
    itemIds,
  });
}

/**
 * Validate equipment specs against requirements
 * Returns validation errors and warnings
 */
export async function validateSpecs(
  projectId: string
): Promise<ApiResponse<ValidationResult>> {
  return apiClient.post<ValidationResult>(
    `/projects/${projectId}/equipment/validate`,
    {}
  );
}

/**
 * Validate a single equipment item
 */
export async function validateEquipmentItem(
  projectId: string,
  itemId: string
): Promise<ApiResponse<ValidationResult>> {
  return apiClient.post<ValidationResult>(
    `/projects/${projectId}/equipment/${itemId}/validate`,
    {}
  );
}

/**
 * Get equipment suggestions/recommendations for event type
 */
export async function getEquipmentSuggestions(
  eventType: string,
  duration: number
): Promise<ApiResponse<Equipment[]>> {
  return apiClient.get<Equipment[]>('/equipment/suggestions', {
    params: { eventType, duration },
  });
}

/**
 * Search equipment in library
 */
export async function searchEquipmentLibrary(
  query: string,
  category?: string
): Promise<ApiResponse<Equipment[]>> {
  return apiClient.get<Equipment[]>('/equipment/library/search', {
    params: { query, category },
  });
}

/**
 * Get equipment categories
 */
export async function getEquipmentCategories(): Promise<
  ApiResponse<Array<{ id: string; name: string; count: number }>>
> {
  return apiClient.get('/equipment/categories');
}

/**
 * Export equipment list
 */
export async function exportEquipmentList(
  projectId: string,
  format: 'csv' | 'xlsx' | 'json'
): Promise<Blob> {
  return apiClient.downloadFile(
    `/projects/${projectId}/equipment/export?format=${format}`
  );
}

/**
 * Import equipment from CSV/XLSX with mapping
 */
export async function importEquipmentWithMapping(
  projectId: string,
  file: File,
  mapping: Record<string, string>,
  onProgress?: (progress: FileUploadProgress) => void
): Promise<ApiResponse<EquipmentParseResult>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', projectId);
  formData.append('mapping', JSON.stringify(mapping));

  return apiClient.uploadFile<EquipmentParseResult>(
    '/equipment/import-with-mapping',
    formData,
    (event) => {
      if (onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded * 100) / event.total),
        });
      }
    }
  );
}

/**
 * Get equipment power requirements for a project
 */
export async function getPowerRequirements(
  projectId: string
): Promise<
  ApiResponse<{
    totalPower: number;
    byCategory: Record<string, number>;
    overLoadPercentage: number;
  }>
> {
  return apiClient.get(`/projects/${projectId}/equipment/power-requirements`);
}

/**
 * Get equipment weight distribution
 */
export async function getWeightDistribution(
  projectId: string
): Promise<
  ApiResponse<{
    totalWeight: number;
    byCategory: Record<string, number>;
    centerOfGravity?: { x: number; y: number };
  }>
> {
  return apiClient.get(`/projects/${projectId}/equipment/weight-distribution`);
}
