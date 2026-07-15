import { useState, useEffect, useCallback } from 'react';
import './Teams.css';
import type { Team, Player } from '../../types';
import { fetchTeams, searchTeams, fetchSeasons, fetchTeamById, fetchMatches, fetchTeamPlayersBySeason } from '../../api';

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(6);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 赛季与球员相关状态
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [displayPlayers, setDisplayPlayers] = useState<any[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const loadTeams = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (search && search.trim()) {
        const results = await searchTeams(search);
        setTeams(results);
        setTotal(results.length);
        setIsSearching(true);
      } else {
        const response = await fetchTeams(page, limit);
        setTeams(response.data);
        setTotal(response.total);
        setIsSearching(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载球队数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadTeams(1);
  }, [loadTeams]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadTeams(1, searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    loadTeams(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && (!isSearching || page === 1)) {
      setCurrentPage(page);
      loadTeams(page, isSearching ? searchTerm : undefined);
    }
  };

  useEffect(() => {
    if (!selectedTeam) {
      setSeasons([]);
      setSelectedSeasonId('');
      setRosterError(null);
      return;
    }
    
    let active = true;
    const loadSeasons = async () => {
      try {
        const seasonsList = await fetchSeasons();
        if (!active) return;
        setSeasons(seasonsList);
        
        const activeSeason = seasonsList.find(s => s.status === 'active');
        const activeId = activeSeason ? activeSeason.id : (seasonsList[0]?.id || '');
        setSelectedSeasonId(activeId);
      } catch (err) {
        console.error('获取赛季列表失败:', err);
      }
    };
    
    loadSeasons();
    return () => {
      active = false;
    };
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedTeam || !selectedSeasonId) {
      setDisplayPlayers([]);
      setRosterError(null);
      return;
    }
    
    let active = true;
    const loadRoster = async () => {
      setPlayersLoading(true);
      setRosterError(null);
      try {
        const roster = await fetchTeamPlayersBySeason(selectedTeam.id, selectedSeasonId);
        if (!active) return;
        setDisplayPlayers(roster);
      } catch (err) {
        console.error('获取球员名单失败:', err);
        if (active) {
          setDisplayPlayers([]);
          setRosterError('获取球员花名册失败，请稍后重试');
        }
      } finally {
        if (active) {
          setPlayersLoading(false);
        }
      }
    };
    
    loadRoster();
    return () => {
      active = false;
    };
  }, [selectedTeam, selectedSeasonId]);

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
  };

  const totalPages = isSearching ? 1 : Math.ceil(total / limit);

  return (
    <section className="teams" id="teams">
      <div className="teamsContainer">
        <div className="sectionHeader">
          <span className="sectionTag">球队信息</span>
          <h2 className="sectionTitle">
            我们的<span>球队</span>
          </h2>
          <p className="sectionDescription">
            多支实力强劲的球队，展现SZTU足球风采
          </p>
        </div>

        {/* 搜索框 */}
        <div className="teamSearch">
          <div className="searchInputWrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="搜索球队名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="searchInput"
            />
            {searchTerm && (
              <button onClick={handleReset} className="searchClear" aria-label="清除搜索">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="searchButton">
            搜索
          </button>
        </div>

        {/* 刷新按钮 */}
        <button onClick={() => loadTeams(currentPage, isSearching ? searchTerm : undefined)} className="refreshButton">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          刷新
        </button>

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
        ) : teams.length === 0 ? (
          <div className="emptyState">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
            </svg>
            <p>暂无球队数据</p>
          </div>
        ) : (
          <>
            {/* 球队列表 */}
            <div className="teamsGrid">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`teamCard ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="teamImageWrapper">
                    <img
                      src={team.teamLogo || 'https://picsum.photos/seed/team/300/200'}
                      alt={team.teamName}
                      className="teamImage"
                      loading="lazy"
                    />
                    <div className="teamOverlay"></div>
                    <div className="teamBadge">
                      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id={`teamGrad${team.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#1A56DB', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#2563EB', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="45" fill={`url(#teamGrad${team.id})`} />
                        <path
                          d="M50 15 L55 35 L75 35 L60 48 L65 68 L50 55 L35 68 L40 48 L25 35 L45 35 Z"
                          fill="#BFDBFE"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="teamContent">
                    <h3 className="teamName">{team.teamName}</h3>
                    <div className="teamInfo">
                      <div className="teamInfoItem">
                        <span className="teamInfoLabel">主教练</span>
                        <span className="teamInfoValue">{team.headCoach || '暂无'}</span>
                      </div>
                      <div className="teamInfoItem">
                        <span className="teamInfoLabel">队长</span>
                        <span className="teamInfoValue">{team.teamLeader || '暂无'}</span>
                      </div>
                      <div className="teamInfoItem">
                        <span className="teamInfoLabel">队医</span>
                        <span className="teamInfoValue">{team.teamDoctor || '暂无'}</span>
                      </div>
                      <div className="teamInfoItem">
                        <span className="teamInfoLabel">主场球衣</span>
                        <span className="teamInfoValue">{team.homeJerseyColor || '暂无'}</span>
                      </div>
                    </div>
                    <button className="teamDetailsButton">查看详情</button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {!isSearching && total > limit && (
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
          </>
        )}

        {/* 球队详情弹窗 */}
        {selectedTeam && (
          <div className="teamModalOverlay" onClick={() => setSelectedTeam(null)}>
            <div className="teamModal" onClick={(e) => e.stopPropagation()}>
              <button className="modalClose" onClick={() => setSelectedTeam(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="modalHeader">
                <img
                  src={selectedTeam.teamLogo || 'https://picsum.photos/seed/jersey1/100/100'}
                  alt={selectedTeam.teamName}
                  className="modalLogo"
                  onClick={() => setPreviewImage(selectedTeam.teamLogo || 'https://picsum.photos/seed/jersey1/100/100')}
                />
                <h3 className="modalTitle">{selectedTeam.teamName}</h3>
              </div>
              <div className="modalContent">
                <div className="modalInfoGrid">
                  <div className="modalInfoItem coachInfoItem">
                    <span className="modalInfoLabel">主教练</span>
                    <span className="modalInfoValue">{selectedTeam.headCoach || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">队长</span>
                    <span className="modalInfoValue">{selectedTeam.teamLeader || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">队医</span>
                    <span className="modalInfoValue">{selectedTeam.teamDoctor || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">教练电话</span>
                    <span className="modalInfoValue">{selectedTeam.coachPhone || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">队长电话</span>
                    <span className="modalInfoValue">{selectedTeam.leaderPhone || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">主场球衣颜色</span>
                    <span className="modalInfoValue">{selectedTeam.homeJerseyColor || '暂无'}</span>
                  </div>
                  <div className="modalInfoItem">
                    <span className="modalInfoLabel">客场球衣颜色</span>
                    <span className="modalInfoValue">{selectedTeam.awayJerseyColor || '暂无'}</span>
                  </div>
                </div>
                <div className="modalJerseys">
                  <div className="modalJersey">
                    <img
                      src={selectedTeam.homeJersey || 'https://picsum.photos/seed/jersey2/200/300'}
                      alt="主场球衣"
                      className="jerseyImage"
                      onClick={() => setPreviewImage(selectedTeam.homeJersey || 'https://picsum.photos/seed/jersey2/200/300')}
                    />
                    <span className="jerseyLabel">主场球衣</span>
                  </div>
                  <div className="modalJersey">
                    <img
                      src={selectedTeam.awayJersey || 'https://picsum.photos/seed/jersey2/200/300'}
                      alt="客场球衣"
                      className="jerseyImage"
                      onClick={() => setPreviewImage(selectedTeam.awayJersey || 'https://picsum.photos/seed/jersey2/200/300')}
                    />
                    <span className="jerseyLabel">客场球衣</span>
                  </div>
                </div>

                {/* 赛季球员名单 */}
                <div className="modalPlayersSection">
                  <div className="modalPlayersHeader">
                    <h4>👥 队员名单</h4>
                    {seasons.length > 0 && (
                      <select
                        value={selectedSeasonId}
                        onChange={(e) => handleSeasonChange(e.target.value)}
                        className="modalSeasonSelect"
                      >
                        {seasons.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} {s.status === 'active' ? '(当前)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {playersLoading ? (
                    <div className="modalPlayersLoading">加载球员列表中...</div>
                  ) : rosterError ? (
                    <div className="modalPlayersEmpty" style={{ color: '#fa5252' }}>{rosterError}</div>
                  ) : displayPlayers.length === 0 ? (
                    <div className="modalPlayersEmpty">该赛季暂无队员登记或出场记录</div>
                  ) : (
                    <div className="modalPlayersList">
                      {displayPlayers.map((player) => {
                        const isSuspended = player.status === 'suspended';
                        return (
                          <div 
                            key={player.id || `${player.name}_${player.jerseyNumber}`} 
                            className="modalPlayerCard"
                            style={isSuspended ? { borderLeft: '3px solid #fa5252', backgroundColor: '#fff5f5' } : undefined}
                            title={isSuspended ? '该球员本赛季因红黄牌停赛' : undefined}
                          >
                            {player.photo ? (
                              <img src={player.photo} alt={player.name} className="modalPlayerPhoto" />
                            ) : (
                              <div 
                                className="modalPlayerPhotoPlaceholder"
                                style={isSuspended ? { backgroundColor: '#fa5252' } : undefined}
                              >
                                {isSuspended ? '🛑' : '👕'}
                              </div>
                            )}
                            <div className="modalPlayerInfo">
                              <span className="modalPlayerName" style={isSuspended ? { color: '#c92a2a' } : undefined}>
                                {player.name} {isSuspended && <span style={{ fontSize: '0.75rem', color: '#fa5252', fontWeight: 'bold' }}>(停)</span>}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span className="modalPlayerNumber">{player.jerseyNumber ? `${player.jerseyNumber}号` : '无号'}</span>
                                {(player.yellowCards > 0 || player.redCards > 0) && (
                                  <span style={{ display: 'inline-flex', gap: '3px', fontSize: '0.75rem' }}>
                                    {player.yellowCards > 0 && <span style={{ color: '#f59f00' }}>🟨{player.yellowCards}</span>}
                                    {player.redCards > 0 && <span style={{ color: '#fa5252' }}>🟥{player.redCards}</span>}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图片预览弹窗 */}
        {previewImage && (
          <div className="imagePreviewOverlay" onClick={() => setPreviewImage(null)}>
            <div className="imagePreviewContainer" onClick={(e) => e.stopPropagation()}>
              <img src={previewImage} alt="大图预览" className="previewLargeImage" />
              <button className="previewCloseButton" onClick={() => setPreviewImage(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Teams;