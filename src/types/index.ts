export interface Word {
  id: string;
  english: string;
  chinese: string;
  phonetic?: string;
  difficulty?: number;
  category?: string;
}

export interface PageData {
  currentPage: number;
  totalPages: number;
  totalWords: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface SearchParams {
  q: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Stats {
  totalKnownWords: number;
  totalLearningDays: number;
  averageWordsPerDay: number;
}