import React from 'react';
import type { Match } from '../../../types';
import { formatMatchDate, matchStatusColors, matchStatusLabels } from '../utils/matchPresentation';
import { MatchModalEvents } from './MatchModalEvents';
import { MatchModalLineups } from './MatchModalLineups';

interface MatchDetailModalProps {
  selectedMatchForModal: Match | null;
  modalTab: 'events' | 'lineups';
  onClose: () => void;
  onTabChange: (tab: 'events' | 'lineups') => void;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '10px 20px', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600,
  color: active ? 'var(--primary-color)' : 'var(--text-light)',
  borderBottom: active ? '3px solid var(--primary-color)' : '3px solid transparent',
  cursor: 'pointer', transition: 'all 0.3s ease', marginBottom: '-2px',
});

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  selectedMatchForModal: match, modalTab, onClose, onTabChange, onPlayerClick,
}) => {
  if (!match) return null;
  return (
    <div className="matchModalOverlay" onClick={onClose}>
      <div className="matchModal" onClick={(event) => event.stopPropagation()}>
        <button className="matchModalClose" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="matchModalHeader">
          <span className="matchModalStatus" style={{ backgroundColor: matchStatusColors[match.status] }}>{matchStatusLabels[match.status]}</span>
          <span className="matchModalHeaderTitle">赛事回顾</span>
        </div>

        <div className="matchModalBody">
          <div className="matchScoreBoxLarge">
            <div className="modalTeam">
              <div className="modalTeamLogo"><img src={match.homeTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={match.homeTeam.teamName} /></div>
              <span className="modalTeamName">{match.homeTeam.teamName}</span>
            </div>
            <div className="modalScore">
              <span className="modalScoreNumber">{match.status === 'scheduled' ? '-' : match.homeScore}</span>
              <span className="modalScoreSeparator">:</span>
              <span className="modalScoreNumber">{match.status === 'scheduled' ? '-' : match.awayScore}</span>
            </div>
            <div className="modalTeam">
              <div className="modalTeamLogo"><img src={match.awayTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={match.awayTeam.teamName} /></div>
              <span className="modalTeamName">{match.awayTeam.teamName}</span>
            </div>
          </div>

          <div className="matchInfoDetails">
            <div className="infoItem"><span className="infoIcon">📍</span><div className="infoContent"><span className="infoLabel">比赛地点</span><span className="infoValue">{match.location || '学校足球场'}</span></div></div>
            <div className="infoItem"><span className="infoIcon">📅</span><div className="infoContent"><span className="infoLabel">比赛时间</span><span className="infoValue">{formatMatchDate(match.matchDate)}</span></div></div>
            {match.mvpPlayerName && (
              <div className="infoItem" style={{ cursor: match.mvpPlayerId ? 'pointer' : 'default' }} onClick={() => match.mvpPlayerId && onPlayerClick(match.mvpPlayerId, match.mvpPlayerName || '')}>
                <span className="infoIcon">🏆</span>
                <div className="infoContent"><span className="infoLabel">本场最佳 (MVP)</span><span className="infoValue" style={{ fontWeight: 'bold', color: '#e65100', textDecoration: match.mvpPlayerId ? 'underline' : 'none' }}>{match.mvpPlayerName}</span></div>
              </div>
            )}
          </div>

          <div className="modalTabContainer" style={{ display: 'flex', borderBottom: '2px solid var(--border-color, #eee)', marginBottom: '20px', gap: '15px' }}>
            <button className={`modalTabButton ${modalTab === 'events' ? 'active' : ''}`} onClick={() => onTabChange('events')} style={tabStyle(modalTab === 'events')}>📝 关键事件</button>
            <button className={`modalTabButton ${modalTab === 'lineups' ? 'active' : ''}`} onClick={() => onTabChange('lineups')} style={tabStyle(modalTab === 'lineups')}>🏃‍♂️ 双方阵容</button>
          </div>

          {modalTab === 'events' && <MatchModalEvents match={match} onPlayerClick={onPlayerClick} />}
          {modalTab === 'lineups' && <MatchModalLineups match={match} onPlayerClick={onPlayerClick} />}
        </div>
      </div>
    </div>
  );
};
