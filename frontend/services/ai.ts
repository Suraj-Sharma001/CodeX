import { apiClient } from './api';

export const aiService = {
  summarize: async (problemId: string): Promise<string> => {
    const res = await apiClient.post<any>('/ai/summarize', { problemId });
    return res.data.data.text;
  },

  approachToCode: async (
    problemId: string,
    language = 'typescript'
  ): Promise<string> => {
    const res = await apiClient.post<any>('/ai/approach-to-code', {
      problemId,
      language,
    });
    return res.data.data.text;
  },

  improvements: async (problemId: string): Promise<string> => {
    const res = await apiClient.post<any>('/ai/improvements', { problemId });
    return res.data.data.text;
  },

  interviewExplain: async (problemId: string): Promise<string> => {
    const res = await apiClient.post<any>('/ai/interview-explain', { problemId });
    return res.data.data.text;
  },

  missingEdges: async (problemId: string): Promise<string> => {
    const res = await apiClient.post<any>('/ai/missing-edges', { problemId });
    return res.data.data.text;
  },
};
