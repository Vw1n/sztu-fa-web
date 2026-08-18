import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Teams from '../Teams';
import * as api from '../../../api';

vi.mock('../../../api', () => ({
  fetchTeams: vi.fn(),
  searchTeams: vi.fn(),
  fetchSeasons: vi.fn(),
  fetchTeamPlayersBySeason: vi.fn(),
  fetchPlayerCareer: vi.fn(),
}));

describe('Teams Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchSeasons).mockResolvedValue([
      { id: 'season-1', name: '2026 男子足球联赛', status: 'active' },
    ]);
  });



  it('displays error state and retry button without showing EmptyState when API fails', async () => {
    vi.mocked(api.fetchTeams).mockRejectedValue(new Error('获取球队列表失败'));

    render(<Teams />);

    await waitFor(() => {
      expect(screen.getByText('获取球队列表失败')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '重新加载' })).toBeInTheDocument();
    });

    // Ensure EmptyState message "暂无球队数据" is NOT rendered
    expect(screen.queryByText('暂无球队数据')).not.toBeInTheDocument();
  });

  it('displays EmptyState when API succeeds with empty list', async () => {
    vi.mocked(api.fetchTeams).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(<Teams />);

    await waitFor(() => {
      expect(screen.getByText('暂无球队数据')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: '重新加载' })).not.toBeInTheDocument();
    expect(api.fetchTeams).toHaveBeenCalledTimes(1);
    expect(api.fetchTeams).toHaveBeenCalledWith(1, 50, 'season-1', 'MALE');
  });

  it('allows clicking retry button to refetch data', async () => {
    let shouldFail = true;
    vi.mocked(api.fetchTeams).mockImplementation(async () => {
      if (shouldFail) {
        throw new Error('网络连接超时');
      }
      return {
        data: [
          {
            id: 'team-1',
            teamName: '计算机学院队',
            teamLogo: '/logo.png',
            groupTeams: [],
            teamDoctor: '无',
            headCoach: '无',
            teamLeader: '无',
            coachPhone: '',
            leaderPhone: '',
            homeJerseyColor: '红色',
            awayJerseyColor: '蓝色',
            homeJersey: '',
            awayJersey: '',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };

    });


    render(<Teams />);

    await waitFor(() => {
      expect(screen.getByText('网络连接超时')).toBeInTheDocument();
    });

    shouldFail = false;
    const retryBtn = screen.getByRole('button', { name: '重新加载' });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('计算机学院队')).toBeInTheDocument();
    });
  });

  it('paginates the already loaded team list without requesting it again', async () => {
    vi.mocked(api.fetchTeams).mockResolvedValue({
      data: Array.from({ length: 9 }, (_, index) => ({
        id: `team-${index + 1}`,
        teamName: `球队 ${index + 1}`,
        teamLogo: '',
        groupTeams: [],
        teamDoctor: '',
        headCoach: '',
        teamLeader: '',
        coachPhone: '',
        leaderPhone: '',
        homeJerseyColor: '',
        awayJerseyColor: '',
        homeJersey: '',
        awayJersey: '',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      })),
      total: 9,
      page: 1,
      limit: 50,
    });

    render(<Teams />);

    await waitFor(() => expect(screen.getByText('球队 1')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => expect(screen.getByText('球队 9')).toBeInTheDocument());
    expect(api.fetchTeams).toHaveBeenCalledTimes(1);
  });
});

