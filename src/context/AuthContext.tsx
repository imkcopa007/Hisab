import React, { createContext, useContext, useState, useEffect } from 'react';
import { ManagerUser } from '../types';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../lib/api';

interface AuthContextType {
  manager: ManagerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (loginId: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [manager, setManager] = useState<ManagerUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const user = await api.auth.getMe();
      setManager(user);
    } catch (err) {
      clearStoredToken();
      setToken(null);
      setManager(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      setManager(null);
      setToken(null);
    };

    window.addEventListener('auth-expired', handleAuthExpired);

    if (token) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [token]);

  const login = async (loginId: string, pass: string) => {
    const res = await api.auth.login(loginId, pass);
    setStoredToken(res.token);
    setToken(res.token);
    setManager(res.manager);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    } finally {
      clearStoredToken();
      setToken(null);
      setManager(null);
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await api.auth.changePassword(currentPass, newPass);
    if (manager) {
      setManager({ ...manager, mustChangePassword: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        manager,
        token,
        isLoading,
        login,
        logout,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
