import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './http';

describe('apiFetch in-flight request deduplication', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deduplicates overlapping anonymous GET requests and returns readable clones', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    globalThis.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );

    const first = apiFetch('/api/v1/seasons');
    const second = apiFetch('/api/v1/seasons');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    resolveFetch(
      new Response(JSON.stringify({ id: 'season-1' }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect((await first).json()).resolves.toEqual({ id: 'season-1' });
    await expect((await second).json()).resolves.toEqual({ id: 'season-1' });
  });

  it('does not deduplicate authenticated or mutation requests', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response('{}', { headers: { 'Content-Type': 'application/json' } }),
      ),
    );

    await Promise.all([
      apiFetch('/api/v1/auth/me', { headers: { Authorization: 'Bearer token' } }),
      apiFetch('/api/v1/auth/me', { headers: { Authorization: 'Bearer token' } }),
      apiFetch('/api/v1/predictions', { method: 'POST' }),
    ]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('briefly reuses successful public responses after the first request completes', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: 'news-cache-test' }]), {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const first = await apiFetch('/api/v1/news?case=memory-cache-test');
    const second = await apiFetch('/api/v1/news?case=memory-cache-test');

    await expect(first.json()).resolves.toEqual([{ id: 'news-cache-test' }]);
    await expect(second.json()).resolves.toEqual([{ id: 'news-cache-test' }]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
