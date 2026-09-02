import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMatchById } from '../../../api';
import type { Match } from '../../../types';
import { useMatchDetails } from './useMatchDetails';

vi.mock('../../../api', () => ({ fetchMatchById: vi.fn() }));

const summary = {
  id: 'match-1',
  homeTeam: { id: 'home', teamName: '主队' },
  awayTeam: { id: 'away', teamName: '客队' },
} as Match;

describe('useMatchDetails', () => {
  beforeEach(() => vi.resetAllMocks());

  it('opens with the summary and replaces it with on-demand details', async () => {
    const details = { ...summary, events: [{ id: 'event-1' }] } as Match;
    vi.mocked(fetchMatchById).mockResolvedValue(details);
    const { result } = renderHook(() => useMatchDetails());

    act(() => result.current.openDetails(summary));
    expect(result.current.selectedMatch).toBe(summary);
    expect(result.current.detailsLoading).toBe(true);

    await waitFor(() => expect(result.current.selectedMatch).toBe(details));
    expect(result.current.detailsLoading).toBe(false);
  });

  it('keeps the modal summary visible when detail loading fails', async () => {
    vi.mocked(fetchMatchById).mockRejectedValue(new Error('详情暂不可用'));
    const { result } = renderHook(() => useMatchDetails());

    act(() => result.current.openDetails(summary));

    await waitFor(() => expect(result.current.detailsError).toBe('详情暂不可用'));
    expect(result.current.selectedMatch).toBe(summary);
  });

  it('reuses recently loaded details when the same match is reopened', async () => {
    const details = { ...summary, events: [] } as Match;
    vi.mocked(fetchMatchById).mockResolvedValue(details);
    const { result } = renderHook(() => useMatchDetails());

    act(() => result.current.openDetails(summary));
    await waitFor(() => expect(result.current.selectedMatch).toBe(details));
    act(() => result.current.closeDetails());
    act(() => result.current.openDetails(summary));

    expect(result.current.selectedMatch).toBe(details);
    expect(fetchMatchById).toHaveBeenCalledTimes(1);
  });
});
