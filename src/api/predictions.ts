import { BASE_URL, apiFetch } from './http';
import { getStoredToken } from './auth';

export type PredictionChoice = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
export type PredictionStatus = 'PENDING' | 'CORRECT' | 'WRONG' | 'VOID';

export interface PredictionMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: { id: string; teamName: string; teamLogo?: string | null };
  awayTeam: { id: string; teamName: string; teamLogo?: string | null };
  homeScore: number;
  awayScore: number;
  matchDate: string;
  location: string;
  status: string;
  stage: string;
  groupName?: string | null;
  knockoutRound?: string | null;
  season?: { id: string; name: string } | null;
  deadline: string;
  isClosed: boolean;
  userPrediction?: {
    id: string;
    choice: PredictionChoice;
    status: PredictionStatus;
    awardedPoints: number;
    submittedAt: string;
  } | null;
}

export interface UserPredictionRecord {
  id: string;
  matchId: string;
  choice: PredictionChoice;
  status: PredictionStatus;
  awardedPoints: number;
  submittedAt: string;
  match: PredictionMatch;
}

export interface MyPredictionStats {
  totalPoints: number;
  seasonPoints: number;
  seasonRank: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracyRate: number;
}

export interface LeaderboardItem {
  rank: number;
  userId: string;
  username: string;
  nickname: string;
  maskedStudentId: string;
  points: number;
  correctCount: number;
  totalCount: number;
  accuracyRate: number;
}

export interface LeaderboardResponse {
  list: LeaderboardItem[];
  currentUser: LeaderboardItem | null;
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPredictionMatches(
  seasonId?: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: PredictionMatch[]; total: number; page: number; limit: number }> {
  let url = `${BASE_URL}/predictions/matches?page=${page}&limit=${limit}`;
  if (seasonId) url += `&seasonId=${seasonId}`;

  const response = await apiFetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取竞猜比赛列表失败');
  }
  return response.json();
}

export async function fetchPredictionMatchDetail(matchId: string): Promise<PredictionMatch> {
  const response = await apiFetch(`${BASE_URL}/predictions/matches/${matchId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取比赛竞猜详情失败');
  }
  return response.json();
}

export async function submitPredictionApi(
  matchId: string,
  choice: PredictionChoice,
): Promise<{ id: string; choice: PredictionChoice; status: PredictionStatus }> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('请先登录后再提交竞猜');
  }

  const response = await apiFetch(`${BASE_URL}/predictions/matches/${matchId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ choice }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || '提交竞猜失败');
  }
  return data;
}

export async function fetchMyPredictions(
  seasonId?: string,
  page: number = 1,
  limit: number = 20,
): Promise<{ data: UserPredictionRecord[]; total: number; page: number; limit: number }> {
  const token = getStoredToken();
  if (!token) {
    return { data: [], total: 0, page, limit };
  }

  let url = `${BASE_URL}/predictions/me?page=${page}&limit=${limit}`;
  if (seasonId) url += `&seasonId=${seasonId}`;

  const response = await apiFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('获取个人竞猜记录失败');
  }
  return response.json();
}

export async function fetchMyStats(seasonId?: string): Promise<MyPredictionStats> {
  const token = getStoredToken();
  if (!token) {
    return {
      totalPoints: 0,
      seasonPoints: 0,
      seasonRank: 0,
      totalPredictions: 0,
      correctPredictions: 0,
      accuracyRate: 0,
    };
  }

  let url = `${BASE_URL}/predictions/me/stats`;
  if (seasonId) url += `?seasonId=${seasonId}`;

  const response = await apiFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('获取个人竞猜统计失败');
  }
  return response.json();
}

export async function fetchLeaderboard(
  scope: 'season' | 'all' = 'season',
  seasonId?: string,
): Promise<LeaderboardResponse> {
  let url = `${BASE_URL}/predictions/leaderboard?scope=${scope}`;
  if (seasonId) url += `&seasonId=${seasonId}`;

  const response = await apiFetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('获取排行榜失败');
  }
  return response.json();
}
