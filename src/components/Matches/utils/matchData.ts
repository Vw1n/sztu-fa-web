import type { Match, PlayerCareerResponse } from '../../../types';
import type { SortOption } from '../types';

export interface CareerData {
  jerseyNumber: string;
  teamName: string;
  status: string;
  photo: string | null;
  summary: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalYellow: number;
    totalRed: number;
  };
  seasons: Array<{
    seasonName: string;
    matchesPlayed: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  }>;
}

export const sortMatches = (matches: Match[], sort?: SortOption) => {
  const sorted = [...matches];
  if (!sort) return sorted;
  return sorted.sort((first, second) => {
    const firstDate = first.matchDate ? new Date(first.matchDate).getTime() : 0;
    const secondDate = second.matchDate ? new Date(second.matchDate).getTime() : 0;
    if (sort === 'date-desc') return secondDate - firstDate;
    if (sort === 'date-asc') return firstDate - secondDate;
    const firstScore = (first.homeScore || 0) + (first.awayScore || 0);
    const secondScore = (second.homeScore || 0) + (second.awayScore || 0);
    return sort === 'score-desc' ? secondScore - firstScore : firstScore - secondScore;
  });
};

export const selectUpcomingMatches = (matches: Match[]) =>
  matches
    .filter((match) => match.status === 'scheduled')
    .sort((first, second) =>
      new Date(first.matchDate).getTime() - new Date(second.matchDate).getTime(),
    )
    .slice(0, 3);

export const buildCareerData = (apiResponse: PlayerCareerResponse): CareerData | null => {
  if (!apiResponse?.player) return null;
  const career = apiResponse.career || [];
  const summary = career.reduce(
    (result, season) => ({
      totalMatches: result.totalMatches + (season.appearances || 0),
      totalGoals: result.totalGoals + (season.goals || 0),
      totalAssists: result.totalAssists + (season.assists || 0),
      totalYellow: result.totalYellow + (season.yellowCards || 0),
      totalRed: result.totalRed + (season.redCards || 0),
    }),
    { totalMatches: 0, totalGoals: 0, totalAssists: 0, totalYellow: 0, totalRed: 0 },
  );
  return {
    jerseyNumber: apiResponse.player.jerseyNumber || '#',
    teamName: apiResponse.player.team?.teamName || '暂无队伍',
    status: apiResponse.player.status || 'active',
    photo: apiResponse.player.photo || null,
    summary,
    seasons: career.map((season) => ({
      seasonName: season.seasonName,
      matchesPlayed: season.appearances || 0,
      goals: season.goals || 0,
      assists: season.assists || 0,
      yellowCards: season.yellowCards || 0,
      redCards: season.redCards || 0,
    })),
  };
};
