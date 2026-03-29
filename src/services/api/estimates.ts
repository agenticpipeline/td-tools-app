/**
 * Estimation API Endpoints
 * Handles estimate calculation, retrieval, and report export
 */

import { apiClient } from './client';
import {
  ApiResponse,
  EstimateData,
  ProjectParams,
  ExportResult,
  ReportExportParams,
} from './types';

/**
 * Calculate estimate for a project
 * Uses equipment list and project parameters
 */
export async function calculateEstimate(
  projectId: string,
  params: ProjectParams
): Promise<ApiResponse<EstimateData>> {
  return apiClient.post<EstimateData>(
    `/projects/${projectId}/estimate`,
    params
  );
}

/**
 * Get current estimate for a project
 */
export async function getEstimate(
  projectId: string
): Promise<ApiResponse<EstimateData>> {
  return apiClient.get<EstimateData>(`/projects/${projectId}/estimate`);
}

/**
 * Recalculate estimate with new parameters
 */
export async function recalculateEstimate(
  projectId: string,
  params: Partial<ProjectParams>
): Promise<ApiResponse<EstimateData>> {
  return apiClient.post<EstimateData>(
    `/projects/${projectId}/estimate/recalculate`,
    params
  );
}

/**
 * Get estimate history for a project
 */
export async function getEstimateHistory(
  projectId: string,
  limit: number = 10
): Promise<ApiResponse<EstimateData[]>> {
  return apiClient.get<EstimateData[]>(
    `/projects/${projectId}/estimate/history`,
    {
      params: { limit },
    }
  );
}

/**
 * Compare two estimates
 */
export async function compareEstimates(
  projectId: string,
  estimateId1: string,
  estimateId2: string
): Promise<
  ApiResponse<{
    estimate1: EstimateData;
    estimate2: EstimateData;
    differences: {
      laborHours: number;
      laborCost: number;
      equipmentCost: number;
      miscCost: number;
      totalCost: number;
    };
  }>
> {
  return apiClient.get(
    `/projects/${projectId}/estimate/compare/${estimateId1}/${estimateId2}`
  );
}

/**
 * Export estimate as report (PDF, CSV, XLSX)
 */
export async function exportReport(
  projectId: string,
  exportParams: ReportExportParams
): Promise<ApiResponse<ExportResult>> {
  return apiClient.post<ExportResult>(
    `/projects/${projectId}/report/export`,
    exportParams
  );
}

/**
 * Download exported report file
 */
export async function downloadReport(url: string): Promise<Blob> {
  return apiClient.downloadFile(url);
}

/**
 * Generate PDF estimate report
 */
export async function generatePdfReport(projectId: string): Promise<Blob> {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/report/export`,
    { format: 'pdf', includeEquipment: true, includeEstimate: true }
  );

  if (response.data?.url) {
    return apiClient.downloadFile(response.data.url);
  }

  throw new Error('Failed to generate PDF report');
}

/**
 * Generate CSV estimate report
 */
export async function generateCsvReport(projectId: string): Promise<Blob> {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/report/export`,
    { format: 'csv', includeEquipment: true, includeEstimate: true }
  );

  if (response.data?.url) {
    return apiClient.downloadFile(response.data.url);
  }

  throw new Error('Failed to generate CSV report');
}

/**
 * Generate XLSX estimate report
 */
export async function generateXlsxReport(projectId: string): Promise<Blob> {
  const response = await apiClient.post<ExportResult>(
    `/projects/${projectId}/report/export`,
    { format: 'xlsx', includeEquipment: true, includeEstimate: true }
  );

  if (response.data?.url) {
    return apiClient.downloadFile(response.data.url);
  }

  throw new Error('Failed to generate XLSX report');
}

/**
 * Get estimate templates
 */
export async function getEstimateTemplates(): Promise<
  ApiResponse<
    Array<{
      id: string;
      name: string;
      description: string;
      eventType: string;
      defaultParams: ProjectParams;
    }>
  >
> {
  return apiClient.get('/estimate/templates');
}

/**
 * Apply estimate template to project
 */
export async function applyEstimateTemplate(
  projectId: string,
  templateId: string
): Promise<ApiResponse<EstimateData>> {
  return apiClient.post(
    `/projects/${projectId}/estimate/apply-template`,
    { templateId }
  );
}

/**
 * Get cost breakdown for estimate
 */
export async function getCostBreakdown(
  projectId: string
): Promise<
  ApiResponse<{
    laborBreakdown: {
      setup: { hours: number; cost: number };
      execution: { hours: number; cost: number };
      teardown: { hours: number; cost: number };
    };
    equipmentBreakdown: {
      rental: { items: number; cost: number };
      consumables: { items: number; cost: number };
      fuel: { cost: number };
    };
    contingency: number;
    markup: number;
    total: number;
  }>
> {
  return apiClient.get(`/projects/${projectId}/estimate/breakdown`);
}

/**
 * Validate estimate parameters
 */
export async function validateEstimateParams(
  params: ProjectParams
): Promise<ApiResponse<{ valid: boolean; errors: string[] }>> {
  return apiClient.post('/estimate/validate-params', params);
}

/**
 * Get estimate for similar past projects
 */
export async function getSimilarProjectsEstimates(
  eventType: string,
  duration: number,
  complexity: string
): Promise<
  ApiResponse<
    Array<{
      projectId: string;
      projectName: string;
      estimate: EstimateData;
      similarity: number;
    }>
  >
> {
  return apiClient.get('/estimate/similar-projects', {
    params: { eventType, duration, complexity },
  });
}

/**
 * Get bulk estimates for multiple projects
 */
export async function getBulkEstimates(
  projectIds: string[]
): Promise<ApiResponse<Record<string, EstimateData>>> {
  return apiClient.post('/estimate/bulk', { projectIds });
}
