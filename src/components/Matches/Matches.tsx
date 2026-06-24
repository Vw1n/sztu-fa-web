import { useState, useEffect } from 'react';
import './Matches.css';
import type { Match, Team } from '../../types';
import { fetchMatches } from '../../api';

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

        {/* 筛选和排序栏 */}
        {/* <div className="matchesFilters">
          <div className="filterGroup">
            <label className="filterLabel">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="filterSelect"
            >
              <option value="all">全部</option>
              <option value="scheduled">即将开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已结束</option>
            </select>
          </div>

          <div className="filterGroup">
            <label className="filterLabel">球队</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="filterSelect"
            >
              <option value="all">全部球队</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>

          <div className="filterGroup">
            <label className="filterLabel">排序</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="filterSelect"
            >
              <option value="date-desc">日期(新→旧)</option>
              <option value="date-asc">日期(旧→新)</option>
              <option value="score-desc">比分(高→低)</option>
              <option value="score-asc">比分(低→高)</option>
            </select>
          </div>

          <button onClick={handleRefresh} className="refreshButton">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            刷新
          </button>
        </div> */}

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
                <div key={match.id} className="matchCard">
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
      </div>
    </section>
  );
};

export default Matches;