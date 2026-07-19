import React from 'react';

export interface ScorerRow {
  playerId?: string;
  playerName: string;
  jerseyNumber: string;
  teamName: string;
  teamLogo: string;
  goals: number;
}

export interface AssistRow {
  playerId?: string;
  playerName: string;
  jerseyNumber: string;
  teamName: string;
  teamLogo: string;
  assists: number;
}

interface ScorerBoardProps {
  activeTab: 'scorers' | 'assists';
  scorers: ScorerRow[];
  assists: AssistRow[];
  statsLoading: boolean;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

export const ScorerBoard: React.FC<ScorerBoardProps> = ({
  activeTab,
  scorers,
  assists,
  statsLoading,
  onPlayerClick,
}) => {
  return (
    <>
      {/* 射手榜 Tab 视图 */}
      {activeTab === 'scorers' && (
        <div className="scorersSection">
          {statsLoading ? (
            <div className="loadingContainer">
              <div className="loadingSpinner"></div>
              <p>正在计算射手榜...</p>
            </div>
          ) : (
            <div className="scorersTableContainer">
              <table className="scorersTable">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>排名</th>
                    <th>球员</th>
                    <th>号码</th>
                    <th>所属球队</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>进球数</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((row, index) => {
                    let rankClass = '';
                    if (index === 0) rankClass = 'rank-gold';
                    else if (index === 1) rankClass = 'rank-silver';
                    else if (index === 2) rankClass = 'rank-bronze';
                    
                    return (
                      <tr key={index}>
                        <td>
                          <span className={`rankBadge ${rankClass}`}>{index + 1}</span>
                        </td>
                        <td
                          style={{ cursor: row.playerId ? 'pointer' : 'default' }}
                          onClick={() => row.playerId && onPlayerClick(row.playerId, row.playerName)}
                        >
                          <div className="scorerNameCell">
                            <span className="scorerIcon">⚽</span>
                            {row.playerId ? (
                              <strong style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{row.playerName}</strong>
                            ) : (
                              <strong>{row.playerName}</strong>
                            )}
                          </div>
                        </td>
                        <td>{row.jerseyNumber}号</td>
                        <td>
                          <div className="tableTeamCell">
                            <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                            <span className="tableTeamName">{row.teamName}</span>
                          </div>
                        </td>
                        <td className="goalsCell">{row.goals}</td>
                      </tr>
                    );
                  })}
                  {scorers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-light)' }}>
                        暂无进球数据记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 助攻榜 Tab 视图 */}
      {activeTab === 'assists' && (
        <div className="scorersSection">
          {statsLoading ? (
            <div className="loadingContainer">
              <div className="loadingSpinner"></div>
              <p>正在计算助攻榜...</p>
            </div>
          ) : (
            <div className="scorersTableContainer">
              <table className="scorersTable">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>排名</th>
                    <th>球员</th>
                    <th>号码</th>
                    <th>所属球队</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>助攻数</th>
                  </tr>
                </thead>
                <tbody>
                  {assists.map((row, index) => {
                    let rankClass = '';
                    if (index === 0) rankClass = 'rank-gold';
                    else if (index === 1) rankClass = 'rank-silver';
                    else if (index === 2) rankClass = 'rank-bronze';
                    
                    return (
                      <tr key={index}>
                        <td>
                          <span className={`rankBadge ${rankClass}`}>{index + 1}</span>
                        </td>
                        <td
                          style={{ cursor: row.playerId ? 'pointer' : 'default' }}
                          onClick={() => row.playerId && onPlayerClick(row.playerId, row.playerName)}
                        >
                          <div className="scorerNameCell">
                            <span className="scorerIcon">🎯</span>
                            {row.playerId ? (
                              <strong style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>{row.playerName}</strong>
                            ) : (
                              <strong>{row.playerName}</strong>
                            )}
                          </div>
                        </td>
                        <td>{row.jerseyNumber}号</td>
                        <td>
                          <div className="tableTeamCell">
                            <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                            <span className="tableTeamName">{row.teamName}</span>
                          </div>
                        </td>
                        <td className="goalsCell">{row.assists}</td>
                      </tr>
                    );
                  })}
                  {assists.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-light)' }}>
                        暂无助攻数据记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};
