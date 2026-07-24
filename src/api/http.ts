const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const BASE_URL = (
  configuredApiBaseUrl ||
  (typeof window !== 'undefined' && window.location.hostname.includes('dev.sztufa.xyz')
    ? 'https://api-dev.sztufa.xyz/api/v1'
    : typeof window !== 'undefined' && window.location.hostname.endsWith('sztufa.xyz')
      ? 'https://api.sztufa.xyz/api/v1'
      : '/api/v1')
).replace(/\/$/, '');

export { BASE_URL };

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
