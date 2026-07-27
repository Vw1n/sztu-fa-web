import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch } from './http';

describe('http.ts 401 Interception', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {
      sztufa_user_token: 'test-token',
      sztufa_user_profile: JSON.stringify({ id: '1' }),
    };

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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should clear stored token and dispatch sztufa_unauthorized event on 401 response', async () => {
    const eventListener = vi.fn();
    const eventTarget = new EventTarget();

    vi.stubGlobal('dispatchEvent', (evt: Event) => eventTarget.dispatchEvent(evt));
    eventTarget.addEventListener('sztufa_unauthorized', eventListener);

    const mockResponse = new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const res = await apiFetch('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(store['sztufa_user_token']).toBeUndefined();
    expect(eventListener).toHaveBeenCalledTimes(1);
  });

  it('should not clear token when status is 200 OK', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    await apiFetch('/api/v1/predictions/matches');

    expect(store['sztufa_user_token']).toBe('test-token');
  });
});
