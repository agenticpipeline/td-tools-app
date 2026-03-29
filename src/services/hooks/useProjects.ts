/**
 * React Hooks for Project Management
 * Provides hooks for listing, fetching, creating, and updating projects
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  PaginatedResponse,
  ListParams,
  ApiErrorResponse,
} from '../api/types';
import {
  listProjects as apiListProjects,
  getProject as apiGetProject,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from '../api/projects';

// Hook state types
interface UseProjectsState {
  projects: Project[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseProjectState {
  project: Project | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

/**
 * Hook for listing projects with pagination
 */
export function useProjects(initialParams?: ListParams) {
  const [state, setState] = useState<UseProjectsState>({
    projects: [],
    page: initialParams?.page || 1,
    limit: initialParams?.limit || 20,
    total: 0,
    hasMore: false,
    loading: true,
    error: null,
  });

  const fetchProjects = useCallback(async (params?: ListParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiListProjects(params);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          projects: response.data!.items,
          page: response.data!.page,
          limit: response.data!.limit,
          total: response.data!.total,
          hasMore: response.data!.hasMore,
          loading: false,
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to fetch projects');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState((prev) => ({
        ...prev,
        loading: false,
        error: apiError,
      }));
    }
  }, []);

  useEffect(() => {
    fetchProjects(initialParams);
  }, [initialParams, fetchProjects]);

  const nextPage = useCallback(() => {
    const nextPageNum = state.page + 1;
    if (state.hasMore) {
      fetchProjects({ ...initialParams, page: nextPageNum });
    }
  }, [state.page, state.hasMore, initialParams, fetchProjects]);

  const prevPage = useCallback(() => {
    const prevPageNum = Math.max(state.page - 1, 1);
    if (prevPageNum !== state.page) {
      fetchProjects({ ...initialParams, page: prevPageNum });
    }
  }, [state.page, initialParams, fetchProjects]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum > 0 && pageNum !== state.page) {
        fetchProjects({ ...initialParams, page: pageNum });
      }
    },
    [state.page, initialParams, fetchProjects]
  );

  return {
    ...state,
    refetch: fetchProjects,
    nextPage,
    prevPage,
    goToPage,
  };
}

/**
 * Hook for fetching a single project
 */
export function useProject(projectId: string | null) {
  const [state, setState] = useState<UseProjectState>({
    project: null,
    loading: true,
    error: null,
  });

  const fetchProject = useCallback(async (id: string) => {
    setState({ project: null, loading: true, error: null });

    try {
      const response = await apiGetProject(id);

      if (response.success && response.data) {
        setState({
          project: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch project');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        project: null,
        loading: false,
        error: apiError,
      });
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  return {
    ...state,
    refetch: projectId ? () => fetchProject(projectId) : undefined,
  };
}

/**
 * Hook for creating a project
 */
export function useCreateProject() {
  const [state, setState] = useState<UseMutationState<Project>>({
    data: null,
    loading: false,
    error: null,
  });

  const create = useCallback(async (data: CreateProjectDTO) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiCreateProject(data);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create project');
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
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    create,
    reset,
  };
}

/**
 * Hook for updating a project
 */
export function useUpdateProject(projectId: string) {
  const [state, setState] = useState<UseMutationState<Project>>({
    data: null,
    loading: false,
    error: null,
  });

  const update = useCallback(async (data: UpdateProjectDTO) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiUpdateProject(projectId, data);

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update project');
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
  }, [projectId]);

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
 * Hook for deleting a project
 */
export function useDeleteProject() {
  const [state, setState] = useState<UseMutationState<void>>({
    data: undefined,
    loading: false,
    error: null,
  });

  const delete_ = useCallback(async (projectId: string) => {
    setState({ data: undefined, loading: true, error: null });

    try {
      const response = await apiDeleteProject(projectId);

      if (response.success) {
        setState({
          data: undefined,
          loading: false,
          error: null,
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to delete project');
      }
    } catch (error) {
      const apiError = error instanceof ApiErrorResponse
        ? error
        : new ApiErrorResponse('UNKNOWN', error instanceof Error ? error.message : 'Unknown error');

      setState({
        data: undefined,
        loading: false,
        error: apiError,
      });

      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: undefined, loading: false, error: null });
  }, []);

  return {
    ...state,
    delete: delete_,
    reset,
  };
}

/**
 * Combined hook for project CRUD operations
 */
export function useProjectCrud(projectId?: string) {
  const listHook = useProjects();
  const singleHook = useProject(projectId || null);
  const createHook = useCreateProject();
  const updateHook = useUpdateProject(projectId || '');
  const deleteHook = useDeleteProject();

  const refetchList = useCallback(() => {
    listHook.refetch();
  }, [listHook]);

  const refetchSingle = useCallback(() => {
    if (singleHook.refetch) {
      singleHook.refetch();
    }
  }, [singleHook]);

  return {
    list: listHook,
    single: singleHook,
    create: createHook,
    update: updateHook,
    delete: deleteHook,
    refetch: () => {
      refetchList();
      refetchSingle();
    },
  };
}
