const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const BASE_URL = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV
    ? '/api/v1'
    : typeof window !== 'undefined' && window.location.hostname.includes('dev.sztufa.xyz')
      ? 'https://api-dev.sztufa.xyz/api/v1'
      : typeof window !== 'undefined' && window.location.hostname.endsWith('sztufa.xyz')
        ? 'https://api.sztufa.xyz/api/v1'
        : '/api/v1')
).replace(/\/$/, '');

export { BASE_URL };

const inFlightPublicGets = new Map<string, Promise<Response>>();
const publicGetCache = new Map<string, { response: Response; expiresAt: number }>();
const MAX_PUBLIC_GET_CACHE_ENTRIES = 100;

export function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('sztufa_user_token');
      localStorage.removeItem('sztufa_user_profile');
    }
    const target = typeof window !== 'undefined' ? window : globalThis;
    if (
      target &&
      typeof (target as unknown as { dispatchEvent?: (e: Event) => boolean })
        .dispatchEvent === 'function'
    ) {
      (target as unknown as EventTarget).dispatchEvent(
        new Event('sztufa_unauthorized'),
      );
    }
  }
}

async function executeApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401) {
    handleUnauthorized(response);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error('API 地址配置错误：服务器返回了 HTML 内容而不是预期 JSON。请检查 VITE_API_BASE_URL 配置。');
  }
  return response;
}

function getDedupeKey(input: RequestInfo | URL, init?: RequestInit): string | null {
  const request = typeof Request !== 'undefined' && input instanceof Request ? input : null;
  const method = (init?.method || request?.method || 'GET').toUpperCase();
  if (method !== 'GET') return null;

  const headers = new Headers(init?.headers || request?.headers);
  if (headers.has('Authorization')) return null;

  return typeof input === 'string' ? input : input.toString();
}

function getPublicCacheTtlMs(key: string): number {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const path = new URL(key, origin).pathname;
  if (/\/api\/v1\/matches(?:\/|$)/.test(path)) return 15_000;
  if (/\/api\/v1\/(?:seasons|teams|players|news)(?:\/|$)/.test(path)) return 300_000;
  if (/\/api\/v1\/public\/summary\/?$/.test(path)) return 300_000;
  return 0;
}

function cachePublicResponse(key: string, response: Response, ttlMs: number): void {
  if (publicGetCache.size >= MAX_PUBLIC_GET_CACHE_ENTRIES && !publicGetCache.has(key)) {
    const oldestKey = publicGetCache.keys().next().value;
    if (oldestKey) publicGetCache.delete(oldestKey);
  }
  publicGetCache.set(key, { response: response.clone(), expiresAt: Date.now() + ttlMs });
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const dedupeKey = getDedupeKey(input, init);
  if (!dedupeKey) return executeApiFetch(input, init);

  const ttlMs = getPublicCacheTtlMs(dedupeKey);
  const cached = publicGetCache.get(dedupeKey);
  if (cached && cached.expiresAt > Date.now()) return cached.response.clone();
  if (cached) publicGetCache.delete(dedupeKey);

  let pending = inFlightPublicGets.get(dedupeKey);
  if (!pending) {
    pending = executeApiFetch(input, init).finally(() => {
      inFlightPublicGets.delete(dedupeKey);
    });
    inFlightPublicGets.set(dedupeKey, pending);
  }

  const response = await pending;
  if (ttlMs > 0 && response.ok) {
    cachePublicResponse(dedupeKey, response, ttlMs);
  }
  return response.clone();
}

/**
 * 统一后端 status → 前端 status 的映射。
 * 后端用 'finished'/'ongoing'，前端用 'completed'/'in_progress'。
 */
export function normalizeMatchStatus<T extends { status: string }>(match: T): T {
  if (!match) return match;
  let status = match.status;
  if (status === 'finished') {
    status = 'completed';
  } else if (status === 'ongoing') {
    status = 'in_progress';
  }
  return { ...match, status } as T;
}

