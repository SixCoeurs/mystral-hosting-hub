import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, User, RegisterData, LoginData, UpdateProfileData, ChangePasswordData } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (data: LoginData) => {
    const response = await api.login(data);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return { success: response.success, message: response.message };
  };

  const register = async (data: RegisterData) => {
    const response = await api.register(data);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return { success: response.success, message: response.message };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const response = await api.updateProfile(data);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return { success: response.success, message: response.message };
  };

  const changePassword = async (data: ChangePasswordData) => {
    const response = await api.changePassword(data);
    return { success: response.success, message: response.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
