import React from 'react';
import type { Match } from '../../../types';
import { formatMatchDate, matchStatusColors, matchStatusLabels } from '../utils/matchPresentation';
import { getPenaltyScore } from '../utils/matchOutcome';
import { MatchEventTimeline } from './MatchEventTimeline';
import { PenaltyShootoutTimeline } from './PenaltyShootoutTimeline';

interface MatchCardProps {
  match: Match;
  onMatchClick: (match: Match) => void;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onMatchClick, onPlayerClick }) => {
  const penaltyScore = getPenaltyScore(match);

  return (
  <div className="matchCard" onClick={() => onMatchClick(match)}>
    <div className="matchHeader">
      <span className="matchStatus" style={{ backgroundColor: matchStatusColors[match.status] }}>
        {matchStatusLabels[match.status]}
      </span>
      <span className="matchDate">{formatMatchDate(match.matchDate)}</span>
    </div>
    <div className="matchContent">
      <div className="matchTeam">
        <div className="matchTeamLogo">
          <img src={match.homeTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={match.homeTeam.teamName} loading="lazy" />
        </div>
        <span className="matchTeamName">{match.homeTeam.teamName}</span>
      </div>
      <div className="matchScoreBox">
        <div className="matchScore">
          <span className="matchScoreNumber">{match.status === 'scheduled' ? '-' : match.homeScore}</span>
          <span className="matchScoreSeparator">:</span>
          <span className="matchScoreNumber">{match.status === 'scheduled' ? '-' : match.awayScore}</span>
        </div>
        {match.status !== 'scheduled' && penaltyScore && (
          <span className="matchPenaltyScore">
            点球 {penaltyScore.home}-{penaltyScore.away}
          </span>
        )}
        {match.status === 'in_progress' && <span className="liveBadge">LIVE</span>}
      </div>
      <div className="matchTeam">
        <div className="matchTeamLogo">
          <img src={match.awayTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={match.awayTeam.teamName} loading="lazy" />
        </div>
        <span className="matchTeamName">{match.awayTeam.teamName}</span>
      </div>
    </div>

    {match.status === 'completed' && match.events && match.events.length > 0 && (
      <div className="matchEventsSection">
        <div className="eventsGrid">
          <MatchEventTimeline events={match.events} teamType="home" teamName={match.homeTeam.teamName} onPlayerClick={onPlayerClick} />
          <div className="eventsGridDivider" />
          <MatchEventTimeline events={match.events} teamType="away" teamName={match.awayTeam.teamName} onPlayerClick={onPlayerClick} />
        </div>
        <PenaltyShootoutTimeline
          match={match}
          onPlayerClick={onPlayerClick}
          compact
        />
      </div>
    )}

    <div className="matchFooter">
      <div className="matchDetail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {match.location}
      </div>
      <div className="matchDetail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {new Date(match.matchDate).toLocaleDateString('zh-CN')}
      </div>
      {match.mvpPlayerName && (
        <div
          className="matchDetail"
          style={{ color: '#e65100', fontWeight: 'bold', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={(event) => {
            event.stopPropagation();
            if (match.mvpPlayerId) onPlayerClick(match.mvpPlayerId, match.mvpPlayerName || '');
          }}
        >
          🏆 MVP: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{match.mvpPlayerName}</span>
        </div>
      )}
    </div>
  </div>
  );
};
