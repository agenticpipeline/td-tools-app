/**
 * React Hooks for Equipment Management
 * Handles equipment list fetching, file parsing, validation, and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Equipment,
  UpdateEquipmentDTO,
  EquipmentParseResult,
  ValidationResult,
  FileUploadProgress,
  ApiErrorResponse,
} from '../api/types';
import {
  getEquipmentList as apiGetEquipmentList,
  parseFile as apiParseFile,
  updateEquipmentItem as apiUpdateEquipmentItem,
  deleteEquipmentItem as apiDeleteEquipmentItem,
  validateSpecs as apiValidateSpecs,
  validateEquipmentItem as apiValidateEquipmentItem,
  getPowerRequirements as apiGetPowerRequirements,
  getWeightDistribution as apiGetWeightDistribution,
} from '../api/equipment';

// Hook state types
interface UseEquipmentState {
  equipment: Equipment[];
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseParseFileState {
  result: EquipmentParseResult | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  progress: FileUploadProgress | null;
}

interface UseValidateState {
  result: ValidationResult | null;
  loading: boolean;
  error: ApiErrorResponse | null;
  progress: number; // 0-100
}

interface UsePowerRequirementsState {
  data: {
    totalPower: number;
    byCategory: Record<string, number>;
    overLoadPercentage: number;
  } | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseWeightDistributionState {
  data: {
    totalWeight: number;
    byCategory: Record<string, number>;
    centerOfGravity?: { x: number; y: number };
  } | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

/**
 * Hook for fetching equipment list
 */
export function useEquipment(projectId: string) {
  const [state, setState] = useState<UseEquipmentState>({
    equipment: [],
    loading: true,
    error: null,
  });

  const fetchEquipment = useCallback(async () => {
    setState({ equipment: [], loading: true, error: null });

    try {
      const response = await apiGetEquipmentList(projectId);

      if (response.success && response.data) {
        setState({
          equipment: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch equipment');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        equipment: [],
        loading: false,
        error: apiError,
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchEquipment();
  }, [projectId, fetchEquipment]);

  return {
    ...state,
    refetch: fetchEquipment,
  };
}

/**
 * Hook for parsing equipment files
 */
export function useParseFile(projectId: string) {
  const [state, setState] = useState<UseParseFileState>({
    result: null,
    loading: false,
    error: null,
    progress: null,
  });

  const parseFile = useCallback(
    async (file: File) => {
      setState({
        result: null,
        loading: true,
        error: null,
        progress: null,
      });

      try {
        const response = await apiParseFile(file, projectId, (progress) => {
          setState((prev) => ({ ...prev, progress }));
        });

        if (response.success && response.data) {
          setState({
            result: response.data,
            loading: false,
            error: null,
            progress: { loaded: file.size, total: file.size, percent: 100 },
          });
          return response.data;
        } else {
          throw new Error(response.error?.message || 'Failed to parse file');
        }
      } catch (error) {
        const apiError = error instanceof ApiErrorResponse
          ? error
          : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

        setState({
          result: null,
          loading: false,
          error: apiError,
          progress: null,
        });

        throw apiError;
      }
    },
    [projectId]
  );

  const reset = useCallback(() => {
    setState({
      result: null,
      loading: false,
      error: null,
      progress: null,
    });
  }, []);

  return {
    ...state,
    parseFile,
    reset,
  };
}

/**
 * Hook for updating equipment item (inline editing)
 */
export function useUpdateEquipmentItem(projectId: string, itemId: string) {
  const [state, setState] = useState({
    data: null as Equipment | null,
    loading: false,
    error: null as ApiErrorResponse | null,
  });

  const update = useCallback(async (data: UpdateEquipmentDTO) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiUpdateEquipmentItem(projectId, itemId, data);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update equipment');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        data: null,
        loading: false,
        error: apiError,
      });

      throw apiError;
    }
  }, [projectId, itemId]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    update,
    reset,
  };
}

/**
 * Hook for deleting equipment item
 */
export function useDeleteEquipmentItem(projectId: string) {
  const [state, setState] = useState({
    loading: false,
    error: null as ApiErrorResponse | null,
  });

  const delete_ = useCallback(async (itemId: string) => {
    setState({ loading: true, error: null });

    try {
      const response = await apiDeleteEquipmentItem(projectId, itemId);

      if (response.success) {
        setState({
          loading: false,
          error: null,
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete equipment');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        loading: false,
        error: apiError,
      });

      throw apiError;
    }
  }, [projectId]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  return {
    ...state,
    delete: delete_,
    reset,
  };
}

/**
 * Hook for validating equipment specs
 */
export function useValidateSpecs(projectId: string) {
  const [state, setState] = useState<UseValidateState>({
    result: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const validate = useCallback(async () => {
    setState({
      result: null,
      loading: true,
      error: null,
      progress: 0,
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 100);

      const response = await apiValidateSpecs(projectId);

      clearInterval(progressInterval);

      if (response.success && response.data) {
        setState({
          result: response.data,
          loading: false,
          error: null,
          progress: 100,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Validation failed');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        result: null,
        loading: false,
        error: apiError,
        progress: 0,
      });

      throw apiError;
    }
  }, [projectId]);

  const reset = useCallback(() => {
    setState({
      result: null,
      loading: false,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    validate,
    reset,
  };
}

/**
 * Hook for validating a single equipment item
 */
export function useValidateEquipmentItem(projectId: string, itemId: string) {
  const [state, setState] = useState<UseValidateState>({
    result: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const validate = useCallback(async () => {
    setState({
      result: null,
      loading: true,
      error: null,
      progress: 0,
    });

    try {
      const response = await apiValidateEquipmentItem(projectId, itemId);

      if (response.success && response.data) {
        setState({
          result: response.data,
          loading: false,
          error: null,
          progress: 100,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Validation failed');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        result: null,
        loading: false,
        error: apiError,
        progress: 0,
      });

      throw apiError;
    }
  }, [projectId, itemId]);

  return {
    ...state,
    validate,
  };
}

/**
 * Hook for getting power requirements
 */
export function usePowerRequirements(projectId: string) {
  const [state, setState] = useState<UsePowerRequirementsState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchPowerRequirements = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiGetPowerRequirements(projectId);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch power requirements');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchPowerRequirements();
  }, [projectId, fetchPowerRequirements]);

  return {
    ...state,
    refetch: fetchPowerRequirements,
  };
}

/**
 * Hook for getting weight distribution
 */
export function useWeightDistribution(projectId: string) {
  const [state, setState] = useState<UseWeightDistributionState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchWeightDistribution = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiGetWeightDistribution(projectId);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch weight distribution');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        data: null,
        loading: false,
        error: apiError,
      });
    }
  }, [projectId]);

  useEffect(() => {
    fetchWeightDistribution();
  }, [projectId, fetchWeightDistribution]);

  return {
    ...state,
    refetch: fetchWeightDistribution,
  };
}
