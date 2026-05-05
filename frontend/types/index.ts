// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    darkMode: boolean;
    emailNotifications: boolean;
    revisionReminders: boolean;
    timezone: string;
  };
  stats?: {
    totalProblems: number;
    totalRevisions: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// Problem types
export interface Problem {
  _id: string;
  userId: string;
  title: string;
  platform: 'LeetCode' | 'Codeforces' | 'HackerRank' | 'CodeChef' | 'AtCoder' | 'Other';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  problemLink?: string;
  dateSolved: string;
  timeTaken: number;
  revisionCount: number;
  isFavorited: boolean;
  status: 'Not Started' | 'In Progress' | 'Solved' | 'Revisiting';
  approaches?: {
    bruteForceSolution?: {
      description: string;
      timeComplexity: string;
      spaceComplexity: string;
    };
    optimizedSolution?: {
      description: string;
      timeComplexity: string;
      spaceComplexity: string;
      keyInsight?: string;
    };
  };
  codeSnippets?: Array<{
    language: string;
    code: string;
    version: number;
    createdAt: string;
  }>;
  keyIntuition?: string;
  mistakesMade?: string[];
  edgeCases?: string[];
  notes?: string;
  tags?: string[];
  revision?: {
    markedForRevision: boolean;
    nextRevisionDate?: string;
    revisionCount: number;
    revisedAt: string[];
    canSolveAgain: boolean;
    confidenceLevel: number;
    easeFactor?: number;
    intervalDays?: number;
    sm2Repetitions?: number;
  };
  createdAt: string;
  updatedAt: string;
  lastReviewedAt?: string;
}

export interface CreateProblemRequest {
  title: string;
  platform: string;
  difficulty: string;
  topics: string[];
  problemLink?: string;
  dateSolved: string;
  timeTaken: number;
  approaches?: any;
  codeSnippets?: any[];
  keyIntuition?: string;
  mistakesMade?: string[];
  edgeCases?: string[];
  notes?: string;
  tags?: string[];
}

export interface ProblemsQuery {
  page?: number;
  limit?: number;
  difficulty?: string;
  platform?: string;
  topic?: string;
  status?: string;
  isFavorited?: boolean;
  markedForRevision?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'dateSolved' | 'revisionCount';
  order?: 'asc' | 'desc';
}

// Analytics types
export interface DashboardStats {
  totalProblems: number;
  totalRevisions: number;
  currentStreak: number;
  longestStreak: number;
  weakAreas: string[];
  revisionsPending: number;
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  topicDistribution: Record<string, number>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}
