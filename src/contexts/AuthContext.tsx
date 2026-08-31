import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../api/auth';
import {
  getStoredToken,
  getStoredUser,
  removeStoredAuth,
  loginApi,
  logoutApi,
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

  const handleRegister: typeof registerApi = async (input) => {
    const res = await registerApi(input);
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
        logout: () => { void logoutApi().finally(handleLogout).catch(() => { /* 本地会话仍清理，旧凭证按到期时间失效 */ }); },
        refreshUser: handleRefreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
