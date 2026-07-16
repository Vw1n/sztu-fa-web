import type { Team, Player, Match, PaginatedResponse, TeamWithPlayers, News } from '../types';

const BASE_URL = '/api';

export async function fetchTeams(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Team>> {
  const response = await fetch(`${BASE_URL}/teams?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('获取球队列表失败');
  }
  return response.json();
}

export async function fetchTeamById(id: string): Promise<TeamWithPlayers> {
  const response = await fetch(`${BASE_URL}/teams/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('球队不存在');
    }
    throw new Error('获取球队详情失败');
  }
  return response.json();
}

export async function searchTeams(name: string): Promise<Team[]> {
  const response = await fetch(`${BASE_URL}/teams/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('搜索球队失败');
  }
  return response.json();
}

function normalizeMatchStatus(match: Match): Match {
  if (!match) return match;
  let status = match.status;
  if (status as string === 'finished') {
    status = 'completed';
  } else if (status as string === 'ongoing') {
    status = 'in_progress';
  }
  return { ...match, status };
}

export async function fetchMatches(
  page: number = 1,
  limit: number = 10,
  teamId?: string,
  seasonId?: string,
  status?: string
): Promise<PaginatedResponse<Match>> {
  let url = `${BASE_URL}/matches?page=${page}&limit=${limit}`;
  if (teamId) {
    url += `&teamId=${teamId}`;
  }
  if (seasonId) {
    url += `&seasonId=${seasonId}`;
  }
  if (status && status !== 'all') {
    let backendStatus = status;
    if (status === 'completed') {
      backendStatus = 'finished';
    } else if (status === 'in_progress') {
      backendStatus = 'ongoing';
    }
    url += `&status=${backendStatus}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取比赛列表失败');
  }
  const result = await response.json();
  if (result && Array.isArray(result.data)) {
    result.data = result.data.map(normalizeMatchStatus);
  }
  return result;
}

export async function fetchSeasons(): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/seasons`);
  if (!response.ok) {
    throw new Error('获取赛季列表失败');
  }
  return response.json();
}

export async function fetchPlayerCareer(id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/players/${id}/career`);
  if (!response.ok) {
    throw new Error('获取球员生涯数据失败');
  }
  return response.json();
}

export async function fetchMatchById(id: string): Promise<Match> {
  const response = await fetch(`${BASE_URL}/matches/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('比赛不存在');
    }
    throw new Error('获取比赛详情失败');
  }
  const result = await response.json();
  return normalizeMatchStatus(result);
}

export async function fetchPlayers(
  page: number = 1,
  limit: number = 10,
  teamId?: string
): Promise<PaginatedResponse<Player>> {
  let url = `${BASE_URL}/players?page=${page}&limit=${limit}`;
  if (teamId) {
    url += `&teamId=${teamId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取球员列表失败');
  }
  return response.json();
}

export async function searchPlayers(name: string): Promise<Player[]> {
  const response = await fetch(`${BASE_URL}/players/search?name=${encodeURIComponent(name)}`);
  if (!response.ok) {
    throw new Error('搜索球员失败');
  }
  return response.json();
}

export async function fetchPlayerById(id: string): Promise<Player> {
  const response = await fetch(`${BASE_URL}/players/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('球员不存在');
    }
    throw new Error('获取球员详情失败');
  }
  return response.json();
}

export async function fetchTeamPlayersBySeason(teamId: string, seasonId?: string): Promise<Player[]> {
  let url = `${BASE_URL}/teams/${teamId}/players`;
  if (seasonId) {
    url += `?seasonId=${seasonId}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取赛季球员名册失败');
  }
  return response.json();
}

export async function fetchSeasonStandings(seasonId: string): Promise<any[]> {
  const response = await fetch(`${BASE_URL}/seasons/${seasonId}/standings`);
  if (!response.ok) {
    throw new Error('获取赛季积分榜失败');
  }
  return response.json();
}

export async function fetchSeasonStats(seasonId: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/seasons/${seasonId}/stats`);
  if (!response.ok) {
    throw new Error('获取赛季榜单数据失败');
  }
  return response.json();
}

export async function fetchNews(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<PaginatedResponse<News>> {
  let url = `${BASE_URL}/news?page=${page}&limit=${limit}`;
  if (category && category !== 'all') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取活动资讯失败');
  }
  return response.json();
}