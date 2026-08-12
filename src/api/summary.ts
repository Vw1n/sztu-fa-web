import { BASE_URL, apiFetch } from './http';

export interface PublicSummary {
  matchCount: number;
  playerCount: number;
  teamCount: number;
}

export async function fetchPublicSummary(): Promise<PublicSummary> {
  // 优先使用 summary 接口
  try {
    const response = await apiFetch(`${BASE_URL}/public/summary`);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // 接口不可用时走兜底聚合
  }

  // 兜底：从各列表接口的 total 字段聚合
  const [matchesRes, teamsRes, playersRes] = await Promise.allSettled([
    apiFetch(`${BASE_URL}/matches?page=1&limit=1`).then(r => r.ok ? r.json() : null),
    apiFetch(`${BASE_URL}/teams?page=1&limit=1`).then(r => r.ok ? r.json() : null),
    apiFetch(`${BASE_URL}/players?page=1&limit=1`).then(r => r.ok ? r.json() : null),
  ]);

  const matchData = matchesRes.status === 'fulfilled' ? matchesRes.value : null;
  const teamData = teamsRes.status === 'fulfilled' ? teamsRes.value : null;
  const playerData = playersRes.status === 'fulfilled' ? playersRes.value : null;

  // 所有兜底接口也都失败时，抛错让组件走 catch 逻辑
  if (!matchData && !teamData && !playerData) {
    throw new Error('获取公开统计摘要失败：summary 接口及兜底聚合均不可用');
  }

  return {
    matchCount: matchData?.total ?? 0,
    teamCount: teamData?.total ?? 0,
    playerCount: playerData?.total ?? 0,
  };
}
