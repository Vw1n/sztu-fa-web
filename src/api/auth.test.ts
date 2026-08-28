import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
  loginApi,
  registerApi,
  resubmitCard,
  logoutApi,
  getMeApi,
  getStoredToken,
  setStoredToken,
  removeStoredAuth,
  getStoredUser,
  setStoredUser,
} from './auth';
import * as httpModule from './http';

function mockResponse(value: { ok: boolean; json?: () => Promise<unknown> }): Response {
  const response = new Response(null, { status: value.ok ? 200 : 401 });
  if (value.json) response.json = value.json;
  return response;
}

vi.mock('./http', () => ({
  BASE_URL: 'http://127.0.0.1:3000/api/v1',
  apiFetch: vi.fn(),
}));

describe('auth.ts 网页端认证 API 客户端与本地存储', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    vi.mocked(httpModule.apiFetch).mockReset();
    store = {};
    const mockStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    vi.stubGlobal('localStorage', mockStorage);
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
      });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('本地存储存取与清除 helpers 行为正确', () => {
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();

    setStoredToken('test-token-xyz');
    setStoredUser({ id: 'm1', username: 'student', role: 'user' });

    expect(getStoredToken()).toBe('test-token-xyz');
    expect(getStoredUser()).toEqual({ id: 'm1', username: 'student', role: 'user' });

    removeStoredAuth();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('loginApi 成功时持久化 token 与 user，失败时抛出错误', async () => {
    const mockSuccessResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        token: 'signed-member-jwt',
        user: { id: 'm1', username: 'student', role: 'user', verificationStatus: 'PENDING' },
      }),
    };
    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse(mockSuccessResponse));

    const res = await loginApi('student', 'SecretPassword!2026');
    expect(httpModule.apiFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/member-auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'student', password: 'SecretPassword!2026' }),
      }),
    );
    expect(res.token).toBe('signed-member-jwt');
    expect(getStoredToken()).toBe('signed-member-jwt');
    expect(getStoredUser()?.username).toBe('student');

    // 失败场景
    const mockFailResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({ message: '用户名或密码错误' }),
    };
    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse(mockFailResponse));

    await expect(loginApi('student', 'WrongPassword')).rejects.toThrow('用户名或密码错误');
  });

  it('registerApi 构造包含校园卡与 consentVersion 的 FormData', async () => {
    const cardFile = new File(['fake-card-bytes'], 'card.webp', { type: 'image/webp' });
    const mockSuccessResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        token: 'new-member-jwt',
        user: { id: 'm2', username: 'new_student', role: 'user', verificationStatus: 'PENDING' },
      }),
    };
    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse(mockSuccessResponse));

    const res = await registerApi({
      username: 'new_student',
      password: 'LongPasswordSecret!2026',
      nickname: '小明',
      realName: '王小明',
      studentId: '20269999',
      campusCard: cardFile,
    });

    expect(httpModule.apiFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/member-auth/register',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }),
    );

    const calledBody = vi.mocked(httpModule.apiFetch).mock.calls[0][1]?.body;
    expect(calledBody).toBeInstanceOf(FormData);
    if (!(calledBody instanceof FormData)) throw new Error('注册请求必须使用 FormData');
    expect(calledBody.get('username')).toBe('new_student');
    expect(calledBody.get('realName')).toBe('王小明');
    expect(calledBody.get('studentId')).toBe('20269999');
    expect(calledBody.get('consentVersion')).toBe('campus-card-v1');

    expect(res.token).toBe('new-member-jwt');
    expect(getStoredToken()).toBe('new-member-jwt');
  });

  it('resubmitCard 发送带 Authorization 请求头的补交材料请求', async () => {
    setStoredToken('existing-auth-token');
    const newCardFile = new File(['new-bytes'], 'new-card.png', { type: 'image/png' });

    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    }));

    await resubmitCard('真实姓名', '20268888', newCardFile);

    expect(httpModule.apiFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/member-auth/campus-card',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer existing-auth-token' },
        body: expect.any(FormData),
      }),
    );
  });

  it('logoutApi 与 getMeApi 行为正确', async () => {
    setStoredToken('my-token');
    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse({ ok: true }));

    await logoutApi();
    expect(httpModule.apiFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/api/v1/member-auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer my-token' },
      }),
    );

    vi.mocked(httpModule.apiFetch).mockResolvedValueOnce(mockResponse({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'm1', username: 'student', role: 'user' }),
    }));

    const user = await getMeApi('my-token');
    expect(user.username).toBe('student');
    expect(getStoredUser()?.username).toBe('student');
  });
});
