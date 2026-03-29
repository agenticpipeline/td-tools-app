/**
 * Axios-based API Client with retry logic, interceptors, and error handling
 * Handles communication with TD Tools Express API backend
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from 'axios';
import {
  ApiResponse,
  ApiErrorResponse,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  ApiConfig,
} from './types';

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

class ApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;
  private retryCount: Map<string, number> = new Map();

  constructor(config?: Partial<ApiConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token and headers
    this.client.interceptors.request.use(
      (config) => {
        const authToken = this.getAuthToken();
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and success
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry count on success
        const requestKey = this.getRequestKey(response.config);
        this.retryCount.delete(requestKey);

        // Check for API error in response body
        if (response.data && !response.data.success) {
          return Promise.reject(this.parseApiError(response.data));
        }

        return response;
      },
      (error) => this.handleError(error)
    );
  }

  /**
   * Make a GET request with automatic retry
   */
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('get', url, undefined, config);
  }

  /**
   * Make a POST request with automatic retry
   */
  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('post', url, data, config);
  }

  /**
   * Make a PATCH request with automatic retry
   */
  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('patch', url, data, config);
  }

  /**
   * Make a DELETE request with automatic retry
   */
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.requestWithRetry<T>('delete', url, undefined, config);
  }

  /**
   * Upload a file with FormData
   */
  async uploadFile<T = unknown>(
    url: string,
    formData: FormData,
    onProgress?: (event: ProgressEvent) => void
  ): Promise<ApiResponse<T>> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = onProgress;
    }

    try {
      const response = await this.client.post<ApiResponse<T>>(url, formData, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download file and return blob
   */
  async downloadFile(url: string): Promise<Blob> {
    try {
      const response = await this.client.get(url, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set authorization token
   */
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get authorization token
   */
  private getAuthToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Update base URL (for NUC connectivity)
   */
  setBaseURL(url: string): void {
    this.config.baseURL = url;
    this.client.defaults.baseURL = url;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.config.baseURL;
  }

  /**
   * Request with retry logic and exponential backoff
   */
  private async requestWithRetry<T = unknown>(
    method: 'get' | 'post' | 'patch' | 'delete',
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const requestKey = `${method}:${url}`;
    const currentAttempt = (this.retryCount.get(requestKey) || 0) + 1;
    this.retryCount.set(requestKey, currentAttempt);

    try {
      let response: AxiosResponse<ApiResponse<T>>;

      switch (method) {
        case 'get':
          response = await this.client.get<ApiResponse<T>>(url, config);
          break;
        case 'post':
          response = await this.client.post<ApiResponse<T>>(url, data, config);
          break;
        case 'patch':
          response = await this.client.patch<ApiResponse<T>>(url, data, config);
          break;
        case 'delete':
          response = await this.client.delete<ApiResponse<T>>(url, config);
          break;
      }

      this.retryCount.delete(requestKey);
      return response.data;
    } catch (error) {
      // Retry logic
      if (this.shouldRetry(error, currentAttempt)) {
        const delay = this.calculateBackoffDelay(currentAttempt);
        await this.sleep(delay);
        return this.requestWithRetry<T>(method, url, data, config);
      }

      this.retryCount.delete(requestKey);
      throw this.handleError(error);
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.config.retryAttempts) {
      return false;
    }

    if (!(error instanceof AxiosError)) {
      return false;
    }

    const status = error.response?.status;

    // Retry on network errors or specific status codes
    if (!error.response) {
      return true; // Network error
    }

    // Retry on 408 (timeout), 429 (rate limit), 5xx (server error)
    return status === 408 || status === 429 || (status !== undefined && status >= 500);
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    // exponential backoff: 1s, 2s, 4s
    return this.config.retryDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Convert axios error to custom error types
   */
  private handleError(error: unknown): Error {
    if (error instanceof ApiErrorResponse) {
      return error;
    }

    if (!(error instanceof AxiosError)) {
      return new NetworkError('Unknown error occurred');
    }

    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;

    // Handle specific error responses from API
    if (data?.error) {
      const errorObj = data.error as Record<string, unknown>;
      const code = (errorObj.code as string) || 'UNKNOWN';
      const message = (errorObj.message as string) || 'Unknown error';
      const details = (errorObj.details as Record<string, unknown>) || {};

      if (status === 404) {
        return new NotFoundError(message);
      }
      if (status === 429) {
        return new RateLimitError(
          message,
          (details.retryAfter as number) || undefined
        );
      }
      if (status === 400) {
        return new ValidationError(message, details);
      }

      return new ApiErrorResponse(code, message, details, status);
    }

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new NetworkError('Request timeout - check your connection');
      }
      return new NetworkError(error.message || 'Network error occurred');
    }

    // Handle HTTP errors
    const message =
      error.message ||
      `HTTP ${status}: ${error.response?.statusText || 'Unknown error'}`;

    if (status === 404) {
      return new NotFoundError(message);
    }
    if (status === 429) {
      return new RateLimitError(message);
    }
    if (status === 400) {
      return new ValidationError(message);
    }

    return new ApiErrorResponse(
      `HTTP_${status}`,
      message,
      { statusCode: status },
      status
    );
  }

  /**
   * Parse API error response from body
   */
  private parseApiError(response: Record<string, unknown>): Error {
    const error = response.error as Record<string, unknown> | undefined;
    if (!error) {
      return new NetworkError('Invalid API response format');
    }

    const code = (error.code as string) || 'UNKNOWN';
    const message = (error.message as string) || 'Unknown error';
    const details = (error.details as Record<string, unknown>) || {};

    if (code === 'VALIDATION_ERROR') {
      return new ValidationError(message, details);
    }
    if (code === 'NOT_FOUND') {
      return new NotFoundError(message);
    }
    if (code === 'RATE_LIMIT') {
      return new RateLimitError(
        message,
        (details.retryAfter as number) || undefined
      );
    }

    return new ApiErrorResponse(code, message, details);
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get request key for retry tracking
   */
  private getRequestKey(config: AxiosRequestConfig): string {
    return `${config.method}:${config.url}`;
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get client instance (for advanced use cases)
   */
  getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Get current config
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing with custom config
export { ApiClient };
