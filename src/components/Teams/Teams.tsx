import { useState, useEffect } from 'react';
import './Teams.css';
import type { Team } from '../../types';
import { fetchTeams, searchTeams } from '../../api';

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

  const loadTeams = async (page: number, search?: string) => {
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
  };

  useEffect(() => {
    loadTeams(1);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    loadTeams(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
              onKeyPress={handleKeyPress}
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
                />
                <h3 className="modalTitle">{selectedTeam.teamName}</h3>
              </div>
              <div className="modalContent">
                <div className="modalInfoGrid">
                  <div className="modalInfoItem">
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
                    />
                    <span className="jerseyLabel">主场球衣</span>
                  </div>
                  <div className="modalJersey">
                    <img
                      src={selectedTeam.awayJersey || 'https://picsum.photos/seed/jersey2/200/300'}
                      alt="客场球衣"
                      className="jerseyImage"
                    />
                    <span className="jerseyLabel">客场球衣</span>
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

export default Teams;