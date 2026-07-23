import type { Match, MatchEvent } from '../../../types';

export const isShootoutEvent = (event: MatchEvent): boolean =>
  event.eventType === 'penalty_shootout_goal' ||
  event.eventType === 'penalty_shootout_miss';

export const getEventSortKey = (event: MatchEvent): number => {
  if (isShootoutEvent(event)) {
    return 10000 + (event.shootoutOrder || 0);
  }
  const cleaned = String(event.eventTime || '').replace(/'/g, '');
  if (!cleaned.includes('+')) return parseInt(cleaned, 10) || 0;
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

export const getWinnerTeamId = (match: Match): string | null => {
  if (match.winnerTeamId) return match.winnerTeamId;
  if (match.homeScore > match.awayScore) return match.homeTeamId;
  if (match.awayScore > match.homeScore) return match.awayTeamId;
  const penalties = getPenaltyScore(match);
  if (!penalties || penalties.home === penalties.away) return null;
  return penalties.home > penalties.away
    ? match.homeTeamId
    : match.awayTeamId;
};
