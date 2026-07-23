const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

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
