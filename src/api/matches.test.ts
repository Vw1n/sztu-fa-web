import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchMatches } from './matches';

describe('matches api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends the knockout stage filter for compact bracket queries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [], total: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await fetchMatches(1, 100, undefined, 'season-1', undefined, 'KNOCKOUT');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/matches?page=1&limit=100&seasonId=season-1&stage=KNOCKOUT',
      undefined,
    );
  });
});
