import { apiClient } from './api';
import { DashboardStats } from '@/types';

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<any>('/analytics/dashboard');
    return response.data.data;
  },

  getTopicWiseStats: async (): Promise<any> => {
    const response = await apiClient.get<any>('/analytics/topic-wise');
    return response.data.data;
  },

  getDailyActivity: async (days: number = 30): Promise<any> => {
    const response = await apiClient.get<any>(`/analytics/daily-activity?days=${days}`);
    return response.data.data;
  },
};
