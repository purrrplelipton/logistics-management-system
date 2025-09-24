'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// Secure storage utilities - prefer sessionStorage over localStorage
const TokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    // Try sessionStorage first (more secure), fallback to localStorage for persistence
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  },
  
  setToken: (token: string, persistent: boolean = false): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('token', token);
    if (persistent) {
      localStorage.setItem('token', token);
    }
  },
  
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
  },
  
  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  setUser: (user: User, persistent: boolean = false): void => {
    if (typeof window === 'undefined') return;
    const userStr = JSON.stringify(user);
    sessionStorage.setItem('user', userStr);
    if (persistent) {
      localStorage.setItem('user', userStr);
    }
  },
  
  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const savedToken = TokenStorage.getToken();
      const savedUser = TokenStorage.getUser();

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(savedUser);
          
          // Verify token is still valid
          await authAPI.getMe();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token: userToken } = response.data.data;

      setUser(userData);
      setToken(userToken);
      
      // Store in sessionStorage by default, with option for persistent storage
      TokenStorage.setToken(userToken, false);
      TokenStorage.setUser(userData, false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token: userToken } = response.data.data;

      setUser(newUser);
      setToken(userToken);
      
      // Store in sessionStorage by default
      TokenStorage.setToken(userToken, false);
      TokenStorage.setUser(newUser, false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    TokenStorage.removeToken();
    TokenStorage.removeUser();
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};