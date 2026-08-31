import api from './api.js';
import { User, StudentProfile } from '../types/index.js';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  roll_number: string;
  department: string;
  section: string;
  phone_number: string;
  skills?: string[];
  interests?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  profile?: StudentProfile | null;
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User; profile?: StudentProfile | null }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async getProfile(): Promise<{ success: boolean; user: User; studentProfile?: StudentProfile | null }> {
    const res = await api.get('/profile');
    return res.data;
  },

  async updatePreferences(preferences: { skills: string[]; interests: string[] }): Promise<{ success: boolean; message: string; preferences: any }> {
    const res = await api.put('/profile/preferences', preferences);
    return res.data;
  },
};
