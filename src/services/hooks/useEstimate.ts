/**
 * React Hooks for Estimation
 * Handles estimate calculation, fetching, and report export
 */

import { useState, useEffect, useCallback } from 'react';
import {
  EstimateData,
  ProjectParams,
  ExportResult,
  ReportExportParams,
  ApiErrorResponse,
} from '../api/types';
import {
  calculateEstimate as apiCalculateEstimate,
  getEstimate as apiGetEstimate,
  recalculateEstimate as apiRecalculateEstimate,
  getEstimateHistory as apiGetEstimateHistory,
  exportReport as apiExportReport,
  downloadReport as apiDownloadReport,
} from '../api/estimates';

// Hook state types
interface UseEstimateState {
  estimate: EstimateData | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseCalculateEstimateState {
  estimate: EstimateData | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  isCalculating: boolean;
}

interface UseExportReportState {
  result: ExportResult | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseEstimateHistoryState {
  estimates: EstimateData[];
  loading: boolean;
  error: ApiErrorResponse | null;
}

/**
 * Hook for fetching current estimate
 */
export function useEstimate(projectId: string) {
  const [state, setState] = useState<UseEstimateState>({
    estimate: null,
    loading: true,
    error: null,
  });

  const fetchEstimate = useCallback(async () => {
    setState({ estimate: null, loading: true, error: null });

    try {
      const response = await apiGetEstimate(projectId);

      if (response.success && response.data) {
        setState({
          estimate: response.data,
          loading: false,
          error: null,
        });
      } else if (response.error?.code === 'NOT_FOUND') {
        // Estimate doesn't exist yet
        setState({
          estimate: null,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch estimate');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        estimate: null,
        loading: false,
        error: apiError,
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchEstimate();
  }, [projectId, fetchEstimate]);

  return {
    ...state,
    refetch: fetchEstimate,
  };
}

/**
 * Hook for calculating/recalculating estimate
 */
export function useCalculateEstimate(projectId: string) {
  const [state, setState] = useState<UseCalculateEstimateState>({
    estimate: null,
    loading: false,
    error: null,
    isCalculating: false,
  });

  const calculate = useCallback(async (params: ProjectParams) => {
    setState({
      estimate: null,
      loading: true,
      error: null,
      isCalculating: true,
    });

    try {
      const response = await apiCalculateEstimate(projectId, params);

      if (response.success && response.data) {
        setState({
          estimate: response.data,
          loading: false,
          error: null,
          isCalculating: false,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to calculate estimate');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        estimate: null,
        loading: false,
        error: apiError,
        isCalculating: false,
      });

      throw apiError;
    }
  }, [projectId]);

  const recalculate = useCallback(
    async (params: Partial<ProjectParams>) => {
      setState({
        estimate: state.estimate,
        loading: true,
        error: null,
        isCalculating: true,
      });

      try {
        const response = await apiRecalculateEstimate(projectId, params);

        if (response.success && response.data) {
          setState({
            estimate: response.data,
            loading: false,
            error: null,
            isCalculating: false,
          });
          return response.data;
        } else {
          throw new Error(response.error?.message || 'Failed to recalculate estimate');
        }
      } catch (error) {
        const apiError = error instanceof ApiErrorResponse
          ? error
          : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

        setState({
          estimate: state.estimate,
          loading: false,
          error: apiError,
          isCalculating: false,
        });

        throw apiError;
      }
    },
    [projectId, state.estimate]
  );

  const reset = useCallback(() => {
    setState({
      estimate: null,
      loading: false,
      error: null,
      isCalculating: false,
    });
  }, []);

  return {
    ...state,
    calculate,
    recalculate,
    reset,
  };
}

/**
 * Hook for exporting estimate report
 */
export function useExportReport(projectId: string) {
  const [state, setState] = useState<UseExportReportState>({
    result: null,
    loading: false,
    error: null,
  });

  const exportReport = useCallback(async (params: ReportExportParams) => {
    setState({
      result: null,
      loading: true,
      error: null,
    });

    try {
      const response = await apiExportReport(projectId, params);

      if (response.success && response.data) {
        setState({
          result: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to export report');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        result: null,
        loading: false,
        error: apiError,
      });

      throw apiError;
    }
  }, [projectId]);

  const download = useCallback(
    async (url: string) => {
      try {
        const blob = await apiDownloadReport(url);
        return blob;
      } catch (error) {
        const apiError = error instanceof ApiErrorResponse
          ? error
          : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

        setState((prev) => ({
          ...prev,
          error: apiError,
        }));

        throw apiError;
      }
    },
    []
  );

  const downloadAndSave = useCallback(
    async (params: ReportExportParams) => {
      try {
        const exportResponse = await exportReport(params);
        const blob = await download(exportResponse.url);

        // Create download link (works in web, needs different approach in React Native)
        if (typeof window !== 'undefined' && window.URL) {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = exportResponse.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        }

        return blob;
      } catch (error) {
        throw error;
      }
    },
    [exportReport, download]
  );

  const reset = useCallback(() => {
    setState({
      result: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    exportReport,
    download,
    downloadAndSave,
    reset,
  };
}

/**
 * Hook for fetching estimate history
 */
export function useEstimateHistory(projectId: string, limit: number = 10) {
  const [state, setState] = useState<UseEstimateHistoryState>({
    estimates: [],
    loading: true,
    error: null,
  });

  const fetchHistory = useCallback(async () => {
    setState({ estimates: [], loading: true, error: null });

    try {
      const response = await apiGetEstimateHistory(projectId, limit);

      if (response.success && response.data) {
        setState({
          estimates: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch estimate history');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        estimates: [],
        loading: false,
        error: apiError,
      });
    }
  }, [projectId, limit]);

  useEffect(() => {
    fetchHistory();
  }, [projectId, limit, fetchHistory]);

  return {
    ...state,
    refetch: fetchHistory,
  };
}

/**
 * Combined hook for estimate operations
 */
export function useEstimateCrud(projectId: string) {
  const estimateHook = useEstimate(projectId);
  const calculateHook = useCalculateEstimate(projectId);
  const exportHook = useExportReport(projectId);
  const historyHook = useEstimateHistory(projectId);

  const refetch = useCallback(() => {
    estimateHook.refetch();
    historyHook.refetch();
  }, [estimateHook, historyHook]);

  return {
    estimate: estimateHook,
    calculate: calculateHook,
    export: exportHook,
    history: historyHook,
    refetch,
  };
}
