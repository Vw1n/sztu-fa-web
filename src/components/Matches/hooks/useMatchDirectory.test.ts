import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../../../api';
import { useMatchDirectory } from './useMatchDirectory';

vi.mock('../../../api', () => ({
  fetchMatches: vi.fn(),
  fetchSeasons: vi.fn(),
  fetchTeams: vi.fn(),
}));

describe('useMatchDirectory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.fetchMatches).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 5,
    });
    vi.mocked(api.fetchTeams).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 100,
    });
  });

  it('waits for the season list and loads the latest season instead of an older active season', async () => {
    let resolveSeasons: ((value: Awaited<ReturnType<typeof api.fetchSeasons>>) => void) | undefined;
    vi.mocked(api.fetchSeasons).mockReturnValue(
      new Promise((resolve) => {
        resolveSeasons = resolve;
      }),
    );

    const { result } = renderHook(() => useMatchDirectory());

    expect(api.fetchMatches).not.toHaveBeenCalled();

    await act(async () => {
      resolveSeasons?.([
        { id: 'season-latest', name: '2027 男子足球联赛', status: 'archived' },
        { id: 'season-active', name: '2026 男子足球联赛', status: 'active' },
      ]);
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(api.fetchMatches).toHaveBeenCalledTimes(1));
    expect(api.fetchMatches).toHaveBeenCalledWith(1, 5, undefined, 'season-latest', 'all');

    act(() => result.current.setSortBy('date-asc'));
    expect(api.fetchMatches).toHaveBeenCalledTimes(1);
  });
});
