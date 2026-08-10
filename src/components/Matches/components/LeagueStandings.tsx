import React, { useState } from 'react';
import { LoadingSpinner, ErrorMessage } from '../../common';
import type { CupStandings, LeagueStandings as LeagueStandingsType, StandingRow } from '../../../types';
import { useAuth } from '../../../contexts';
import { updateSeasonChampion } from '../../../api/seasons';

interface LeagueStandingsProps {
  seasonId?: string;
  standings: StandingRow[] | CupStandings | LeagueStandingsType;
  statsLoading: boolean;
  statsError?: string | null;
  onRetry?: () => void;
}

export const LeagueStandings: React.FC<LeagueStandingsProps> = ({
  seasonId,
  standings,
  statsLoading,
  statsError,
  onRetry,
}) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  const rows: StandingRow[] = Array.isArray(standings)
    ? standings
    : standings.type === 'LEAGUE'
      ? standings.rows
      : [];

  const isLeague = !Array.isArray(standings) && standings.type === 'LEAGUE';
  const leagueStandings = isLeague ? (standings as LeagueStandingsType) : null;
  const isFinished = leagueStandings?.isFinished ?? false;
  const champion = leagueStandings?.champion ?? null;
  const championSource = leagueStandings?.championSource ?? null;
  const championResolved = leagueStandings?.championResolved ?? true;

  const handleUpdateChampion = async (teamId: string | null) => {
    if (!seasonId) return;
    if (!isFinished && teamId !== null) {
      const confirmWarning = window.confirm('⚠️ 当前赛季未完赛，确定要提前指定冠军吗？');
      if (!confirmWarning) return;
    }

    setIsUpdating(true);
    try {
      await updateSeasonChampion(seasonId, teamId);
      setShowModal(false);
      onRetry?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="standingsSection">
      {statsLoading ? (
        <LoadingSpinner message="正在计算积分榜..." />
      ) : statsError ? (
        <ErrorMessage message={statsError} onRetry={onRetry} />
      ) : !Array.isArray(standings) && standings.type === 'CUP' && standings.groups ? (
        <div className="cupGroupsContainer">
          {Object.keys(standings.groups).sort().map(groupName => {
            const groupRows = standings.groups[groupName];
            return (
              <div key={groupName} className="cupGroupCard">
                <div className="cupGroupHeader">{groupName} 组</div>
                <div className="standingsTableContainer">
                  <table className="standingsTable miniTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>球队</th>
                        <th>场</th>
                        <th>胜/平/负</th>
                        <th>进/失</th>
                        <th>净胜</th>
                        <th>积分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupRows.map((row, index: number) => {
                        let rankClass = '';
                        if (index === 0) rankClass = 'rank-gold';
                        else if (index === 1) rankClass = 'rank-silver';
                        else if (index === 2) rankClass = 'rank-bronze';
                        return (
                          <tr key={row.teamId} className={index < 2 ? 'advancingRow promotionRow' : ''}>
                            <td><span className={`rankBadge ${rankClass}`}>{index + 1}</span></td>
                            <td>
                              <div className="tableTeamCell">
                                <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                                <span className="tableTeamName">{row.teamName}</span>
                              </div>
                            </td>
                            <td>{row.played}</td>
                            <td>{row.won}/{row.drawn}/{row.lost}</td>
                            <td>{row.goalsFor}/{row.goalsAgainst}</td>
                            <td className={row.goalDifference > 0 ? 'text-positive' : row.goalDifference < 0 ? 'text-negative' : ''}>
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </td>
                            <td className="pointsCell" style={{ fontWeight: 'bold' }}>{row.points}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="standingsTableContainer">
          {isFinished && !championResolved && (
            <div className="warningAlert" style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '6px', color: '#d46b08' }}>
              ⚠️ 本赛季已完赛，但前列球队成绩完全并列，请超级管理员手动指定冠军。
            </div>
          )}

          {champion && (
            <div className="championCard leagueChampionCard" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <div className="championCrown">🏆</div>
              <div className="championTitle">
                联赛冠军 {championSource === 'MANUAL' && <span style={{ fontSize: '0.8rem', color: '#fa8c16' }}>(手动指定)</span>}
              </div>
              {champion.teamLogo && (
                <img src={champion.teamLogo} alt={champion.teamName} className="championLogo" />
              )}
              <div className="championName">{champion.teamName}</div>
            </div>
          )}

          {isSuperAdmin && seasonId && (
            <div className="adminChampionActions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowModal(true)}
                disabled={isUpdating}
              >
                ⚙️ 管理冠军
              </button>
              {championSource === 'MANUAL' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleUpdateChampion(null)}
                  disabled={isUpdating}
                >
                  撤销手动冠军
                </button>
              )}
            </div>
          )}

          {showModal && (
            <div className="modalOverlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="modalContent" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', width: '320px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <h4 style={{ marginTop: 0 }}>手动指定赛季冠军</h4>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>请从该赛季参战球队中选择冠军：</p>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                >
                  <option value="">-- 请选择球队 --</option>
                  {rows.map((r) => (
                    <option key={r.teamId} value={r.teamId}>
                      {r.teamName} (积分: {r.points})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedTeamId || isUpdating}
                    onClick={() => handleUpdateChampion(selectedTeamId)}
                  >
                    确认保存
                  </button>
                </div>
              </div>
            </div>
          )}

          <table className="standingsTable">
            <thead>
              <tr>
                <th>#</th>
                <th>球队</th>
                <th>场</th>
                <th>胜/平/负</th>
                <th>进/失</th>
                <th>净胜</th>
                <th>积分</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                let rankClass = '';
                if (index === 0) rankClass = 'rank-gold';
                else if (index === 1) rankClass = 'rank-silver';
                else if (index === 2) rankClass = 'rank-bronze';
                return (
                  <tr key={row.teamId} className={index < 2 ? 'promotionRow' : ''}>
                    <td><span className={`rankBadge ${rankClass}`}>{index + 1}</span></td>
                    <td>
                      <div className="tableTeamCell">
                        <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                        <span className="tableTeamName">{row.teamName}</span>
                      </div>
                    </td>
                    <td>{row.played}</td>
                    <td>{row.won}/{row.drawn}/{row.lost}</td>
                    <td>{row.goalsFor}/{row.goalsAgainst}</td>
                    <td className={row.goalDifference > 0 ? 'text-positive' : row.goalDifference < 0 ? 'text-negative' : ''}>
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </td>
                    <td className="pointsCell">{row.points}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-light)' }}>
                    暂无球队数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
