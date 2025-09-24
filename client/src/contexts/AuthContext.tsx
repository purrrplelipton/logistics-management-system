'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, RegisterData } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) {
      return;
    }

    let mounted = true;
    
    const initializeAuth = async () => {
      // Skip if running on server or already initialized
      if (typeof window === 'undefined' || initialized.current || !mounted) {
        return;
      }

      initialized.current = true;

      try {
        // Try to get current user from server (will use cookie automatically)
        const response = await authAPI.getMe();
        if (mounted && !initialized.current) {
          return; // Another initialization started, abort
        }
        if (mounted) {
          setUser(response.data.data);
        }
      } catch {
        // User is not authenticated, which is fine
        // Don't redirect here, let the page components handle routing
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Only run initialization once
    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array to run only once

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData } = response.data.data;

      setUser(userData);
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
      const { user: newUser } = response.data.data;

      setUser(newUser);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      // Redirect to login page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear user on client
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};