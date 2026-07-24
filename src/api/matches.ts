import type { Match, PaginatedResponse } from '../types';
import { BASE_URL, normalizeMatchStatus } from './http';

export async function fetchMatches(
  page: number = 1,
  limit: number = 10,
  teamId?: string,
  seasonId?: string,
  status?: string
): Promise<PaginatedResponse<Match>> {
  let url = `${BASE_URL}/matches?page=${page}&limit=${limit}`;
  if (teamId) url += `&teamId=${teamId}`;
  if (seasonId) url += `&seasonId=${seasonId}`;
  if (status && status !== 'all') {
    let backendStatus = status;
    if (status === 'completed') backendStatus = 'finished';
    else if (status === 'in_progress') backendStatus = 'ongoing';
    url += `&status=${backendStatus}`;
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[fetchMatches] 接口响应失败, 状态码: ${response.status}`);
      return {
        data: [],
        total: 0,
        page,
        limit,
        stats: { total: 0, completed: 0, scheduled: 0, ongoing: 0 },
      };
    }
    const result = await response.json();
    if (result && Array.isArray(result.data)) {
      result.data = result.data.map(normalizeMatchStatus);
    }
    return result;
  } catch (err) {
    console.error('[fetchMatches] 网络或接口调取失败:', err);
    return {
      data: [],
      total: 0,
      page,
      limit,
      stats: { total: 0, completed: 0, scheduled: 0, ongoing: 0 },
    };
  }
}

export async function fetchMatchById(id: string): Promise<Match> {
  const response = await fetch(`${BASE_URL}/matches/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('比赛不存在');
    throw new Error('获取比赛详情失败');
  }
  const result = await response.json();
  return normalizeMatchStatus(result);
}
