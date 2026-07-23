import React from 'react';
import type { Match, MatchEvent } from '../../../types';
import { getPenaltyScore, isShootoutEvent } from '../utils/matchOutcome';

interface PenaltyShootoutTimelineProps {
  match: Match;
  onPlayerClick: (playerId: string, playerName: string) => void;
  compact?: boolean;
}

const KickIcon: React.FC<{ scored: boolean }> = ({ scored }) => (
  <span
    className={`shootoutKickIcon ${scored ? 'kickScored' : 'kickMissed'}`}
    aria-label={scored ? '点球罚中' : '点球罚失'}
  >
    ⚽
    {!scored && <span className="shootoutMissMark">×</span>}
  </span>
);

export const PenaltyShootoutTimeline: React.FC<PenaltyShootoutTimelineProps> = ({
  match,
  onPlayerClick,
  compact = false,
}) => {
  const events = (match.events || [])
    .filter(isShootoutEvent)
    .sort(
      (left, right) =>
        (left.shootoutOrder || 0) - (right.shootoutOrder || 0),
    );
  if (events.length === 0) return null;

  const score = { home: 0, away: 0 };
  const rows = events.map((event) => {
    if (event.eventType === 'penalty_shootout_goal') {
      score[event.teamType] += 1;
    }
    return { event, homeScore: score.home, awayScore: score.away };
  });
  const finalScore = getPenaltyScore(match);

  const player = (event: MatchEvent) => (
    <button
      type="button"
      className="shootoutPlayer"
      disabled={!event.playerId}
      onClick={() =>
        event.playerId &&
        onPlayerClick(event.playerId, event.playerName || '')
      }
    >
      {event.playerName || '未知球员'}
    </button>
  );

  return (
    <section className={`shootoutSection ${compact ? 'shootoutCompact' : ''}`}>
      <div className="shootoutHeader">
        <span>点球大战</span>
        {finalScore && (
          <strong>
            {finalScore.home}-{finalScore.away}
          </strong>
        )}
      </div>
      <div className="shootoutTimeline">
        {rows.map(({ event, homeScore, awayScore }, index) => {
          const isHome = event.teamType === 'home';
          const scored = event.eventType === 'penalty_shootout_goal';
          return (
            <div
              key={event.id || `${event.shootoutOrder}-${index}`}
              className={`shootoutRow ${isHome ? 'shootoutHome' : 'shootoutAway'}`}
            >
              <div className="shootoutKickCard">
                {isHome ? (
                  <>
                    <span className="shootoutRunningScore">
                      ({homeScore}-{awayScore})
                    </span>
                    {player(event)}
                    <KickIcon scored={scored} />
                  </>
                ) : (
                  <>
                    <KickIcon scored={scored} />
                    {player(event)}
                    <span className="shootoutRunningScore">
                      ({homeScore}-{awayScore})
                    </span>
                  </>
                )}
              </div>
              <span className="shootoutCenterBadge">点</span>
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="eventLegend" aria-label="比赛事件图例">
          <span>⚽ 进球</span>
          <span>🎯 点球</span>
          <span><KickIcon scored={false} /> 点球未进</span>
          <span>🥅 乌龙球</span>
          <span>👟 助攻</span>
        </div>
      )}
    </section>
  );
};
