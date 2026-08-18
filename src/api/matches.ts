import type { Match, PaginatedResponse } from '../types';
import { BASE_URL, apiFetch, normalizeMatchStatus } from './http';

export async function fetchMatches(
  page: number = 1,
  limit: number = 10,
  teamId?: string,
  seasonId?: string,
  status?: string,
  stage?: string,
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
  if (stage) url += `&stage=${encodeURIComponent(stage)}`;

  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error('获取比赛列表失败');
  }
  const result = await response.json();
  if (result && Array.isArray(result.data)) {
    result.data = result.data.map(normalizeMatchStatus);
  }
  return result;
}

export async function fetchMatchById(id: string): Promise<Match> {
  const response = await apiFetch(`${BASE_URL}/matches/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('比赛不存在');
    throw new Error('获取比赛详情失败');
  }
  const result = await response.json();
  return normalizeMatchStatus(result);
}

