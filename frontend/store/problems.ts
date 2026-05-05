import { create } from 'zustand';
import { Problem, PaginatedResponse } from '@/types';
import { problemsService } from '@/services/problems';

interface ProblemsStore {
  problems: Problem[];
  currentProblem: Problem | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;

  setProblems: (problems: Problem[]) => void;
  setCurrentProblem: (problem: Problem) => void;
  getProblems: (query?: any) => Promise<void>;
  getProblemById: (id: string) => Promise<void>;
  createProblem: (data: any) => Promise<void>;
  updateProblem: (id: string, data: any) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  markForRevision: (id: string, confidenceLevel: number) => Promise<void>;
  clearError: () => void;
}

export const useProblemsStore = create<ProblemsStore>((set) => ({
  problems: [],
  currentProblem: null,
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,

  setProblems: (problems: Problem[]) =>
    set({ problems }),

  setCurrentProblem: (problem: Problem) =>
    set({ currentProblem: problem }),

  getProblems: async (query?: any) => {
    set({ isLoading: true, error: null });
    try {
      const result = await problemsService.getProblems(query);
      set({
        problems: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to fetch problems';
      set({ error: message, isLoading: false });
    }
  },

  getProblemById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const problem = await problemsService.getProblemById(id);
      set({
        currentProblem: problem,
        isLoading: false,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to fetch problem';
      set({ error: message, isLoading: false });
    }
  },

  createProblem: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const problem = await problemsService.createProblem(data);
      set((state) => ({
        problems: [problem, ...state.problems],
        total: state.total + 1,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create problem';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateProblem: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await problemsService.updateProblem(id, data);
      set((state) => ({
        problems: state.problems.map((p) => (p._id === id ? updated : p)),
        currentProblem: state.currentProblem?._id === id ? updated : state.currentProblem,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update problem';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteProblem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await problemsService.deleteProblem(id);

      const result = await problemsService.getProblems();

      set((state) => ({
        problems: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete problem';
      set({ error: message, isLoading: false });
      throw error;  
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      const updated = await problemsService.toggleFavorite(id);
      set((state) => ({
        problems: state.problems.map((p) => (p._id === id ? updated : p)),
        currentProblem: state.currentProblem?._id === id ? updated : state.currentProblem,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to toggle favorite';
      set({ error: message });
    }
  },

  markForRevision: async (id: string, confidenceLevel: number) => {
    try {
      const updated = await problemsService.markForRevision(id, confidenceLevel);
      set((state) => ({
        problems: state.problems.map((p) => (p._id === id ? updated : p)),
        currentProblem: state.currentProblem?._id === id ? updated : state.currentProblem,
      }));
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to mark for revision';
      set({ error: message });
      throw error;
    }
  },

  clearError: () =>
    set({ error: null }),
}));
