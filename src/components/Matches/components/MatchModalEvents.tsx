import React from 'react';
import type { Match, MatchEvent } from '../../../types';

interface MatchModalEventsProps {
  match: Match;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

const eventIcons: Record<string, string> = {
  goal: '⚽', own_goal: '🥅', penalty: '🎯', yellow_card: '🟨', red_card: '🟥',
  yellow_to_red: '🟨🟥', substitution: '🔄', penalty_shootout_goal: '⚽',
  penalty_shootout_miss: '❌', penalty_miss: '❌',
};

const parseEventTime = (time: string) => {
  const cleaned = String(time || '').replace(/'/g, '');
  if (!cleaned.includes('+')) return parseInt(cleaned, 10) || 0;
  const parts = cleaned.split('+');
  return (parseInt(parts[0], 10) || 0) + (parseInt(parts[1], 10) || 0) / 100;
};

const PlayerLink: React.FC<{
  id?: string | null;
  name?: string | null;
  children: React.ReactNode;
  onPlayerClick: (playerId: string, playerName: string) => void;
}> = ({ id, name, children, onPlayerClick }) => (
  <strong
    style={{ cursor: id ? 'pointer' : 'default', textDecoration: id ? 'underline' : 'none', color: id ? 'var(--primary-color)' : 'inherit' }}
    onClick={() => id && onPlayerClick(id, name || '')}
  >
    {children}
  </strong>
);

const EventDescription: React.FC<{
  event: MatchEvent;
  onPlayerClick: (playerId: string, playerName: string) => void;
}> = ({ event, onPlayerClick }) => {
  const player = <PlayerLink id={event.playerId} name={event.playerName} onPlayerClick={onPlayerClick}>{event.playerName} ({event.jerseyNumber}号)</PlayerLink>;
  const assist = event.assistPlayerName && (
    <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
      (助攻: <PlayerLink id={event.assistPlayerId} name={event.assistPlayerName} onPlayerClick={onPlayerClick}>{event.assistPlayerName}</PlayerLink>)
    </span>
  );
  if (event.eventType === 'substitution') {
    return <span>换上 {player}，换下 <PlayerLink id={event.subPlayerId} name={event.subPlayerName} onPlayerClick={onPlayerClick}>{event.subPlayerName} ({event.subJerseyNumber}号)</PlayerLink></span>;
  }
  if (event.eventType === 'own_goal') return <span>{player} <span className="ownGoalBadge">乌龙球</span></span>;
  if (event.eventType === 'penalty') return <span>{player} <span className="penaltyBadge">点球</span>{assist}</span>;
  const labels: Record<string, string> = {
    yellow_card: '黄牌', red_card: '红牌', yellow_to_red: '两黄变一红', goal: '进球',
    penalty_shootout_goal: '点球大战进球', penalty_shootout_miss: '点球大战罚失', penalty_miss: '点球罚失',
  };
  return <span>{event.playerName ? player : null}{' '}{labels[event.eventType] || event.description || '事件'}{event.eventType === 'goal' && assist}</span>;
};

export const MatchModalEvents: React.FC<MatchModalEventsProps> = ({ match, onPlayerClick }) => {
  if (!match.events?.length) return <div className="noEventsMessage">⚽ 暂无比赛事件记录</div>;
  return (
    <div className="matchEventsSection modalEvents" style={{ marginTop: 0 }}>
      <h3 className="eventsTitle">📝 比赛关键事件回顾</h3>
      <div className="unifiedTimeline">
        {[...match.events]
          .sort((first, second) => parseEventTime(first.eventTime) - parseEventTime(second.eventTime))
          .map((event, index) => {
            const isHome = event.teamType === 'home';
            const team = isHome ? match.homeTeam : match.awayTeam;
            return (
              <div key={index} className={`timelineRow ${isHome ? 'rowHome' : 'rowAway'}`}>
                <div className="timelineDotContainer">
                  <span className="eventTime">{event.eventTime}</span>
                  <span className={`eventIconContainer eventIcon-${event.eventType}`}>{eventIcons[event.eventType] || '📢'}</span>
                </div>
                <div className="timelineEventCard">
                  <div className="eventCardHeader">
                    <img className="miniTeamLogo" src={team.teamLogo || 'https://picsum.photos/seed/logo/20/20'} alt={team.teamName} />
                    <span className="miniTeamName">{team.teamName}</span>
                  </div>
                  <span className="eventDesc"><EventDescription event={event} onPlayerClick={onPlayerClick} /></span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
