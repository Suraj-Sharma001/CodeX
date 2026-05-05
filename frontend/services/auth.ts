import { apiClient } from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', credentials);
    return response.data.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/login', credentials);
    return response.data.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<any>('/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};
