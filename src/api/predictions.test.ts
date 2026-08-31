import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPredictionMatches,
  submitPredictionApi,
  fetchLeaderboard,
} from './predictions';

describe('predictions.ts API utilities', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
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

  it('fetchPredictionMatches calls endpoint and parses response data', async () => {
    const mockData = {
      data: [{ id: 'm1', isClosed: false }],
      total: 1,
      page: 1,
      limit: 20,
    };
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockData), { status: 200 }),
    );

    const result = await fetchPredictionMatches('season-1');
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe('m1');
  });

  it('submitPredictionApi throws error when not logged in', async () => {
    await expect(submitPredictionApi('m1', 'HOME_WIN')).rejects.toThrow(
      '请先登录后再提交助威',
    );
  });

  it('fetchLeaderboard parses ranking list and currentUser', async () => {
    const mockResponse = {
      list: [
        {
          rank: 1,
          userId: 'u1',
          username: 'user1',
          nickname: 'User 1',
          maskedStudentId: '2023****01',
          points: 6,
          correctCount: 2,
          totalCount: 2,
          accuracyRate: 100,
        },
      ],
      currentUser: null,
    };

    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockResponse), { status: 200 }),
    );

    const res = await fetchLeaderboard('all');
    expect(res.list.length).toBe(1);
    expect(res.list[0].rank).toBe(1);
  });
});
