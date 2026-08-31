import React, { useState, useEffect } from 'react';
import { LoadingSpinner, ErrorMessage } from '../../common';

const PAGE_SIZE = 10;

export interface ScorerRow {
  playerId?: string;
  playerName: string;
  jerseyNumber: string;
  teamName: string;
  teamLogo: string;
  goals: number;
  penaltyGoals?: number;
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
  statsError?: string | null;
  onRetry?: () => void;
  onPlayerClick: (playerId: string, playerName: string) => void;
}

export const ScorerBoard: React.FC<ScorerBoardProps> = ({
  activeTab,
  scorers,
  assists,
  statsLoading,
  statsError,
  onRetry,
  onPlayerClick,
}) => {
  const [scorersPage, setScorersPage] = useState(1);
  const [assistsPage, setAssistsPage] = useState(1);

  // Reset to page 1 when tab switches or data reloads
  useEffect(() => { setScorersPage(1); }, [activeTab]);
  useEffect(() => { setAssistsPage(1); }, [activeTab]);
  useEffect(() => { setScorersPage(1); setAssistsPage(1); }, [scorers.length, assists.length]);

  const scorersTotalPages = Math.ceil(scorers.length / PAGE_SIZE);
  const assistsTotalPages = Math.ceil(assists.length / PAGE_SIZE);
  const scorersPaged = scorers.slice((scorersPage - 1) * PAGE_SIZE, scorersPage * PAGE_SIZE);
  const assistsPaged = assists.slice((assistsPage - 1) * PAGE_SIZE, assistsPage * PAGE_SIZE);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="scorerPagination">
        <button
          type="button"
          className="scorerPageBtn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </button>
        <span className="scorerPageInfo">
          第 {currentPage} / {totalPages} 页
        </span>
        <button
          type="button"
          className="scorerPageBtn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <>
      {/* 射手榜 Tab 视图 */}
      {activeTab === 'scorers' && (
        <div className="scorersSection">
          {statsLoading ? (
            <LoadingSpinner message="正在计算射手榜..." />
          ) : statsError ? (
            <ErrorMessage message={statsError} onRetry={onRetry} />
          ) : (

            <div className="scorersTableContainer">
              <table className="scorersTable">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>球员</th>
                    <th>号码</th>
                    <th>所属球队</th>
                    <th>进球数</th>
                  </tr>
                </thead>
                <tbody>
                  {scorersPaged.map((row, index) => {
                    const actualIndex = (scorersPage - 1) * PAGE_SIZE + index;
                    let rankClass = '';
                    if (actualIndex === 0) rankClass = 'rank-gold';
                    else if (actualIndex === 1) rankClass = 'rank-silver';
                    else if (actualIndex === 2) rankClass = 'rank-bronze';
                    
                    return (
                      <tr key={actualIndex}>
                        <td>
                          <span className={`rankBadge ${rankClass}`}>{actualIndex + 1}</span>
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
                        <td className="goalsCell">
                          <span className="goalsNum">{row.goals}</span>
                          {row.penaltyGoals != null && row.penaltyGoals > 0 && (
                            <span className="penaltyGoals">（{row.penaltyGoals}）</span>
                          )}
                        </td>
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
              {renderPagination(scorersPage, scorersTotalPages, setScorersPage)}
            </div>
          )}
        </div>
      )}

      {/* 助攻榜 Tab 视图 */}
      {activeTab === 'assists' && (
        <div className="scorersSection">
          {statsLoading ? (
            <LoadingSpinner message="正在计算助攻榜..." />
          ) : statsError ? (
            <ErrorMessage message={statsError} onRetry={onRetry} />
          ) : (
            <div className="scorersTableContainer">

              <table className="scorersTable">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>球员</th>
                    <th>号码</th>
                    <th>所属球队</th>
                    <th>助攻数</th>
                  </tr>
                </thead>
                <tbody>
                  {assistsPaged.map((row, index) => {
                    const actualIndex = (assistsPage - 1) * PAGE_SIZE + index;
                    let rankClass = '';
                    if (actualIndex === 0) rankClass = 'rank-gold';
                    else if (actualIndex === 1) rankClass = 'rank-silver';
                    else if (actualIndex === 2) rankClass = 'rank-bronze';
                    
                    return (
                      <tr key={actualIndex}>
                        <td>
                          <span className={`rankBadge ${rankClass}`}>{actualIndex + 1}</span>
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
              {renderPagination(assistsPage, assistsTotalPages, setAssistsPage)}
            </div>
          )}
        </div>
      )}
    </>
  );
};
