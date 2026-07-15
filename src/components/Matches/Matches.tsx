import { useState, useEffect, useCallback } from 'react';
import './Matches.css';
import type { Match, Team } from '../../types';
import { fetchMatches, fetchTeams, fetchSeasons, fetchPlayerCareer, fetchSeasonStandings, fetchSeasonStats } from '../../api';

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
  const [matchStats, setMatchStats] = useState({ total: 0, completed: 0, scheduled: 0, ongoing: 0 });
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
  const [modalTab, setModalTab] = useState<'events' | 'lineups'>('events');

  // 赛季与生涯卡片状态
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [careerPlayerId, setCareerPlayerId] = useState<string | null>(null);
  const [careerPlayerName, setCareerPlayerName] = useState<string>('');
  const [careerData, setCareerData] = useState<any>(null);
  const [careerLoading, setCareerLoading] = useState(false);

  // 积分与数据统计逻辑
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'scorers' | 'assists'>('matches');
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [stats, setStats] = useState<any>({ scorers: [], assists: [], cards: [] });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const loadSeasonsData = async () => {
      try {
        const seasonsList = await fetchSeasons();
        setSeasons(seasonsList);
        const active = seasonsList.find(s => s.status === 'active');
        if (active) {
          setSelectedSeasonId(active.id);
        } else if (seasonsList.length > 0) {
          setSelectedSeasonId(seasonsList[0].id);
        }
      } catch (err) {
        console.error('加载赛季列表失败:', err);
      }
    };
    loadSeasonsData();
  }, []);

  useEffect(() => {
    let active = true;
    const loadStatsData = async () => {
      if (!selectedSeasonId) return;
      setStatsLoading(true);
      try {
        const [standingsData, statsData] = await Promise.all([
          fetchSeasonStandings(selectedSeasonId),
          fetchSeasonStats(selectedSeasonId)
        ]);
        if (!active) return;
        setStandings(standingsData);
        setStats(statsData);
      } catch (err) {
        console.error('加载统计数据失败:', err);
      } finally {
        if (active) setStatsLoading(false);
      }
    };
    loadStatsData();
    return () => {
      active = false;
    };
  }, [selectedSeasonId]);

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
    playerId?: string;
    playerName: string;
    jerseyNumber: string;
    teamName: string;
    teamLogo: string;
    goals: number;
  }

  const getStandings = (): StandingRow[] => {
    return standings;
  };

  const getScorers = (): ScorerRow[] => {
    return (stats.scorers || []).slice(0, 10);
  };

  interface AssistRow {
    playerId?: string;
    playerName: string;
    jerseyNumber: string;
    teamName: string;
    teamLogo: string;
    assists: number;
  }

  const getAssists = (): AssistRow[] => {
    return (stats.assists || []).slice(0, 10);
  };

  const loadMatches = useCallback(async (
    page: number,
    status?: string,
    teamId?: string,
    sort?: SortOption,
    seasonId?: string,
    activeToken: { active: boolean } = { active: true }
  ) => {
    setLoading(true);
    setError(null);
    try {
      let filteredTeamId = teamId && teamId !== 'all' ? teamId : undefined;
      const response = await fetchMatches(page, limit, filteredTeamId, seasonId);
      
      if (!activeToken.active) return;
      
      let sortedMatches = [...response.data];
      
      if (sort) {
        sortedMatches.sort((a, b) => {
          const dateA = a.matchDate ? new Date(a.matchDate).getTime() : 0;
          const dateB = b.matchDate ? new Date(b.matchDate).getTime() : 0;
          
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
      
      if (response.stats) {
        setMatchStats(response.stats);
      } else {
        setMatchStats({
          total: response.total,
          completed: sortedMatches.filter((m) => m.status === 'completed').length,
          scheduled: sortedMatches.filter((m) => m.status === 'scheduled').length,
          ongoing: sortedMatches.filter((m) => m.status === 'in_progress').length,
        });
      }
      
      const teamMap = new Map<string, Team>();
      response.data.forEach(m => {
        if (m.homeTeam) teamMap.set(m.homeTeam.id, m.homeTeam);
        if (m.awayTeam) teamMap.set(m.awayTeam.id, m.awayTeam);
      });
      const teams = Array.from(teamMap.values());
      setAvailableTeams(teams);
    } catch (err) {
      if (activeToken.active) {
        setError(err instanceof Error ? err.message : '加载比赛数据失败');
      }
      console.error(err);
    } finally {
      if (activeToken.active) {
        setLoading(false);
      }
    }
  }, [limit]);

  useEffect(() => {
    const activeToken = { active: true };
    loadMatches(1, statusFilter, teamFilter, sortBy, selectedSeasonId, activeToken);
    return () => {
      activeToken.active = false;
    };
  }, [statusFilter, teamFilter, sortBy, selectedSeasonId, loadMatches]);

  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
      loadMatches(page, statusFilter, teamFilter, sortBy, selectedSeasonId);
    }
  };

  const handleRefresh = () => {
    loadMatches(currentPage, statusFilter, teamFilter, sortBy, selectedSeasonId);
  };

  const handlePlayerClick = async (playerId: string, playerName: string) => {
    if (!playerId) return;
    setCareerPlayerId(playerId);
    setCareerPlayerName(playerName);
    setCareerLoading(true);
    setCareerData(null);
    try {
      const apiResponse = await fetchPlayerCareer(playerId);
      if (apiResponse && apiResponse.player) {
        const playerObj = apiResponse.player;
        const careerList = apiResponse.career || [];
        
        let totalMatches = 0;
        let totalGoals = 0;
        let totalAssists = 0;
        let totalYellow = 0;
        let totalRed = 0;
        
        careerList.forEach((c: any) => {
          totalMatches += c.appearances || 0;
          totalGoals += c.goals || 0;
          totalAssists += c.assists || 0;
          totalYellow += c.yellowCards || 0;
          totalRed += c.redCards || 0;
        });

        const structuredData = {
          jerseyNumber: playerObj.jerseyNumber || '#',
          teamName: playerObj.team?.teamName || '暂无队伍',
          status: playerObj.status || 'active',
          summary: {
            totalMatches,
            totalGoals,
            totalAssists,
            totalYellow,
            totalRed
          },
          seasons: careerList.map((c: any) => ({
            seasonName: c.seasonName,
            matchesPlayed: c.appearances || 0,
            goals: c.goals || 0,
            assists: c.assists || 0,
            yellowCards: c.yellowCards || 0,
            redCards: c.redCards || 0
          }))
        };
        
        setCareerData(structuredData);
      } else {
        console.error('返回数据格式不正确:', apiResponse);
      }
    } catch (err) {
      console.error('加载球员生涯数据失败:', err);
    } finally {
      setCareerLoading(false);
    }
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

        {/* 导航标签卡与赛季选择器 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
          <div className="matchesTabs" style={{ margin: 0 }}>
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
            <button
              className={`tabButton ${activeTab === 'assists' ? 'active' : ''}`}
              onClick={() => setActiveTab('assists')}
            >
              🎯 助攻榜
            </button>
          </div>

          {seasons.length > 0 && (
            <div className="seasonSelectorWrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-color)' }}>📅 选择赛季:</span>
              <select
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '30px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--card-bg, #fff)',
                  color: 'var(--text-color)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {seasons.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.status === 'active' ? '(当前赛季)' : '(往期归档)'}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                <div key={match.id} className="matchCard" onClick={() => { setSelectedMatchForModal(match); setModalTab('events'); }}>
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
                          <div className="eventLabel">
                            <span className="fullTeamName">👕 {match.homeTeam.teamName} 事件</span>
                            <span className="shortTeamName">👕 主队</span>
                          </div>
                          <div className="eventsTimeline">
                            {match.events
                              .filter(e => e.teamType === 'home')
                              .sort((a, b) => {
                                const parseTime = (t: any) => parseInt(String(t || '').replace(/'/g, '')) || 0;
                                return parseTime(a.eventTime) - parseTime(b.eventTime);
                              })
                              .map((e, i) => {
                                const icon = e.eventType === 'goal' ? '⚽' :
                                             e.eventType === 'own_goal' ? '🥅' :
                                             e.eventType === 'penalty' ? '🎯' :
                                             e.eventType === 'yellow_card' ? '🟨' :
                                             e.eventType === 'red_card' ? '🟥' : e.eventType === 'yellow_to_red' ? '\uD83D\uDFE8\uD83D\uDFE5' :
                                             e.eventType === 'substitution' ? '🔄' : '📢';
                                return (
                                  <div key={i} className="timelineItem">
                                    <span className="eventTime">{e.eventTime}</span>
                                    <span className="eventIcon">{icon}</span>
                                    <span className="eventDesc">
                                      {e.eventType === 'substitution' ? (
                                        <span>
                                          换上 <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong style={{ cursor: e.subPlayerId ? 'pointer' : 'default', textDecoration: e.subPlayerId ? 'underline' : 'none', color: e.subPlayerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.subPlayerId && handlePlayerClick(e.subPlayerId, e.subPlayerName || ''); }}>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                        </span>
                                      ) : e.eventType === 'own_goal' ? (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                        </span>
                                      ) : e.eventType === 'penalty' ? (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                          {e.assistPlayerName && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                              (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={(evt) => { evt.stopPropagation(); e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || ''); }}>{e.assistPlayerName}</strong>)
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong>{' '}
                                          {e.eventType === 'yellow_card' ? '黄牌' :
                                           e.eventType === 'red_card' ? '红牌' : e.eventType === 'yellow_to_red' ? '两黄变一红' :
                                           e.eventType === 'goal' ? '进球' :
                                           e.eventType === 'penalty' ? '点球' :
                                           e.eventType === 'own_goal' ? '乌龙球' :
                                           e.eventType === 'substitution' ? '换人' :
                                           (e.description || '事件')}
                                          {e.eventType === 'goal' && e.assistPlayerName && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                              (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={(evt) => { evt.stopPropagation(); e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || ''); }}>{e.assistPlayerName}</strong>)
                                            </span>
                                          )}
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
                          <div className="eventLabel">
                            <span className="fullTeamName">👚 {match.awayTeam.teamName} 事件</span>
                            <span className="shortTeamName">👚 客队</span>
                          </div>
                          <div className="eventsTimeline">
                            {match.events
                              .filter(e => e.teamType === 'away')
                              .sort((a, b) => {
                                const parseTime = (t: any) => parseInt(String(t || '').replace(/'/g, '')) || 0;
                                return parseTime(a.eventTime) - parseTime(b.eventTime);
                              })
                              .map((e, i) => {
                                const icon = e.eventType === 'goal' ? '⚽' :
                                             e.eventType === 'own_goal' ? '🥅' :
                                             e.eventType === 'penalty' ? '🎯' :
                                             e.eventType === 'yellow_card' ? '🟨' :
                                             e.eventType === 'red_card' ? '🟥' : e.eventType === 'yellow_to_red' ? '\uD83D\uDFE8\uD83D\uDFE5' :
                                             e.eventType === 'substitution' ? '🔄' : '📢';
                                return (
                                  <div key={i} className="timelineItem">
                                    <span className="eventTime">{e.eventTime}</span>
                                    <span className="eventIcon">{icon}</span>
                                    <span className="eventDesc">
                                      {e.eventType === 'substitution' ? (
                                        <span>
                                          换上 <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong style={{ cursor: e.subPlayerId ? 'pointer' : 'default', textDecoration: e.subPlayerId ? 'underline' : 'none', color: e.subPlayerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.subPlayerId && handlePlayerClick(e.subPlayerId, e.subPlayerName || ''); }}>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                        </span>
                                      ) : e.eventType === 'own_goal' ? (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                        </span>
                                      ) : e.eventType === 'penalty' ? (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                          {e.assistPlayerName && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                              (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={(evt) => { evt.stopPropagation(); e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || ''); }}>{e.assistPlayerName}</strong>)
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span>
                                          <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={(evt) => { evt.stopPropagation(); e.playerId && handlePlayerClick(e.playerId, e.playerName || ''); }}>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong>{' '}
                                          {e.eventType === 'yellow_card' ? '黄牌' :
                                           e.eventType === 'red_card' ? '红牌' : e.eventType === 'yellow_to_red' ? '两黄变一红' :
                                           e.eventType === 'goal' ? '进球' :
                                           e.eventType === 'penalty' ? '点球' :
                                           e.eventType === 'own_goal' ? '乌龙球' :
                                           e.eventType === 'substitution' ? '换人' :
                                           (e.description || '事件')}
                                          {e.eventType === 'goal' && e.assistPlayerName && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                              (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={(evt) => { evt.stopPropagation(); e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || ''); }}>{e.assistPlayerName}</strong>)
                                            </span>
                                          )}
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
                      {new Date(match.matchDate).toLocaleDateString('zh-CN')}
                    </div>
                    {match.mvpPlayerName && (
                      <div className="matchDetail" style={{ color: '#e65100', fontWeight: 'bold', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(evt) => { evt.stopPropagation(); match.mvpPlayerId && handlePlayerClick(match.mvpPlayerId, match.mvpPlayerName || ''); }}>
                        🏆 MVP: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{match.mvpPlayerName}</span>
                      </div>
                    )}
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
                    <span className="statValue">{matchStats.total}</span>
                    <span className="statLabel">总比赛数</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">{matchStats.completed}</span>
                    <span className="statLabel">已结束</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">{matchStats.scheduled}</span>
                    <span className="statLabel">即将开始</span>
                  </div>
                  <div className="statCard">
                    <span className="statValue">{matchStats.ongoing}</span>
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
                          <td>
                            <div className="tableTeamCell">
                              <img className="tableTeamLogo" src={row.teamLogo || 'https://picsum.photos/seed/team/30/30'} alt={row.teamName} />
                              <span className="tableTeamName">{row.teamName}</span>
                            </div>
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
                          <td
                            style={{ cursor: row.playerId ? 'pointer' : 'default' }}
                            onClick={() => row.playerId && handlePlayerClick(row.playerId, row.playerName)}
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
                    {getAssists().map((row, index) => {
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
                            onClick={() => row.playerId && handlePlayerClick(row.playerId, row.playerName)}
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
                    {getAssists().length === 0 && (
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
                  {selectedMatchForModal.mvpPlayerName && (
                    <div className="infoItem" style={{ cursor: selectedMatchForModal.mvpPlayerId ? 'pointer' : 'default' }} onClick={() => selectedMatchForModal.mvpPlayerId && handlePlayerClick(selectedMatchForModal.mvpPlayerId, selectedMatchForModal.mvpPlayerName || '')}>
                      <span className="infoIcon">🏆</span>
                      <div className="infoContent">
                        <span className="infoLabel">本场最佳 (MVP)</span>
                        <span className="infoValue" style={{ fontWeight: 'bold', color: '#e65100', textDecoration: selectedMatchForModal.mvpPlayerId ? 'underline' : 'none' }}>{selectedMatchForModal.mvpPlayerName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 详情弹窗标签页切换 */}
                <div className="modalTabContainer" style={{ display: 'flex', borderBottom: '2px solid var(--border-color, #eee)', marginBottom: '20px', gap: '15px' }}>
                  <button
                    className={`modalTabButton ${modalTab === 'events' ? 'active' : ''}`}
                    onClick={() => setModalTab('events')}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: modalTab === 'events' ? 'var(--primary-color)' : 'var(--text-light)',
                      borderBottom: modalTab === 'events' ? '3px solid var(--primary-color)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginBottom: '-2px'
                    }}
                  >
                    📝 关键事件
                  </button>
                  <button
                    className={`modalTabButton ${modalTab === 'lineups' ? 'active' : ''}`}
                    onClick={() => setModalTab('lineups')}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      background: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: modalTab === 'lineups' ? 'var(--primary-color)' : 'var(--text-light)',
                      borderBottom: modalTab === 'lineups' ? '3px solid var(--primary-color)' : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginBottom: '-2px'
                    }}
                  >
                    🏃‍♂️ 双方阵容
                  </button>
                </div>

                {/* 关键事件面板 */}
                {modalTab === 'events' && (
                  selectedMatchForModal.events && selectedMatchForModal.events.length > 0 ? (
                    <div className="matchEventsSection modalEvents" style={{ marginTop: 0 }}>
                      <h3 className="eventsTitle">📝 比赛关键事件回顾</h3>
                      <div className="unifiedTimeline">
                        {selectedMatchForModal.events
                          .sort((a, b) => {
                            const parseTime = (t: any) => {
                              const cleaned = String(t || '').replace(/'/g, '');
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
                                         e.eventType === 'red_card' ? '🟥' : e.eventType === 'yellow_to_red' ? '\uD83D\uDFE8\uD83D\uDFE5' :
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
                                        换上 <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={() => e.playerId && handlePlayerClick(e.playerId, e.playerName || '')}>{e.playerName} ({e.jerseyNumber}号)</strong>，换下 <strong style={{ cursor: e.subPlayerId ? 'pointer' : 'default', textDecoration: e.subPlayerId ? 'underline' : 'none', color: e.subPlayerId ? 'var(--primary-color)' : 'inherit' }} onClick={() => e.subPlayerId && handlePlayerClick(e.subPlayerId, e.subPlayerName || '')}>{e.subPlayerName} ({e.subJerseyNumber}号)</strong>
                                      </span>
                                    ) : e.eventType === 'own_goal' ? (
                                      <span>
                                        <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={() => e.playerId && handlePlayerClick(e.playerId, e.playerName || '')}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="ownGoalBadge">乌龙球</span>
                                      </span>
                                    ) : e.eventType === 'penalty' ? (
                                      <span>
                                        <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={() => e.playerId && handlePlayerClick(e.playerId, e.playerName || '')}>{e.playerName} ({e.jerseyNumber}号)</strong> <span className="penaltyBadge">点球</span>
                                        {e.assistPlayerName && (
                                          <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                            (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={() => e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || '')}>{e.assistPlayerName}</strong>)
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <span>
                                        <strong style={{ cursor: e.playerId ? 'pointer' : 'default', textDecoration: e.playerId ? 'underline' : 'none', color: e.playerId ? 'var(--primary-color)' : 'inherit' }} onClick={() => e.playerId && handlePlayerClick(e.playerId, e.playerName || '')}>{e.playerName ? `${e.playerName} (${e.jerseyNumber}号)` : ''}</strong>{' '}
                                        {e.eventType === 'yellow_card' ? '黄牌' :
                                         e.eventType === 'red_card' ? '红牌' : e.eventType === 'yellow_to_red' ? '两黄变一红' :
                                         e.eventType === 'goal' ? '进球' :
                                         e.eventType === 'penalty' ? '点球' :
                                         e.eventType === 'own_goal' ? '乌龙球' :
                                         e.eventType === 'substitution' ? '换人' :
                                         (e.description || '事件')}
                                        {e.eventType === 'goal' && e.assistPlayerName && (
                                          <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', marginLeft: '6px', fontStyle: 'italic' }}>
                                            (助攻: <strong style={{ cursor: e.assistPlayerId ? 'pointer' : 'underline' }} onClick={() => e.assistPlayerId && handlePlayerClick(e.assistPlayerId, e.assistPlayerName || '')}>{e.assistPlayerName}</strong>)
                                          </span>
                                        )}
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
                  )
                )}

                {/* 阵容对比面板 */}
                {modalTab === 'lineups' && (
                  <div className="modalLineupsContainer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '10px 0' }}>
                    {/* 主队阵容 */}
                    <div className="modalLineupColumn">
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '2px solid var(--border-color)', paddingBottom: '6px' }}>
                        {selectedMatchForModal.homeTeam.teamName} (主)
                      </h3>
                      
                      <div className="lineupSubSection">
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '10px', borderLeft: '3px solid #4caf50', paddingLeft: '8px' }}>首发球员</h4>
                        <div className="lineupPlayersList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(!selectedMatchForModal.lineups || selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'home' && l.lineupType === 'starting').length === 0) ? (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>未公布首发</span>
                          ) : (
                            selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'home' && l.lineupType === 'starting').map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', fontSize: '0.95rem' }}>
                                <span style={{ fontWeight: 800, color: '#4caf50', minWidth: '24px' }}>#{l.player?.jerseyNumber ?? ''}</span>
                                <strong
                                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-color)' }}
                                  onClick={() => handlePlayerClick(l.playerId, l.player?.name || '')}
                                >
                                  {l.player?.name || '未知球员'}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="lineupSubSection" style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '10px', borderLeft: '3px solid #2196f3', paddingLeft: '8px' }}>替补席</h4>
                        <div className="lineupPlayersList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(!selectedMatchForModal.lineups || selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'home' && l.lineupType === 'substitute').length === 0) ? (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>未公布替补</span>
                          ) : (
                            selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'home' && l.lineupType === 'substitute').map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', fontSize: '0.95rem' }}>
                                <span style={{ fontWeight: 800, color: '#2196f3', minWidth: '24px' }}>#{l.player?.jerseyNumber ?? ''}</span>
                                <strong
                                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-color)' }}
                                  onClick={() => handlePlayerClick(l.playerId, l.player?.name || '')}
                                >
                                  {l.player?.name || '未知球员'}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 客队阵容 */}
                    <div className="modalLineupColumn">
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '15px', borderBottom: '2px solid var(--border-color)', paddingBottom: '6px' }}>
                        {selectedMatchForModal.awayTeam.teamName} (客)
                      </h3>
                      
                      <div className="lineupSubSection">
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '10px', borderLeft: '3px solid #4caf50', paddingLeft: '8px' }}>首发球员</h4>
                        <div className="lineupPlayersList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(!selectedMatchForModal.lineups || selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'away' && l.lineupType === 'starting').length === 0) ? (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>未公布首发</span>
                          ) : (
                            selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'away' && l.lineupType === 'starting').map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', fontSize: '0.95rem' }}>
                                <span style={{ fontWeight: 800, color: '#4caf50', minWidth: '24px' }}>#{l.player?.jerseyNumber ?? ''}</span>
                                <strong
                                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-color)' }}
                                  onClick={() => handlePlayerClick(l.playerId, l.player?.name || '')}
                                >
                                  {l.player?.name || '未知球员'}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="lineupSubSection" style={{ marginTop: '20px' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '10px', borderLeft: '3px solid #2196f3', paddingLeft: '8px' }}>替补席</h4>
                        <div className="lineupPlayersList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(!selectedMatchForModal.lineups || selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'away' && l.lineupType === 'substitute').length === 0) ? (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '8px' }}>未公布替补</span>
                          ) : (
                            selectedMatchForModal.lineups.filter((l: any) => l.teamType === 'away' && l.lineupType === 'substitute').map((l: any) => (
                              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', backgroundColor: 'var(--bg-light, #f8f9fa)', borderRadius: '8px', fontSize: '0.95rem' }}>
                                <span style={{ fontWeight: 800, color: '#2196f3', minWidth: '24px' }}>#{l.player?.jerseyNumber ?? ''}</span>
                                <strong
                                  style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--text-color)' }}
                                  onClick={() => handlePlayerClick(l.playerId, l.player?.name || '')}
                                >
                                  {l.player?.name || '未知球员'}
                                </strong>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* 球员跨赛季“生涯数据球星卡” */}
        {careerPlayerId && (
          <div className="matchModalOverlay" style={{ zIndex: 1000 }} onClick={() => setCareerPlayerId(null)}>
            <div
              className="matchModal careerCardModal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '520px',
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                borderRadius: '24px',
                overflow: 'hidden'
              }}
            >
              <button className="matchModalClose" onClick={() => setCareerPlayerId(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {careerLoading ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                  <div className="loadingSpinner" style={{ margin: '0 auto 15px auto' }}></div>
                  <p style={{ color: 'var(--text-color)', fontWeight: 600 }}>正在生成生涯球星卡...</p>
                </div>
              ) : careerData ? (
                <div style={{ padding: '30px 24px' }}>
                  {/* 球星卡顶部个人信息 */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.5rem',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      color: '#fff',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {careerData.jerseyNumber || '#'}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)' }}>
                        {careerPlayerName}
                      </h3>
                      <p style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>🛡️</span> {careerData.teamName || '暂无队伍'}
                        {careerData.status === 'suspended' && (
                          <span style={{ background: '#ffebeb', color: '#d93838', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '5px' }}>🛑 停赛中</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 生涯总计面板 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-color)' }}>{careerData.summary.totalMatches}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>出场数</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>{careerData.summary.totalGoals}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>总进球</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0288d1' }}>{careerData.summary.totalAssists}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>总助攻</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f57c00' }}>
                        🟨{careerData.summary.totalYellow} 🟥{careerData.summary.totalRed}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>红黄牌</div>
                    </div>
                  </div>

                  {/* 跨赛季历史表单 */}
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>📊 赛季生涯历程</h4>
                  <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                          <th style={{ padding: '10px 8px', fontWeight: 600 }}>赛季</th>
                          <th style={{ padding: '10px 8px', fontWeight: 600 }}>估算出场</th>
                          <th style={{ padding: '10px 8px', fontWeight: 600 }}>进球</th>
                          <th style={{ padding: '10px 8px', fontWeight: 600 }}>助攻</th>
                          <th style={{ padding: '10px 8px', fontWeight: 600 }}>黄牌/红牌</th>
                        </tr>
                      </thead>
                      <tbody>
                        {careerData.seasons.map((s: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: idx === careerData.seasons.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.2)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 500 }}>{s.seasonName}</td>
                            <td style={{ padding: '10px 8px' }}>{s.matchesPlayed}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--primary-color)' }}>{s.goals}</td>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0288d1' }}>{s.assists}</td>
                            <td style={{ padding: '10px 8px' }}>🟨{s.yellowCards} / 🟥{s.redCards}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>无法加载生涯数据</div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Matches;