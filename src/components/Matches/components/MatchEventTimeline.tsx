import type { MatchEvent } from '../../../types';

interface MatchEventTimelineProps {
  events: MatchEvent[];
  teamType: 'home' | 'away';
  teamName: string;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

const eventIcons: Record<MatchEvent['eventType'], string> = {
  goal: '⚽',
  own_goal: '🥅',
  penalty: '🎯',
  yellow_card: '🟨',
  red_card: '🟥',
  yellow_to_red: '🟨🟥',
  substitution: '🔄',
  penalty_shootout_goal: '⚽',
  penalty_shootout_miss: '❌',
  penalty_miss: '❌',
};

const eventLabels: Partial<Record<MatchEvent['eventType'], string>> = {
  yellow_card: '黄牌',
  red_card: '红牌',
  yellow_to_red: '两黄变一红',
  goal: '进球',
  penalty_shootout_goal: '点球大战进球',
  penalty_shootout_miss: '点球大战罚失',
  penalty_miss: '点球罚失',
};

const parseEventTime = (time: string): number =>
  parseInt(time.replace(/'/g, ''), 10) || 0;

interface PlayerLinkProps {
  playerId?: string | null;
  playerName?: string | null;
  jerseyNumber?: string | null;
  showNumber?: boolean;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

const PlayerLink: React.FC<PlayerLinkProps> = ({
  playerId,
  playerName,
  jerseyNumber,
  showNumber = true,
  onPlayerClick,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (playerId) onPlayerClick(playerId, playerName || '');
  };

  return (
    <strong
      style={{
        cursor: playerId ? 'pointer' : 'default',
        textDecoration: playerId ? 'underline' : 'none',
        color: playerId ? 'var(--primary-color)' : 'inherit',
      }}
      onClick={handleClick}
    >
      {playerName}{showNumber && playerName ? ` (${jerseyNumber}号)` : ''}
    </strong>
  );
};

const Assist: React.FC<{
  event: MatchEvent;
  onPlayerClick: MatchEventTimelineProps['onPlayerClick'];
}> = ({ event, onPlayerClick }) => event.assistPlayerName ? (
  <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
    (助攻: <PlayerLink
      playerId={event.assistPlayerId}
      playerName={event.assistPlayerName}
      showNumber={false}
      onPlayerClick={onPlayerClick}
    />)
  </span>
) : null;

const EventDescription: React.FC<{
  event: MatchEvent;
  onPlayerClick: MatchEventTimelineProps['onPlayerClick'];
}> = ({ event, onPlayerClick }) => {
  if (event.eventType === 'substitution') {
    return (
      <span>
        换上 <PlayerLink playerId={event.playerId} playerName={event.playerName} jerseyNumber={event.jerseyNumber} onPlayerClick={onPlayerClick} />，
        换下 <PlayerLink playerId={event.subPlayerId} playerName={event.subPlayerName} jerseyNumber={event.subJerseyNumber} onPlayerClick={onPlayerClick} />
      </span>
    );
  }

  if (event.eventType === 'own_goal' || event.eventType === 'penalty') {
    return (
      <span>
        <PlayerLink playerId={event.playerId} playerName={event.playerName} jerseyNumber={event.jerseyNumber} onPlayerClick={onPlayerClick} />{' '}
        <span className={event.eventType === 'own_goal' ? 'ownGoalBadge' : 'penaltyBadge'}>
          {event.eventType === 'own_goal' ? '乌龙球' : '点球'}
        </span>
        {event.eventType === 'penalty' && <Assist event={event} onPlayerClick={onPlayerClick} />}
      </span>
    );
  }

  return (
    <span>
      <PlayerLink playerId={event.playerId} playerName={event.playerName} jerseyNumber={event.jerseyNumber} onPlayerClick={onPlayerClick} />{' '}
      {eventLabels[event.eventType] || event.description || '事件'}
      {event.eventType === 'goal' && <Assist event={event} onPlayerClick={onPlayerClick} />}
    </span>
  );
};

export const MatchEventTimeline: React.FC<MatchEventTimelineProps> = ({
  events,
  teamType,
  teamName,
  onPlayerClick,
}) => {
  const teamEvents = events
    .filter((event) => event.teamType === teamType)
    .sort((left, right) => parseEventTime(left.eventTime) - parseEventTime(right.eventTime));
  const isHome = teamType === 'home';

  return (
    <div className={`teamEvents ${isHome ? 'homeEvents' : 'awayEvents'}`}>
      <div className="eventLabel">
        <span className="fullTeamName">{isHome ? '👕' : '👚'} {teamName} 事件</span>
        <span className="shortTeamName">{isHome ? '👕 主队' : '👚 客队'}</span>
      </div>
      <div className="eventsTimeline">
        {teamEvents.map((event) => (
          <div key={event.id} className="timelineItem">
            <span className="eventTime">{event.eventTime}</span>
            <span className="eventIcon">{eventIcons[event.eventType] || '📢'}</span>
            <span className="eventDesc">
              <EventDescription event={event} onPlayerClick={onPlayerClick} />
            </span>
          </div>
        ))}
        {teamEvents.length === 0 && <div className="noEvents">暂无事件记录</div>}
      </div>
    </div>
  );
};
