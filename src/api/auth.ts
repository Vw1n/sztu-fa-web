import { BASE_URL, apiFetch } from './http';

export interface UserProfile {
  id: string;
  username: string;
  studentId?: string | null;
  nickname?: string | null;
  role: string;
  verificationStatus?: string;
  verificationVersion?: number;
  reviewComment?: string;
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
  const response = await apiFetch(`${BASE_URL}/member-auth/login`, {
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

export async function registerApi(input: { username: string; password: string; studentId: string; nickname?: string; realName: string; campusCard: File }): Promise<AuthResponse> {
  const body = new FormData();
  Object.entries(input).forEach(([key, value]) => { if (value !== undefined) body.append(key, value); });
  body.append('consentVersion', 'campus-card-v1');
  const response = await apiFetch(`${BASE_URL}/member-auth/register`, { method: 'POST', body });
  const data = await response.json();
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join('；') : data.message || '注册失败');
  setStoredToken(data.token); setStoredUser(data.user);
  return data;
}

export async function resubmitCard(realName: string, studentId: string, campusCard: File) {
  const body = new FormData();
  body.append('realName', realName); body.append('studentId', studentId);
  body.append('campusCard', campusCard); body.append('consentVersion', 'campus-card-v1');
  const response = await apiFetch(`${BASE_URL}/member-auth/campus-card`, { method: 'POST', headers: { Authorization: `Bearer ${getStoredToken()}` }, body });
  const data = await response.json();
  if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join('；') : data.message || '提交失败');
}
export async function logoutApi() {
  const token = getStoredToken();
  if (token) await apiFetch(`${BASE_URL}/member-auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

export async function getMeApi(token: string): Promise<UserProfile> {
  const response = await apiFetch(`${BASE_URL}/member-auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '获取用户信息失败');
  }
  setStoredUser(data);
  return data;
}
