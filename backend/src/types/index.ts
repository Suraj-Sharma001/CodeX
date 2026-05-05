// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserResponse;
}

// User types
export interface UserResponse {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface UserDocument extends UserResponse {
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

// Problem types
export interface ApproachDetail {
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyInsight?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  version: number;
  createdAt: Date;
}

export interface RevisionInfo {
  markedForRevision: boolean;
  nextRevisionDate?: Date;
  revisionCount: number;
  revisedAt: Date[];
  canSolveAgain: boolean;
  confidenceLevel: number;
  easeFactor?: number;
  intervalDays?: number;
  sm2Repetitions?: number;
}

export interface ProblemRequest {
  title: string;
  platform: "LeetCode" | "Codeforces" | "HackerRank" | "CodeChef" | "AtCoder" | "Other";
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  problemLink?: string;
  dateSolved: Date;
  timeTaken: number;
  approaches?: {
    bruteForceSolution?: ApproachDetail;
    optimizedSolution?: ApproachDetail;
  };
  codeSnippets?: CodeSnippet[];
  keyIntuition?: string;
  mistakesMade?: string[];
  edgeCases?: string[];
  notes?: string;
  tags?: string[];
  relatedProblems?: string[];
}

export interface ProblemResponse extends ProblemRequest {
  _id: string;
  userId: string;
  status: "Not Started" | "In Progress" | "Solved" | "Revisiting";
  isFavorited: boolean;
  revisionCount: number;
  revision?: RevisionInfo;
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
}

// Revision types
export interface RevisionScheduleRequest {
  problemId: string;
  performanceRating: number;
  canSolveAgain: boolean;
  notes?: string;
}

export interface RevisionScheduleResponse {
  _id: string;
  userId: string;
  problemId: string;
  dueDate: Date;
  revisionNumber: number;
  status: "Pending" | "Completed" | "Skipped";
  difficulty: string;
  priority: number;
  completedAt?: Date;
  performanceRating?: number;
  createdAt: Date;
  updatedAt: Date;
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

// API Error Response
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string>;
}

// API Success Response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

// Query filters
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
  sortBy?: "createdAt" | "dateSolved" | "revisionCount";
  order?: "asc" | "desc";
}
