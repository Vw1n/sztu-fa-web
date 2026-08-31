import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Verification from './Verification';
import * as authApi from '../api/auth';

const refreshUser = vi.fn();
let mockUser: Pick<authApi.UserProfile, 'id' | 'username' | 'verificationStatus' | 'reviewComment'> | null = null;
let mockLoading = false;

vi.mock('../contexts', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockLoading,
    refreshUser,
  }),
}));

vi.mock('../components/Header', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../api/auth', () => ({
  resubmitCard: vi.fn(),
}));

describe('Verification 审核状态展示与材料补交页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockLoading = false;
    URL.createObjectURL = vi.fn(() => 'blob:test-preview');
    URL.revokeObjectURL = vi.fn();
  });

  it('加载中状态展示', () => {
    mockLoading = true;
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByText('加载中…')).toBeInTheDocument();
  });

  it('未登录状态引导用户登录或注册', () => {
    mockLoading = false;
    mockUser = null;
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByText(/请先/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '登录' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: '注册并上传校园卡' })).toHaveAttribute('href', '/register');
  });

  it('待审核状态 (PENDING) 正确渲染状态与限制提示', () => {
    mockUser = {
      id: 'm1',
      username: 'student',
      verificationStatus: 'PENDING',
    };
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('校园卡待审核');
    expect(screen.getByText(/审核通过前可浏览赛事，但不能提交新助威/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '刷新审核状态' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '提交 / 更新校园卡材料' })).toBeInTheDocument();
  });

  it('需补充材料状态 (CHANGES_REQUESTED) 展示退回原因并允许重新上传', () => {
    mockUser = {
      id: 'm1',
      username: 'student',
      verificationStatus: 'CHANGES_REQUESTED',
      reviewComment: '学号遮挡无法核对，请重新拍照上传',
    };
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('请补充校园卡材料');
    expect(screen.getByRole('status')).toHaveTextContent('审核说明：学号遮挡无法核对，请重新拍照上传');
  });

  it('审核通过状态 (APPROVED) 呈现自动清理说明与助威链接，隐藏补交表单', () => {
    mockUser = {
      id: 'm1',
      username: 'student',
      verificationStatus: 'APPROVED',
    };
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('校园卡审核通过');
    expect(screen.getByText(/审核已通过，图片自动清理，不再提供查看/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '前往助威' })).toHaveAttribute('href', '/predictions');
    expect(screen.queryByRole('button', { name: '提交 / 更新校园卡材料' })).not.toBeInTheDocument();
  });

  it('点击刷新审核状态调用 refreshUser', () => {
    mockUser = { id: 'm1', username: 'student', verificationStatus: 'PENDING' };
    render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: '刷新审核状态' }));
    expect(refreshUser).toHaveBeenCalled();
  });

  it('补交材料表单提交：完整填写并勾选同意后调用 resubmitCard', async () => {
    mockUser = {
      id: 'm1',
      username: 'student',
      verificationStatus: 'CHANGES_REQUESTED',
    };
    vi.mocked(authApi.resubmitCard).mockResolvedValue(undefined);

    const { container } = render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );

    // 填写姓名与学号
    fireEvent.change(screen.getByLabelText('校园卡姓名（仅用于审核）'), { target: { value: '真实姓名' } });
    fireEvent.change(screen.getByLabelText('学号'), { target: { value: '2026123456' } });

    // 上传图片
    const cardFile = new File(['valid-image-bytes'], 'card.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('校园卡照片（必填）'), {
      target: { files: [cardFile] },
    });

    // 勾选同意说明
    fireEvent.click(screen.getByRole('checkbox'));

    // 提交表单
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(authApi.resubmitCard).toHaveBeenCalledWith('真实姓名', '2026123456', cardFile);
      expect(refreshUser).toHaveBeenCalled();
    });
  });

  it('补交材料接口报错时展示错误提示', async () => {
    mockUser = { id: 'm1', username: 'student', verificationStatus: 'CHANGES_REQUESTED' };
    vi.mocked(authApi.resubmitCard).mockRejectedValue(new Error('当前账号不能补交材料'));

    const { container } = render(
      <MemoryRouter>
        <Verification />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('校园卡姓名（仅用于审核）'), { target: { value: '姓名' } });
    fireEvent.change(screen.getByLabelText('学号'), { target: { value: '2026123456' } });
    fireEvent.change(screen.getByLabelText('校园卡照片（必填）'), {
      target: { files: [new File(['bytes'], 'card.png', { type: 'image/png' })] },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('当前账号不能补交材料');
    });
  });
});
