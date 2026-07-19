import React from 'react';
import type { Match, MatchLineup } from '../../../types';

interface MatchModalLineupsProps {
  match: Match;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

const LineupGroup: React.FC<{
  title: string;
  emptyText: string;
  color: string;
  entries: MatchLineup[];
  onPlayerClick: (playerId: string, playerName: string) => void;
}> = ({ title, emptyText, color, entries, onPlayerClick }) => (
  <div className="lineupSubSection" style={title === '替补席' ? { marginTop: '20px' } : undefined}>
    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '10px', borderLeft: `3px solid ${color}`, paddingLeft: '8px' }}>{title}</h4>
    <div className="lineupPlayersList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {entries.length === 0 ? (
        <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>{emptyText}</span>
      ) : entries.map((entry) => (
        <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', fontSize: '0.95rem' }}>
          <span style={{ fontWeight: 800, color, minWidth: '24px' }}>#{entry.player?.jerseyNumber ?? ''}</span>
          <strong style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-color)' }} onClick={() => onPlayerClick(entry.playerId, entry.player?.name || '')}>
            {entry.player?.name || '未知球员'}
          </strong>
        </div>
      ))}
    </div>
  </div>
);

export const MatchModalLineups: React.FC<MatchModalLineupsProps> = ({ match, onPlayerClick }) => {
  const lineups = match.lineups || [];
  return (
    <div className="modalLineupsContainer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '10px 0' }}>
      {(['home', 'away'] as const).map((teamType) => {
        const team = teamType === 'home' ? match.homeTeam : match.awayTeam;
        return (
          <div className="modalLineupColumn" key={teamType}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '2px solid var(--border-color)', paddingBottom: '6px' }}>
              {team.teamName} ({teamType === 'home' ? '主' : '客'})
            </h3>
            <LineupGroup title="首发球员" emptyText="未公布首发" color="#4caf50" entries={lineups.filter((entry) => entry.teamType === teamType && entry.lineupType === 'starting')} onPlayerClick={onPlayerClick} />
            <LineupGroup title="替补席" emptyText="未公布替补" color="#2196f3" entries={lineups.filter((entry) => entry.teamType === teamType && entry.lineupType === 'substitute')} onPlayerClick={onPlayerClick} />
          </div>
        );
      })}
    </div>
  );
};
