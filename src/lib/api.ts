import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth if needed
api.interceptors.request.use((config) => {
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  schoolId: string;
  inclusionScore: number;
}

export interface PollQuestion {
  id: string;
  text: string;
  theme?: string;
}

export interface PollOption {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Poll {
  question: PollQuestion;
  options: PollOption[];
}

export interface Cheer {
  id: string;
  question: string;
  votes: number;
  pollQuestionId: string;
}

export interface MomentData {
  id: string;
  userId: string;
  caption?: string;
  posts: {
    id: string;
    imageUrl: string;
    isFront: boolean;
  }[];
  createdAt: string;
}

// Auth API
export const authApi = {
  verifySchool: (email: string) => api.post('/api/auth/verify-school', { email }),
  setupProfile: (data: { email: string; name: string; profileImage?: string; password: string }) =>
    api.post('/api/auth/setup-profile', data),
};

// Hype API
export const hypeApi = {
  getHypeRound: (userId: string) => api.get(`/api/hype?userId=${userId}`),
  submitVote: (data: { voterId: string; recipientId: string; pollQuestionId: string; hypeRoundId: string }) =>
    api.post('/api/hype/vote', data),
  createHypeRound: (userId: string) => api.post('/api/hype/round', { userId }),
  seedUserAndFriends: () => api.post('/api/hype/seed-user-and-friends'),
};

// Moment API
export const momentApi = {
  createMoment: (data: { userId: string; frontImage: string; backImage: string; caption?: string }) =>
    api.post('/api/moment', data),
};

// Results API
export const resultsApi = {
  getCheers: (userId: string) => api.get(`/api/results?userId=${userId}`),
};

export default api;