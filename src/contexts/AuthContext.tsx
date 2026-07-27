import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../api/auth';
import {
  getStoredToken,
  getStoredUser,
  removeStoredAuth,
  loginApi,
  registerApi,
  getMeApi,
} from '../api/auth';
import { AuthContext } from './AuthContext.types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = () => {
    removeStoredAuth();
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const freshUser = await getMeApi(storedToken);
          setUser(freshUser);
          setToken(storedToken);
        } catch {
          handleLogout();
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();

    const onUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener('sztufa_unauthorized', onUnauthorized);
    return () => window.removeEventListener('sztufa_unauthorized', onUnauthorized);
  }, []);

  const handleLogin: typeof loginApi = async (username, password) => {
    const res = await loginApi(username, password);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const handleRegister: typeof registerApi = async (username, password, studentId, nickname) => {
    const res = await registerApi(username, password, studentId, nickname);
    setUser(res.user);
    setToken(res.token);
    return res;
  };

  const handleRefreshUser = async () => {
    const currentToken = token || getStoredToken();
    if (currentToken) {
      try {
        const updated = await getMeApi(currentToken);
        setUser(updated);
      } catch {
        handleLogout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser: handleRefreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
