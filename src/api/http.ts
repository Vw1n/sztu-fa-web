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

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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

