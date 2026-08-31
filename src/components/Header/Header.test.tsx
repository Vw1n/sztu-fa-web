import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import * as AuthContextModule from '../../contexts';

vi.mock('../../contexts', () => ({
  useAuth: vi.fn(),
}));

describe('Header Component 审核状态入口', () => {
  it('未登录时不显示用户信息与审核徽章', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // 未登录时隐藏登录/注册/学号绑定入口（功能暂未开放）
    expect(screen.queryByText('登录')).not.toBeInTheDocument();
    expect(screen.queryByText('注册绑定学号')).not.toBeInTheDocument();
    expect(screen.queryByText('审核中')).not.toBeInTheDocument();
  });

  it('待审核状态用户显示“审核中”标签并链接至 /verification', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: {
        id: 'u1',
        username: 'test_user',
        nickname: '小明',
        role: 'user',
        studentId: '2026112233',
        verificationStatus: 'PENDING',
      },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getAllByText('小明').length).toBeGreaterThan(0);
    const badges = screen.getAllByText('审核中');
    expect(badges.length).toBeGreaterThan(0);
    const link = badges[0].closest('a');
    expect(link).toHaveAttribute('href', '/verification');
  });

  it('待补充材料状态用户显示“待补充”标签', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: {
        id: 'u2',
        username: 'test_user_2',
        role: 'user',
        verificationStatus: 'CHANGES_REQUESTED',
        reviewComment: '照片不清晰',
      },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const badges = screen.getAllByText('待补充');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].closest('a')).toHaveAttribute('href', '/verification');
  });

  it('审核通过用户显示“已认证”标签', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: {
        id: 'u3',
        username: 'verified_user',
        role: 'user',
        verificationStatus: 'APPROVED',
        studentId: '2026888999',
      },
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const badges = screen.getAllByText('已认证');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].closest('a')).toHaveAttribute('href', '/verification');
  });
});
