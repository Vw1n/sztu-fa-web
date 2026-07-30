import type { Player, PaginatedResponse, PlayerCareerResponse } from '../types';
import { BASE_URL, apiFetch } from './http';

export async function fetchPlayers(
  page: number = 1,
  limit: number = 10,
  teamId?: string
): Promise<PaginatedResponse<Player>> {
  let url = `${BASE_URL}/players?page=${page}&limit=${limit}`;
  if (teamId) url += `&teamId=${teamId}`;
  const response = await apiFetch(url);
  if (!response.ok) throw new Error('获取球员列表失败');
  return response.json();
}

export async function fetchPlayerById(id: string): Promise<Player> {
  const response = await apiFetch(`${BASE_URL}/players/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error('球员不存在');
    throw new Error('获取球员详情失败');
  }
  return response.json();
}

export async function searchPlayers(name: string): Promise<Player[]> {
  const response = await apiFetch(`${BASE_URL}/players/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) throw new Error('搜索球员失败');
  return response.json();
}

export async function fetchPlayerCareer(id: string): Promise<PlayerCareerResponse> {
  const response = await apiFetch(`${BASE_URL}/players/${id}/career`);
  if (!response.ok) throw new Error('获取球员生涯数据失败');
  return response.json();
}

