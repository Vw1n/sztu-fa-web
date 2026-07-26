import React from 'react';
import { LoadingSpinner } from '../../common';
import type { CupStandings, StandingRow } from '../../../types';

interface LeagueStandingsProps {
  standings: StandingRow[] | CupStandings;
  statsLoading: boolean;
}

export const LeagueStandings: React.FC<LeagueStandingsProps> = ({
  standings,
  statsLoading,
}) => {
  return (
    <div className="standingsSection">
      {statsLoading ? (
        <LoadingSpinner message="正在计算积分榜..." />
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
              {Array.isArray(standings) && standings.map((row, index) => {
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
              {(!Array.isArray(standings) || standings.length === 0) && (
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
