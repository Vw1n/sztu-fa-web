import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Activities from '../Activities';
import * as api from '../../../api';

vi.mock('../../../api', () => ({
  fetchNews: vi.fn(),
}));

describe('Activities Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays error message and retry button on fetch error, never silently showing mock data', async () => {
    vi.mocked(api.fetchNews).mockRejectedValue(new Error('获取活动资讯失败'));

    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByText('获取活动资讯失败')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument();
    });

    expect(screen.queryByText('⚠️ 当前页面展示的是开发模拟数据')).not.toBeInTheDocument();
  });

  it('allows clicking retry button to attempt reload', async () => {
    vi.mocked(api.fetchNews)
      .mockRejectedValueOnce(new Error('请求失败'))
      .mockResolvedValueOnce({
        data: [
          {
            id: 'news-1',
            title: '校长杯开幕式',
            description: '精彩盛宴',
            category: '赛事通知',
            date: '2026-09-01',
            wechatUrl: '#',
            createdAt: '2026-09-01T00:00:00Z',
            updatedAt: '2026-09-01T00:00:00Z',
          },
        ],


        total: 1,
        page: 1,
        limit: 6,
      });

    render(<Activities />);

    await waitFor(() => {
      expect(screen.getByText('请求失败')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: '重新加载' });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('校长杯开幕式')).toBeInTheDocument();
    });
  });

  it('displays corrected description copy without "of"', () => {
    vi.mocked(api.fetchNews).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 6,
    });

    render(<Activities />);

    expect(screen.getByText(/参与丰富多彩的足球活动/)).toBeInTheDocument();
    expect(screen.queryByText(/of 足球活动/)).not.toBeInTheDocument();
  });
});
