import { BASE_URL, apiFetch } from './http';

export interface PublicSummary {
  matchCount: number;
  playerCount: number;
  teamCount: number;
}

export async function fetchPublicSummary(): Promise<PublicSummary> {
  const response = await apiFetch(`${BASE_URL}/public/summary`);
  if (!response.ok) throw new Error('获取公开统计摘要失败');
  return response.json();
}
