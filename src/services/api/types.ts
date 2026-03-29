/**
 * API Types and DTOs for TD Tools
 * Comprehensive type definitions for all API requests and responses
 */

// Generic API Response Wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  version: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error Types
export class ApiErrorResponse extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: Record<string, unknown>,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiErrorResponse';
  }
}

export class ValidationError extends ApiErrorResponse {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, details, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ApiErrorResponse {
  constructor(message: string) {
    super('NOT_FOUND', message, undefined, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiErrorResponse {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super('RATE_LIMIT', message, { retryAfter }, 429);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends ApiErrorResponse {
  constructor(message: string) {
    super('NETWORK_ERROR', message, undefined);
    this.name = 'NetworkError';
  }
}

// Project DTOs
export interface Project {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  eventType: string;
  location?: string;
  budget?: number;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  equipment: Equipment[];
  estimate?: EstimateData;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  eventDate: string;
  eventType: string;
  location?: string;
  budget?: number;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  eventDate?: string;
  eventType?: string;
  location?: string;
  budget?: number;
  status?: 'draft' | 'in-progress' | 'completed' | 'archived';
}

// Equipment DTOs
export interface Equipment {
  id: string;
  projectId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  specs: EquipmentSpecs;
  source: 'manual' | 'imported' | 'parsed';
  validated: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentSpecs {
  power?: number; // watts
  weight?: number; // kg
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  runtime?: number; // hours
  datasheet?: string;
  custom?: Record<string, unknown>;
}

export interface UpdateEquipmentDTO {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  specs?: EquipmentSpecs;
  notes?: string;
}

export interface EquipmentParseResult {
  imported: number;
  failed: number;
  items: Equipment[];
  errors: Array<{
    row: number;
    reason: string;
  }>;
}

// Estimation DTOs
export interface ProjectParams {
  eventDate: string;
  eventType: string;
  duration: number; // hours
  teamSize: number;
  complexity: 'low' | 'medium' | 'high';
  location?: string;
  weather?: string;
  specialRequirements?: string[];
}

export interface EstimateData {
  id: string;
  projectId: string;
  params: ProjectParams;
  laborHours: number;
  laborCost: number;
  equipmentCost: number;
  miscCost: number;
  totalCost: number;
  breakdown: EstimateBreakdown;
  confidence: number; // 0-100
  timestamp: string;
  expiresAt?: string;
}

export interface EstimateBreakdown {
  labor: {
    setup: number;
    execution: number;
    teardown: number;
  };
  equipment: {
    rental: number;
    consumables: number;
    fuel: number;
  };
  contingency: number;
  markup: number;
}

export interface ReportExportParams {
  format: 'pdf' | 'csv' | 'xlsx';
  includeEquipment?: boolean;
  includeEstimate?: boolean;
  includeNotes?: boolean;
}

export interface ExportResult {
  filename: string;
  url: string;
  expiresAt: string;
  size: number;
}

// File Upload
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  authToken?: string;
}

// Request/Response Interceptor Types
export interface RequestConfig {
  headers: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout: number;
}

export interface ResponseConfig<T = unknown> {
  status: number;
  data: T;
  headers: Record<string, string>;
}

// Validation Results
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// Network Status
export interface NetworkStatus {
  isOnline: boolean;
  type?: 'wifi' | 'cellular' | 'none' | 'unknown';
  strength?: number; // signal strength 0-100
}

// Cache Entry
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

// Offline Queue
export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data?: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}
