import { fetchAPI } from './api';

// Types matching AuthEndpoints.cs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName?: string;
  expiresAt: string;
}

export interface UserInfo {
  userId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Auth Service - Handles authentication API calls
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetchAPI<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save token to localStorage
    if (response.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        email: response.email,
        fullName: response.fullName,
      }));
    }
    
    return response;
  },

  /**
   * Logout - clear token and user info
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get current authenticated user info from backend
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const response = await fetchAPI<UserInfo>('/api/auth/me');
      return response;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Get stored user info from localStorage
   */
  getStoredUser(): { email: string; fullName?: string } | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
