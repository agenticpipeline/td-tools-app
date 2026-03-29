/**
 * Project API Endpoints
 * Handles all project-related API operations
 */

import { apiClient } from './client';
import {
  ApiResponse,
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ListParams,
  PaginatedResponse,
} from './types';

/**
 * List all projects with pagination and filtering
 */
export async function listProjects(
  params?: ListParams
): Promise<ApiResponse<PaginatedResponse<Project>>> {
  return apiClient.get<PaginatedResponse<Project>>('/projects', {
    params: params || {},
  });
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<ApiResponse<Project>> {
  return apiClient.get<Project>(`/projects/${id}`);
}

/**
 * Create a new project
 */
export async function createProject(
  data: CreateProjectDTO
): Promise<ApiResponse<Project>> {
  return apiClient.post<Project>('/projects', data);
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectDTO
): Promise<ApiResponse<Project>> {
  return apiClient.patch<Project>(`/projects/${id}`, data);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<ApiResponse<void>> {
  return apiClient.delete<void>(`/projects/${id}`);
}

/**
 * Archive a project (soft delete)
 */
export async function archiveProject(id: string): Promise<ApiResponse<Project>> {
  return updateProject(id, { status: 'archived' });
}

/**
 * Duplicate a project
 */
export async function duplicateProject(
  id: string,
  newName: string
): Promise<ApiResponse<Project>> {
  return apiClient.post<Project>(`/projects/${id}/duplicate`, { name: newName });
}

/**
 * Get project statistics
 */
export async function getProjectStats(id: string): Promise<
  ApiResponse<{
    equipmentCount: number;
    totalCost: number;
    estimatedLaborHours: number;
    lastModified: string;
  }>
> {
  return apiClient.get(`/projects/${id}/stats`);
}

/**
 * Share a project with another user
 */
export async function shareProject(
  id: string,
  email: string,
  role: 'viewer' | 'editor' | 'admin'
): Promise<ApiResponse<{ shared: boolean }>> {
  return apiClient.post(`/projects/${id}/share`, { email, role });
}

/**
 * Unshare a project
 */
export async function unshareProject(
  id: string,
  email: string
): Promise<ApiResponse<{ unshared: boolean }>> {
  return apiClient.delete(`/projects/${id}/share/${email}`);
}
