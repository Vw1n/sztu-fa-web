import type { Match, MatchEvent } from '../../../types';

export const isShootoutEvent = (event: MatchEvent): boolean =>
  event.eventType === 'penalty_shootout_goal' ||
  event.eventType === 'penalty_shootout_miss';

export const getEventSortKey = (event: MatchEvent): number => {
  if (isShootoutEvent(event)) {
    return 10000 + (event.shootoutOrder || 0);
  }
  const cleaned = String(event.eventTime || '').replace(/'/g, '');
  if (!cleaned.includes('+')) {
    const minute = parseInt(cleaned, 10);
    // 非数字时间（如 "HT"、"中场"）视为中场事件，排在 40 和 41 之间
    if (isNaN(minute)) return 40.5;
    return minute;
  }
  const [minute, stoppage] = cleaned.split('+');
  return (parseInt(minute, 10) || 0) + (parseInt(stoppage, 10) || 0) / 100;
};

export const getPenaltyScore = (
  match: Match,
): { home: number; away: number } | null => {
  if (
    match.homePenaltyScore !== null &&
    match.homePenaltyScore !== undefined &&
    match.awayPenaltyScore !== null &&
    match.awayPenaltyScore !== undefined
  ) {
    return { home: match.homePenaltyScore, away: match.awayPenaltyScore };
  }

  const shootoutEvents = (match.events || []).filter(isShootoutEvent);
  if (shootoutEvents.length === 0) return null;
  return shootoutEvents.reduce(
    (score, event) => {
      if (event.eventType === 'penalty_shootout_goal') {
        score[event.teamType] += 1;
      }
      return score;
    },
    { home: 0, away: 0 },
  );
};

export const isHistoricalSeasonTeamIdMatch = (
  id1: string | null | undefined,
  id2: string | null | undefined,
): boolean => {
  if (!id1 || !id2) return false;
  if (id1 === id2) return true;
  const match1 = id1.match(/^(.+)_season_[A-Za-z0-9]+$/);
  const match2 = id2.match(/^(.+)_season_[A-Za-z0-9]+$/);
  // 两个均带赛季后缀且完整 ID 不全等，判定为不匹配
  if (match1 && match2) return false;
  const base1 = match1 ? match1[1] : id1;
  const base2 = match2 ? match2[1] : id2;
  return base1 === base2;
};

export const getWinnerTeamId = (match: Match): string | null => {
  // 优先级 1：常规/加时比分直接决胜 (homeScore !== awayScore)
  if (
    typeof match.homeScore === 'number' &&
    typeof match.awayScore === 'number' &&
    match.homeScore !== match.awayScore
  ) {
    return match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
  }

  // 优先级 2：结构化点球比分决胜 (homePenaltyScore !== awayPenaltyScore)
  if (
    match.homePenaltyScore !== null &&
    match.homePenaltyScore !== undefined &&
    match.awayPenaltyScore !== null &&
    match.awayPenaltyScore !== undefined &&
    match.homePenaltyScore !== match.awayPenaltyScore
  ) {
    return match.homePenaltyScore > match.awayPenaltyScore
      ? match.homeTeamId
      : match.awayTeamId;
  }

  // 优先级 3：点球事件决胜
  const shootoutEvents = (match.events || []).filter(isShootoutEvent);
  if (shootoutEvents.length > 0) {
    const shootoutScore = shootoutEvents.reduce(
      (score, event) => {
        if (event.eventType === 'penalty_shootout_goal') {
          score[event.teamType] += 1;
        }
        return score;
      },
      { home: 0, away: 0 },
    );
    if (shootoutScore.home !== shootoutScore.away) {
      return shootoutScore.home > shootoutScore.away
        ? match.homeTeamId
        : match.awayTeamId;
    }
  }

  // 优先级 4：只有在 1~3 无法决胜时，才使用 winnerTeamId 映射
  if (match.winnerTeamId) {
    const matchesHome = isHistoricalSeasonTeamIdMatch(match.winnerTeamId, match.homeTeamId);
    const matchesAway = isHistoricalSeasonTeamIdMatch(match.winnerTeamId, match.awayTeamId);
    if (matchesHome && !matchesAway) return match.homeTeamId;
    if (matchesAway && !matchesHome) return match.awayTeamId;
  }

  // 5. 无法确定胜者或冲突
  return null;
};
