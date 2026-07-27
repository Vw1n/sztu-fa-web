import { createContext } from 'react';
import type { UserProfile, loginApi, registerApi } from '../api/auth';

export interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: typeof loginApi;
  register: typeof registerApi;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
