import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService, { LoginRequest, RegisterRequest, AuthResponse, User } from '@/lib/api';

// Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (credentials: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  initiateGoogleAuth: (role: string) => void;
}

// Context
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get user profile from cookies
        const userProfile = await apiService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // User is not authenticated, which is fine
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiService.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (credentials: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiService.register(credentials);
    setUser(response.user);
    return response;
  };

  const logout = async (): Promise<void> => {
    await apiService.logout();
    setUser(null);
  };

  const logoutAll = async (): Promise<void> => {
    await apiService.logoutAll();
    setUser(null);
  };

  const initiateGoogleAuth = (role: string): void => {
    // Simple full-page redirect to backend Google OAuth endpoint
    const authUrl = apiService.getGoogleAuthUrl(role);
    console.log('[Google OAuth] redirecting to:', authUrl);
    window.location.href = authUrl;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    logoutAll,
    initiateGoogleAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
