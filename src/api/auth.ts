import { BASE_URL, apiFetch } from './http';

export interface UserProfile {
  id: string;
  username: string;
  studentId?: string | null;
  nickname?: string | null;
  role: string;
  teamId?: string | null;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
}

const TOKEN_KEY = 'sztufa_user_token';
const USER_KEY = 'sztufa_user_profile';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function removeStoredAuth(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  const response = await apiFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '登录失败，请检查用户名和密码');
  }

  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function registerApi(
  username: string,
  password: string,
  studentId: string,
  nickname?: string,
): Promise<AuthResponse> {
  const response = await apiFetch(`${BASE_URL}/auth/student-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, studentId, nickname }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '注册失败，请检查填写信息');
  }

  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function getMeApi(token: string): Promise<UserProfile> {
  const response = await apiFetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '获取用户信息失败');
  }
  setStoredUser(data);
  return data;
}
