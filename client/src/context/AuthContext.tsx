import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, StudentProfile } from '../types/index.js';
import { authService, RegisterPayload } from '../services/authService.js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isEduCell: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => void;
  updatePreferences: (preferences: { skills: string[]; interests: string[] }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('eventra_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('eventra_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eventra_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('eventra_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          setProfile(res.profile || null);
          localStorage.setItem('eventra_user', JSON.stringify(res.user));
          if (res.profile) {
            localStorage.setItem('eventra_profile', JSON.stringify(res.profile));
          }
        } catch {
          // Token invalid
          localStorage.removeItem('eventra_token');
          localStorage.removeItem('eventra_user');
          localStorage.removeItem('eventra_profile');
          setUser(null);
          setProfile(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await authService.login(credentials);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.profile || null);

    localStorage.setItem('eventra_token', res.token);
    localStorage.setItem('eventra_user', JSON.stringify(res.user));
    if (res.profile) {
      localStorage.setItem('eventra_profile', JSON.stringify(res.profile));
    }

    toast.success(res.message || `Welcome back, ${res.user.name}!`);
    return res.user;
  };

  const register = async (data: RegisterPayload): Promise<User> => {
    const res = await authService.register(data);
    setToken(res.token);
    setUser(res.user);
    setProfile(res.profile || null);

    localStorage.setItem('eventra_token', res.token);
    localStorage.setItem('eventra_user', JSON.stringify(res.user));
    if (res.profile) {
      localStorage.setItem('eventra_profile', JSON.stringify(res.profile));
    }

    toast.success('Registration successful! Welcome to Eventra.');
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('eventra_token');
    localStorage.removeItem('eventra_user');
    localStorage.removeItem('eventra_profile');
    setUser(null);
    setProfile(null);
    setToken(null);
    toast.info('Logged out successfully.');
  };

  const updatePreferences = async (preferences: { skills: string[]; interests: string[] }) => {
    const res = await authService.updatePreferences(preferences);
    if (profile) {
      const updated = { ...profile, ...preferences };
      setProfile(updated);
      localStorage.setItem('eventra_profile', JSON.stringify(updated));
    }
    toast.success(res.message || 'Preferences updated!');
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.user);
      setProfile(res.profile || null);
      localStorage.setItem('eventra_user', JSON.stringify(res.user));
      if (res.profile) {
        localStorage.setItem('eventra_profile', JSON.stringify(res.profile));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const isStudent = user?.role === 'STUDENT';
  const isTeacher = user?.role === 'TEACHER';
  const isEduCell = user?.role === 'EDUCELL';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        isStudent,
        isTeacher,
        isEduCell,
        login,
        register,
        logout,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
