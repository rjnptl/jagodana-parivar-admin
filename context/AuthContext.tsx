import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ADMIN_AUTH_EXPIRED_EVENT, ApiService } from '../services/apiService';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  type: string;
}

export interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists in localStorage on mount
  useEffect(() => {
    checkAuth();
    const handleExpiredSession = () => clearLocalSession();
    window.addEventListener(ADMIN_AUTH_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(ADMIN_AUTH_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  const clearLocalSession = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminUser');
    setAccessToken(null);
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      if (!localStorage.getItem('accessToken')) {
        const refreshed = await ApiService.refreshAdminSession();
        if (!refreshed) return;
      }
      const currentUser = await ApiService.getCurrentAdmin();
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      localStorage.setItem('adminUser', JSON.stringify(currentUser));
      setAccessToken(token);
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to restore auth:', error);
      clearLocalSession();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await ApiService.adminLogin(email, password);

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: userData, accessToken: token } = data.data;

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));

      // Update state
      setAccessToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await ApiService.adminLogout();
    } finally {
      clearLocalSession();
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoggedIn: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
