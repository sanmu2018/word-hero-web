import axios from 'axios';
import { ApiResponse, AuthUser, LoginResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class AuthService {
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to login');
    }
  }

  async register(userData: {
    username: string;
    email: string;
    full_name?: string;
    password: string;
    confirm_password?: string;
  }): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to register');
    }
  }

  async getProfile(): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get profile');
    }
  }

  async updateProfile(userData: {
    full_name?: string;
    bio?: string;
  }): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await api.put('/api/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to change password');
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      throw new Error('Failed to logout');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get current user');
    }
  }
}