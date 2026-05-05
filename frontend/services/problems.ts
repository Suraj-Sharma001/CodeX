import { apiClient } from './api';
import { Problem, CreateProblemRequest, PaginatedResponse } from '@/types';

export const problemsService = {
  createProblem: async (data: CreateProblemRequest): Promise<Problem> => {
    const response = await apiClient.post<any>('/problems', data);
    return response.data.data;
  },

  getProblems: async (query?: any): Promise<PaginatedResponse<Problem>> => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await apiClient.get<any>(`/problems?${params.toString()}`);
    return response.data.data;
  },

  getProblemById: async (id: string): Promise<Problem> => {
    const response = await apiClient.get<any>(`/problems/${id}`);
    return response.data.data;
  },

  updateProblem: async (id: string, data: Partial<CreateProblemRequest>): Promise<Problem> => {
    const response = await apiClient.put<any>(`/problems/${id}`, data);
    return response.data.data;
  },

  deleteProblem: async (id: string): Promise<void> => {
    await apiClient.delete(`/problems/${id}`);
  },

  toggleFavorite: async (id: string): Promise<Problem> => {
    const response = await apiClient.post<any>(`/problems/${id}/toggle-favorite`);
    return response.data.data;
  },

  markForRevision: async (id: string, confidenceLevel: number): Promise<Problem> => {
    const response = await apiClient.post<any>(`/problems/${id}/mark-for-revision`, { confidenceLevel });
    return response.data.data;
  },
};
