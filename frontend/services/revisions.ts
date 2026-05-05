import { apiClient } from './api';
import { Problem } from '@/types';

export interface RevisionStats {
  dueNow: number;
  overdue: number;
  upcomingWeek: number;
  markedTotal: number;
}

export const revisionsService = {
  getPending: async (limit?: number): Promise<Problem[]> => {
    const q = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<any>(`/revisions/pending${q}`);
    return response.data.data;
  },

  getStats: async (): Promise<RevisionStats> => {
    const response = await apiClient.get<any>('/revisions/stats');
    return response.data.data;
  },

  complete: async (
    problemId: string,
    body: { performanceRating: number; canSolveAgain: boolean }
  ): Promise<Problem> => {
    const response = await apiClient.post<any>(
      `/revisions/${problemId}/complete`,
      body
    );
    return response.data.data;
  },
};
