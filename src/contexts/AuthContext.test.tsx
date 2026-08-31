import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import * as authApi from '../api/auth';

vi.mock('../api/auth', () => ({
  getStoredToken: vi.fn(),
  getStoredUser: vi.fn(),
  setStoredToken: vi.fn(),
  setStoredUser: vi.fn(),
  removeStoredAuth: vi.fn(),
  loginApi: vi.fn(),
  logoutApi: vi.fn(),
  registerApi: vi.fn(),
  getMeApi: vi.fn(),
}));

const TestConsumer: React.FC = () => {
  const { user, token, isAuthenticated, loading, login, register, logout, refreshUser } = useAuth();
  if (loading) return <div>加载中...</div>;
  return (
    <div>
      <div data-testid="auth-state">{isAuthenticated ? '已认证' : '未认证'}</div>
      <div data-testid="user-info">{user ? `${user.username}:${user.verificationStatus}:${user.reviewComment || ''}` : '无用户'}</div>
      <div data-testid="token-info">{token || '无Token'}</div>
      <button onClick={() => void login('student', 'pass')}>登录</button>
      <button onClick={() => void register({ username: 'reg', password: 'pwd', studentId: '2026', realName: '姓名', campusCard: new File([], 'c.jpg') })}>注册</button>
      <button onClick={() => void logout()}>退出</button>
      <button onClick={() => void refreshUser()}>刷新用户</button>
    </div>
  );
};

describe('AuthContext 状态管理与联动', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('初始从本地存储恢复凭证并拉取最新用户信息', async () => {
    vi.mocked(authApi.getStoredToken).mockReturnValue('stored-token-1');
    vi.mocked(authApi.getStoredUser).mockReturnValue({
      id: 'm1',
      username: 'student',
      role: 'user',
      verificationStatus: 'PENDING',
    });
    vi.mocked(authApi.getMeApi).mockResolvedValue({
      id: 'm1',
      username: 'student',
      role: 'user',
      verificationStatus: 'APPROVED',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('加载中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('已认证');
      expect(screen.getByTestId('user-info')).toHaveTextContent('student:APPROVED:');
      expect(screen.getByTestId('token-info')).toHaveTextContent('stored-token-1');
    });

    expect(authApi.getMeApi).toHaveBeenCalledWith('stored-token-1');
  });

  it('refreshUser 成功更新审核状态与审核意见', async () => {
    vi.mocked(authApi.getStoredToken).mockReturnValue('valid-token');
    vi.mocked(authApi.getStoredUser).mockReturnValue({
      id: 'm1',
      username: 'student',
      role: 'user',
      verificationStatus: 'PENDING',
    });
    vi.mocked(authApi.getMeApi).mockResolvedValueOnce({
      id: 'm1',
      username: 'student',
      role: 'user',
      verificationStatus: 'PENDING',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('student:PENDING:');
    });

    // 模拟审核状态变为需补充材料并附带退回原因
    vi.mocked(authApi.getMeApi).mockResolvedValueOnce({
      id: 'm1',
      username: 'student',
      role: 'user',
      verificationStatus: 'CHANGES_REQUESTED',
      reviewComment: '照片边缘反光模糊，请重新拍摄',
    });

    await act(async () => {
      screen.getByText('刷新用户').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent(
        'student:CHANGES_REQUESTED:照片边缘反光模糊，请重新拍摄',
      );
    });
  });

  it('收到 401 sztufa_unauthorized 全局事件时，自动清除内存与本地存储状态', async () => {
    vi.mocked(authApi.getStoredToken).mockReturnValue('expired-token');
    vi.mocked(authApi.getStoredUser).mockReturnValue({ id: 'm1', username: 'student', role: 'user' });
    vi.mocked(authApi.getMeApi).mockResolvedValue({ id: 'm1', username: 'student', role: 'user' });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('已认证');
    });

    // 触发全局未授权事件
    act(() => {
      window.dispatchEvent(new Event('sztufa_unauthorized'));
    });

    expect(authApi.removeStoredAuth).toHaveBeenCalled();
    expect(screen.getByTestId('auth-state')).toHaveTextContent('未认证');
    expect(screen.getByTestId('user-info')).toHaveTextContent('无用户');
    expect(screen.getByTestId('token-info')).toHaveTextContent('无Token');
  });

  it('退出登录在网络请求失败时仍安全清除本地会话 (finally 保证)', async () => {
    vi.mocked(authApi.getStoredToken).mockReturnValue('token-123');
    vi.mocked(authApi.getStoredUser).mockReturnValue({ id: 'm1', username: 'student', role: 'user' });
    vi.mocked(authApi.getMeApi).mockResolvedValue({ id: 'm1', username: 'student', role: 'user' });
    vi.mocked(authApi.logoutApi).mockRejectedValue(new Error('500 Server Internal Error'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('已认证');
    });

    await act(async () => {
      screen.getByText('退出').click();
    });

    await waitFor(() => {
      expect(authApi.removeStoredAuth).toHaveBeenCalled();
      expect(screen.getByTestId('auth-state')).toHaveTextContent('未认证');
      expect(screen.getByTestId('user-info')).toHaveTextContent('无用户');
    });
  });
});
