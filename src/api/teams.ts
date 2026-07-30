import type { Team, Player, PaginatedResponse, TeamWithPlayers } from '../types';
import { BASE_URL, apiFetch } from './http';

export async function fetchTeams(
  page: number = 1,
  limit: number = 10,
  seasonId?: string,
  gender?: string
): Promise<PaginatedResponse<Team>> {
  let url = `${BASE_URL}/teams?page=${page}&limit=${limit}`;
  if (seasonId) url += `&seasonId=${seasonId}`;
  if (gender) url += `&gender=${gender}`;
  const response = await apiFetch(url);
  if (!response.ok) throw new Error('获取球队列表失败');
  return response.json();
}

export async function fetchTeamById(id: string): Promise<TeamWithPlayers> {
  const response = await apiFetch(`${BASE_URL}/teams/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('球队不存在');
    throw new Error('获取球队详情失败');
  }
  return response.json();
}

export async function searchTeams(name: string): Promise<Team[]> {
  const response = await apiFetch(`${BASE_URL}/teams/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('搜索球队失败');
  return response.json();
}

export async function fetchTeamPlayersBySeason(teamId: string, seasonId?: string): Promise<Player[]> {
  let url = `${BASE_URL}/teams/${teamId}/players`;
  if (seasonId) url += `?seasonId=${seasonId}`;
  const response = await apiFetch(url);
  if (!response.ok) throw new Error('获取赛季球员名册失败');
  return response.json();
}

