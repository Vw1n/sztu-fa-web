import type { Season, StandingRow, CupStandings, LeagueStandings, SeasonStats } from '../types';
export type { Season, StandingRow, CupStandings, LeagueStandings, SeasonStats };
import { BASE_URL, apiFetch } from './http';

export async function fetchSeasons(): Promise<Season[]> {
  const response = await apiFetch(`${BASE_URL}/seasons`);
  if (!response.ok) throw new Error('获取赛季列表失败');
  return response.json();
}

export async function fetchSeasonStandings(
  seasonId: string,
): Promise<StandingRow[] | CupStandings | LeagueStandings> {
  const response = await apiFetch(`${BASE_URL}/seasons/${seasonId}/standings`);
  if (!response.ok) throw new Error('获取赛季积分榜失败');
  return response.json();
}

export async function fetchSeasonStats(seasonId: string): Promise<SeasonStats> {
  const response = await apiFetch(`${BASE_URL}/seasons/${seasonId}/stats`);
  if (!response.ok) throw new Error('获取赛季榜单数据失败');
  return response.json();
}

export async function updateSeasonChampion(
  seasonId: string,
  teamId: string | null,
): Promise<Season> {
  const response = await apiFetch(`${BASE_URL}/seasons/${seasonId}/champion`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId }),
  });
  if (!response.ok) throw new Error('更新赛季冠军失败');
  return response.json();
}

