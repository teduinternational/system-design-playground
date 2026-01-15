import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserInfo } from '../services/auth.service';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider - Quản lý trạng thái authentication cho toàn bộ app
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Kiểm tra xem user có đang authenticated không
   */
  const checkAuth = async () => {
    setIsLoading(true);
    
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Verify token với backend
      const userInfo = await authService.getCurrentUser();
      
      if (userInfo) {
        setUser(userInfo);
      } else {
        // Token invalid, clear storage
        authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      // Fetch full user info from backend
      const userInfo = await authService.getCurrentUser();
      
      if (userInfo) {
        setUser(userInfo);
      } else {
        // Fallback to response data
        setUser({
          userId: '',
          email: response.email,
          fullName: response.fullName,
          isActive: true,
          roles: [],
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook để sử dụng Auth Context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
