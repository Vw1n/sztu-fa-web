import { useState, useEffect } from 'react';
import './Matches.css';
import type { Match, Team } from '../../types';
import { fetchMatches, fetchTeams } from '../../api';

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';
type StatusFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';

const statusMap: Record<string, string> = {
  scheduled: '即将开始',
  in_progress: '进行中',
  completed: '已结束',
};

const statusColors: Record<string, string> = {
  scheduled: 'var(--primary-light)',
  in_progress: 'var(--primary-color)',
  completed: 'var(--text-light)',
};

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);

  // 积分与数据统计逻辑
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers'>('matches');
  const [allMatchesForStats, setAllMatchesForStats] = useState<Match[]>([]);
  const [allTeamsForStats, setAllTeamsForStats] = useState<Team[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const loadStatsData = async () => {
      setStatsLoading(true);
      try {
        const [matchesRes, teamsRes] = await Promise.all([
          fetchMatches(1, 1000),
          fetchTeams(1, 1000)
        ]);
        setAllMatchesForStats(matchesRes.data);
        setAllTeamsForStats(teamsRes.data);
      } catch (err) {
        console.error('加载统计数据失败:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStatsData();
  }, []);

  interface StandingRow {
    teamId: string;
    teamName: string;
    teamLogo: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }

  interface ScorerRow {
    playerName: string;
    jerseyNumber: string;
    teamName: string;
    teamLogo: string;
    goals: number;
  }

  const getStandings = (): StandingRow[] => {
    const standingsMap: Record<string, StandingRow> = {};
    allTeamsForStats.forEach(team => {
      standingsMap[team.id] = {
        teamId: team.id,
        teamName: team.teamName,
        teamLogo: team.teamLogo || '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    allMatchesForStats.forEach(match => {
      if (match.status === 'completed') {
        const homeStanding = standingsMap[match.homeTeamId];
        const awayStanding = standingsMap[match.awayTeamId];

        if (homeStanding && awayStanding) {
          homeStanding.played += 1;
          awayStanding.played += 1;
          
          homeStanding.goalsFor += match.homeScore;
          homeStanding.goalsAgainst += match.awayScore;
          awayStanding.goalsFor += match.awayScore;
          awayStanding.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeStanding.won += 1;
            homeStanding.points += 3;
            awayStanding.lost += 1;
          } else if (match.homeScore < match.awayScore) {
            awayStanding.won += 1;
            awayStanding.points += 3;
            homeStanding.lost += 1;
          } else {
            homeStanding.drawn += 1;
            homeStanding.points += 1;
            awayStanding.drawn += 1;
            awayStanding.points += 1;
          }
        }
      }
    });

    return Object.values(standingsMap).map(row => {
      row.goalDifference = row.goalsFor - row.goalsAgainst;
      return row;
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const getScorers = (): ScorerRow[] => {
    const scorersMap: Record<string, ScorerRow> = {};
    allMatchesForStats.forEach(match => {
      if (match.events && match.events.length > 0) {
        match.events.forEach(event => {
          if (event.eventType === 'goal' || event.eventType === 'penalty') {
            const isHome = event.teamType === 'home';
            const team = isHome ? match.homeTeam : match.awayTeam;
            if (team) {
              const key = `${event.playerName || '未知球员'}_${team.id}`;
              if (!scorersMap[key]) {
                scorersMap[key] = {
                  playerName: event.playerName || '未知球员',
                  jerseyNumber: event.jerseyNumber || '-',
                  teamName: team.teamName,
                  teamLogo: team.teamLogo || '',
                  goals: 0
                };
              }
              scorersMap[key].goals += 1;
            }
          }
        });
      }
    });

    return Object.values(scorersMap)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  };

  const loadMatches = async (page: number, status?: string, teamId?: string, sort?: SortOption) => {
    setLoading(true);
    setError(null);
    try {
      let filteredTeamId = teamId && teamId !== 'all' ? teamId : undefined;
      const response = await fetchMatches(page, limit, filteredTeamId);
      
      let sortedMatches = [...response.data];
      
      if (sort) {
        sortedMatches.sort((a, b) => {
          const dateA = new Date(a.matchDate).getTime();
          const dateB = new Date(b.matchDate).getTime();
          
          switch (sort) {
            case 'date-desc':
              return dateB - dateA;
            case 'date-asc':
              return dateA - dateB;
            case 'score-desc':
              const totalScoreA = (a.homeScore || 0) + (a.awayScore || 0);
              const totalScoreB = (b.homeScore || 0) + (b.awayScore || 0);
              return totalScoreB - totalScoreA;
            case 'score-asc':
              const scoreA = (a.homeScore || 0) + (a.awayScore || 0);
              const scoreB = (b.homeScore || 0) + (b.awayScore || 0);
              return scoreA - scoreB;
            default:
              return 0;
          }
        });
      }
      
      if (status && status !== 'all') {
        sortedMatches = sortedMatches.filter(match => match.status === status);
      }
      
      setMatches(sortedMatches);
      setTotal(response.total);
      
      const teams = [...new Set(
        response.data.flatMap(m => [m.homeTeam, m.awayTeam])
      )];
      setAvailableTeams(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载比赛数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches(1, statusFilter, teamFilter, sortBy);
  }, [statusFilter, teamFilter, sortBy]);

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
      loadMatches(page, statusFilter, teamFilter, sortBy);
    }
  };

  const handleRefresh = () => {
    loadMatches(currentPage, statusFilter, teamFilter, sortBy);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / limit);

  const upcomingMatches = matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
    .slice(0, 3);

  return (
    <section className="matches" id="matches">
      <div className="matchesContainer">
        <div className="sectionHeader">
          <span className="sectionTag">赛事公告</span>
          <h2 className="sectionTitle">
            赛事<span>安排</span>
          </h2>
          <p className="sectionDescription">
            了解最新赛事安排，见证精彩对决
          </p>
        </div>

        {/* 导航标签卡 */}
        <div className="matchesTabs">
          <button
            className={`tabButton ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            📅 赛程安排
          </button>
          <button
            className={`tabButton ${activeTab === 'standings' ? 'active' : ''}`}
            onClick={() => setActiveTab('standings')}
          >
            🏆 积分榜
          </button>
          <button
            className={`tabButton ${activeTab === 'scorers' ? 'active' : ''}`}
            onClick={() => setActiveTab('scorers')}
          >
            ⚽ 射手榜
          </button>
        </div>

        {activeTab === 'matches' && (
          <>

        {/* 错误提示 */}
        {error && (
          <div className="errorMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <div className="loadingContainer">
            <div className="loadingSpinner"></div>
            <p>加载中...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="emptyState">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p>暂无比赛数据</p>
          </div>
        ) : (
          <div className="matchesLayout">
            {/* 赛事列表 */}
            <div className="matchesList">
              {matches.map((match) => (
                <div key={match.id} className="matchCard" onClick={() => setSelectedMatchForModal(match)}>
                  <div className="matchHeader">
                    <span
                      className="matchStatus"
                      style={{ backgroundColor: statusColors[match.status] }}
                    >
                      {statusMap[match.status]}
                    </span>
                    <span className="matchDate">{formatDate(match.matchDate)}</span>
                  </div>

                  <div className="matchContent">
                    <div className="matchTeam">
                      <div className="matchTeamLogo">
                        <img
                          src={match.homeTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'}
                          alt={match.homeTeam.teamName}
                          loading="lazy"
                        />
                      </div>
                      <span className="matchTeamName">{match.homeTeam.teamName}</span>
                    </div>

                    <div className="matchScoreBox">
                      <div className="matchScore">
                        <span className="matchScoreNumber">
                          {match.status === 'scheduled' ? '-' : match.homeScore}
                        </span>
                        <span className="matchScoreSeparator">:</span>
                        <span className="matchScoreNumber">
                          {match.status === 'scheduled' ? '-' : match.awayScore}
                        </span>
                      </div>
                      {match.status === 'in_progress' && (
                        <span className="liveBadge">LIVE</span>
                      )}
                    </div>

                    <div className="matchTeam">
                      <div className="matchTeamLogo">
                        <img
                          src={match.awayTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'}
                          alt={match.awayTeam.teamName}
                          loading="lazy"
                        />
                      </div>
                      <span className="matchTeamName">{match.awayTeam.teamName}</span>
                    </div>
                  </div>

                  {/* 进球与事件面板 */}
                  {match.status === 'completed' && match.events && match.events.length > 0 && (
                    <div className="matchEventsSection">
                      <div className="eventsGrid">
                        {/* 主队事件 */}
                        <div className="teamEvents homeEvents">
                          <div className="eventLabel">👕 {match.homeTeam.teamName} 事件</div>
                          <div className="eventsTimeline">
                            {match.events
                              .filter(e => e.teamType === 'home')
                              .sort((a, b) => {
                                const parseTime = (t: string) => parseInt(t.replace(/'/g, '')) || 0;
                                return parseTime(a.eventTime) - parseTime(b.eventTime);
                              })
                              .map((e, i) => {
                                const icon = e.eventType === 'goal' ? '⚽' :
                                             e.eventType === 'own_goal' ? '🥅' :
                                             e.eventType === 'penalty' ? '🎯' :
                                             e.eventType === 'yellow_card' ? '🟨' :
                                             e.eventType === 'red_card' ? '🟥' :
                                             e.eventType === 'substitution' ? '🔄' : '📢';
                                return (
                                  <div key={i} className="timelineItem">
                                    <span className="eventTime">{e.eventTime}</span>
                                    <span className="eventIcon">{icon}</span>
                                    <span className="eventDesc">
                                      {e.eventType === 'substitution' ? (
                                        <span>
                                          换上 <strong>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                        </span>
                                      ) : e.eventType === 'own_goal' ? (
                                        <span>
                                          <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                        </span>
                                      ) : e.eventType === 'penalty' ? (
                                        <span>
                                          <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                        </span>
                                      ) : (
                                        <span>
                                          <strong>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong> {e.description || '进球'}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            {match.events.filter(e => e.teamType === 'home').length === 0 && (
                              <div className="noEvents">暂无事件记录</div>
                            )}
                          </div>
                        </div>

                        <div className="eventsGridDivider"></div>

                        {/* 客队事件 */}
                        <div className="teamEvents awayEvents">
                          <div className="eventLabel">👚 {match.awayTeam.teamName} 事件</div>
                          <div className="eventsTimeline">
                            {match.events
                              .filter(e => e.teamType === 'away')
                              .sort((a, b) => {
                                const parseTime = (t: string) => parseInt(t.replace(/'/g, '')) || 0;
                                return parseTime(a.eventTime) - parseTime(b.eventTime);
                              })
                              .map((e, i) => {
                                const icon = e.eventType === 'goal' ? '⚽' :
                                             e.eventType === 'own_goal' ? '🥅' :
                                             e.eventType === 'penalty' ? '🎯' :
                                             e.eventType === 'yellow_card' ? '🟨' :
                                             e.eventType === 'red_card' ? '🟥' :
                                             e.eventType === 'substitution' ? '🔄' : '📢';
                                return (
                                  <div key={i} className="timelineItem">
                                    <span className="eventTime">{e.eventTime}</span>
                                    <span className="eventIcon">{icon}</span>
                                    <span className="eventDesc">
                                      {e.eventType === 'substitution' ? (
                                        <span>
                                          换上 <strong>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                        </span>
                                      ) : e.eventType === 'own_goal' ? (
                                        <span>
                                          <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                        </span>
                                      ) : e.eventType === 'penalty' ? (
                                        <span>
                                          <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                        </span>
                                      ) : (
                                        <span>
                                          <strong>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong> {e.description || '进球'}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            {match.events.filter(e => e.teamType === 'away').length === 0 && (
                              <div className="noEvents">暂无事件记录</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="matchFooter">
                    <div className="matchDetail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {match.location}
                    </div>
                    <div className="matchDetail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(match.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))}

              {/* 分页 */}
              {total > limit && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="paginationButton"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="paginationNumbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`paginationNumber ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="paginationButton"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="matchesSidebar">
              {/* 即将开始的赛事 */}
              <div className="upcomingSection">
                <h3 className="sectionTitleSmall">即将开始</h3>
                {upcomingMatches.length > 0 ? (
                  <div className="upcomingList">
                    {upcomingMatches.map((match) => (
                      <div key={match.id} className="upcomingItem">
                        <div className="upcomingDate">
                          <span className="upcomingDay">
                            {new Date(match.matchDate).getDate()}
                          </span>
                          <span className="upcomingMonth">
                            {new Date(match.matchDate).toLocaleDateString('zh-CN', { month: 'short' })}
                          </span>
                        </div>
                        <div className="upcomingInfo">
                          <div className="upcomingTeams">
                            {match.homeTeam.teamName} vs {match.awayTeam.teamName}
                          </div>
                          <div className="upcomingTime">
                            {new Date(match.matchDate).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="emptyUpcoming">
                    <p>暂无即将开始的比赛</p>
                  </div>
                )}
              </div>

              {/* 统计信息 */}
              <div className="statsSection">
                <h3 className="sectionTitleSmall">赛事统计</h3>
                <div className="statsGrid">
                  <div className="statCard">
                    <span className="statValue">{matches.length}</span>
                    <span className="statLabel">总比赛数</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">
                      {matches.filter((m) => m.status === 'completed').length}
                    </span>
                    <span className="statLabel">已结束</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">
                      {matches.filter((m) => m.status === 'scheduled').length}
                    </span>
                    <span className="statLabel">即将开始</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">
                      {matches.filter((m) => m.status === 'in_progress').length}
                    </span>
                    <span className="statLabel">进行中</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )}

        {/* 积分榜 Tab 视图 */}
        {activeTab === 'standings' && (
          <div className="standingsSection">
            {statsLoading ? (
              <div className="loadingContainer">
                <div className="loadingSpinner"></div>
                <p>正在计算积分榜...</p>
              </div>
            ) : (
              <div className="standingsTableContainer">
                <table className="standingsTable">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>排名</th>
                      <th>球队</th>
                      <th>已赛</th>
                      <th>胜</th>
                      <th>平</th>
                      <th>负</th>
                      <th>进球</th>
                      <th>失球</th>
                      <th>净胜球</th>
                      <th>积分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getStandings().map((row, index) => {
                      let rankClass = '';
                      if (index === 0) rankClass = 'rank-gold';
                      else if (index === 1) rankClass = 'rank-silver';
                      else if (index === 2) rankClass = 'rank-bronze';
                      
                      return (
                        <tr key={row.teamId}>
                          <td>
                            <span className={`rankBadge ${rankClass}`}>{index + 1}</span>
                          </td>
                          <td className="tableTeamCell">
                            <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                            <span className="tableTeamName">{row.teamName}</span>
                          </td>
                          <td>{row.played}</td>
                          <td>{row.won}</td>
                          <td>{row.drawn}</td>
                          <td>{row.lost}</td>
                          <td>{row.goalsFor}</td>
                          <td>{row.goalsAgainst}</td>
                          <td className={row.goalDifference > 0 ? 'text-positive' : row.goalDifference < 0 ? 'text-negative' : ''}>
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="pointsCell">{row.points}</td>
                        </tr>
                      );
                    })}
                    {getStandings().length === 0 && (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: 'var(--text-light)' }}>
                          暂无球队数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                    {getScorers().map((row, index) => {
                      let rankClass = '';
                      if (index === 0) rankClass = 'rank-gold';
                      else if (index === 1) rankClass = 'rank-silver';
                      else if (index === 2) rankClass = 'rank-bronze';
                      
                      return (
                        <tr key={index}>
                          <td>
                            <span className={`rankBadge ${rankClass}`}>{index + 1}</span>
                          </td>
                          <td className="scorerNameCell">
                            <span className="scorerIcon">⚽</span>
                            <strong>{row.playerName}</strong>
                          </td>
                          <td>{row.jerseyNumber}号</td>
                          <td className="tableTeamCell">
                            <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                            <span className="tableTeamName">{row.teamName}</span>
                          </td>
                          <td className="goalsCell">{row.goals}</td>
                        </tr>
                      );
                    })}
                    {getScorers().length === 0 && (
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

        {/* 比赛详情弹窗 */}
        {selectedMatchForModal && (
          <div className="matchModalOverlay" onClick={() => setSelectedMatchForModal(null)}>
            <div className="matchModal" onClick={(e) => e.stopPropagation()}>
              <button className="matchModalClose" onClick={() => setSelectedMatchForModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              
              <div className="matchModalHeader">
                <span className="matchModalStatus" style={{ backgroundColor: statusColors[selectedMatchForModal.status] }}>
                  {statusMap[selectedMatchForModal.status]}
                </span>
                <span className="matchModalHeaderTitle">赛事回顾</span>
              </div>

              <div className="matchModalBody">
                <div className="matchScoreBoxLarge">
                  <div className="modalTeam">
                    <div className="modalTeamLogo">
                      <img src={selectedMatchForModal.homeTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={selectedMatchForModal.homeTeam.teamName} />
                    </div>
                    <span className="modalTeamName">{selectedMatchForModal.homeTeam.teamName}</span>
                  </div>
                  <div className="modalScore">
                    <span className="modalScoreNumber">{selectedMatchForModal.status === 'scheduled' ? '-' : selectedMatchForModal.homeScore}</span>
                    <span className="modalScoreSeparator">:</span>
                    <span className="modalScoreNumber">{selectedMatchForModal.status === 'scheduled' ? '-' : selectedMatchForModal.awayScore}</span>
                  </div>
                  <div className="modalTeam">
                    <div className="modalTeamLogo">
                      <img src={selectedMatchForModal.awayTeam.teamLogo || 'https://picsum.photos/seed/matchlogo/100/100'} alt={selectedMatchForModal.awayTeam.teamName} />
                    </div>
                    <span className="modalTeamName">{selectedMatchForModal.awayTeam.teamName}</span>
                  </div>
                </div>

                <div className="matchInfoDetails">
                  <div className="infoItem">
                    <span className="infoIcon">📍</span>
                    <div className="infoContent">
                      <span className="infoLabel">比赛地点</span>
                      <span className="infoValue">{selectedMatchForModal.location || '学校足球场'}</span>
                    </div>
                  </div>
                  <div className="infoItem">
                    <span className="infoIcon">📅</span>
                    <div className="infoContent">
                      <span className="infoLabel">比赛时间</span>
                      <span className="infoValue">{formatDate(selectedMatchForModal.matchDate)}</span>
                    </div>
                  </div>
                </div>

                {/* 进球与事件面板 */}
                {selectedMatchForModal.events && selectedMatchForModal.events.length > 0 ? (
                  <div className="matchEventsSection modalEvents">
                    <h3 className="eventsTitle">📝 比赛关键事件回顾</h3>
                    <div className="unifiedTimeline">
                      {selectedMatchForModal.events
                        .sort((a, b) => {
                          const parseTime = (t: string) => {
                            const cleaned = t.replace(/'/g, '');
                            if (cleaned.includes('+')) {
                              const parts = cleaned.split('+');
                              return (parseInt(parts[0]) || 0) + (parseInt(parts[1]) || 0) / 100;
                            }
                            return parseInt(cleaned) || 0;
                          };
                          return parseTime(a.eventTime) - parseTime(b.eventTime);
                        })
                        .map((e, i) => {
                          const icon = e.eventType === 'goal' ? '⚽' :
                                       e.eventType === 'own_goal' ? '🥅' :
                                       e.eventType === 'penalty' ? '🎯' :
                                       e.eventType === 'yellow_card' ? '🟨' :
                                       e.eventType === 'red_card' ? '🟥' :
                                       e.eventType === 'substitution' ? '🔄' : '📢';
                          const isHome = e.teamType === 'home';
                          const teamName = isHome ? selectedMatchForModal.homeTeam.teamName : selectedMatchForModal.awayTeam.teamName;
                          const teamLogo = isHome ? selectedMatchForModal.homeTeam.teamLogo : selectedMatchForModal.awayTeam.teamLogo;
                          
                          return (
                            <div key={i} className={`timelineRow ${isHome ? 'rowHome' : 'rowAway'}`}>
                              <div className="timelineDotContainer">
                                <span className="eventTime">{e.eventTime}</span>
                                <span className={`eventIconContainer eventIcon-${e.eventType}`}>
                                  {icon}
                                </span>
                              </div>
                              <div className="timelineEventCard">
                                <div className="eventCardHeader">
                                  <img className="miniTeamLogo" src={teamLogo || 'https://picsum.photos/seed/logo/20/20'} alt={teamName} />
                                  <span className="miniTeamName">{teamName}</span>
                                </div>
                                <span className="eventDesc">
                                  {e.eventType === 'substitution' ? (
                                    <span>
                                      换上 <strong>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                    </span>
                                  ) : e.eventType === 'own_goal' ? (
                                    <span>
                                      <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                    </span>
                                  ) : e.eventType === 'penalty' ? (
                                    <span>
                                      <strong>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                    </span>
                                  ) : (
                                    <span>
                                      <strong>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong> {e.description || '进球'}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="noEventsMessage">
                    ⚽ 暂无比赛事件记录
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Matches;