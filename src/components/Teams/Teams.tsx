import { useState, useEffect, useCallback, useRef } from 'react';
import './Teams.css';
import type { Player, Season, Team } from '../../types';
import { fetchTeams, searchTeams, fetchSeasons, fetchTeamPlayersBySeason } from '../../api';
import TeamCard from './TeamCard';
import TeamModal from './TeamModal';
import TeamFilters from './TeamFilters';

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(6);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const isSearching = appliedSearchTerm.length > 0;
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // 赛季与球员相关状态
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [displayPlayers, setDisplayPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  // 全局赛季与男女组别筛选状态
  const [globalSeasons, setGlobalSeasons] = useState<Season[]>([]);
  const [globalSeasonId, setGlobalSeasonId] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const latestRequestId = useRef(0);

  const loadTeams = useCallback(async (page: number, seasonId: string, gender: string, search?: string) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    try {
      if (search && search.trim()) {
        const results = await searchTeams(search);
        const filtered = results.filter((team) => {
          const matchesGender = gender === 'all' || team.gender === gender;
          const matchesSeason = seasonId === 'all'
            || team.groupTeams?.some((groupTeam) => groupTeam.seasonId === seasonId);
          return matchesGender && matchesSeason;
        });
        if (requestId !== latestRequestId.current) return;
        setTeams(filtered);
        setTotal(filtered.length);
      } else {
        const response = await fetchTeams(
          page, 
          limit, 
          seasonId === 'all' ? undefined : seasonId, 
          gender === 'all' ? undefined : gender
        );
        if (requestId !== latestRequestId.current) return;
        setTeams(response.data);
        setTotal(response.total);
      }
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      setError(err instanceof Error ? err.message : '加载球队数据失败');
      console.error(err);
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [limit]);

  // 初始化加载赛季列表
  useEffect(() => {
    const initSeasons = async () => {
      try {
        const seasonsList = await fetchSeasons();
        setGlobalSeasons(seasonsList);
        const activeSeason = seasonsList.find((s) => s.status === 'active');
        if (activeSeason) {
          setGlobalSeasonId(activeSeason.id);
        }
      } catch (err) {
        console.error('获取赛季列表失败:', err);
      }
    };
    initSeasons();
  }, []);

  // 筛选状态变化时重新加载
  useEffect(() => {
    loadTeams(currentPage, globalSeasonId, selectedGender, appliedSearchTerm || undefined);
  }, [currentPage, globalSeasonId, selectedGender, appliedSearchTerm, loadTeams]);

  // 处理性别 Tab 切换
  const handleGenderTabChange = (gender: string) => {
    setCurrentPage(1);
    setSelectedGender(gender);
    if (globalSeasonId !== 'all') {
      const selectedSeason = globalSeasons.find(s => s.id === globalSeasonId);
      if (selectedSeason) {
        const isInvalid = (gender === 'FEMALE' && (selectedSeason.name.includes('男') || selectedSeason.name.includes('男子'))) ||
                          (gender === 'MALE' && (selectedSeason.name.includes('女') || selectedSeason.name.includes('女子')));
        if (isInvalid) {
          setGlobalSeasonId('all');
        }
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    const nextSearchTerm = searchTerm.trim();
    setAppliedSearchTerm(nextSearchTerm);
    if (currentPage === 1 && appliedSearchTerm === nextSearchTerm) {
      loadTeams(1, globalSeasonId, selectedGender, nextSearchTerm || undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setAppliedSearchTerm('');
    if (currentPage === 1 && appliedSearchTerm === '') {
      loadTeams(1, globalSeasonId, selectedGender);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1) setCurrentPage(page);
  };

  // 弹窗内赛季加载
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
        const filteredSeasons = seasonsList.filter((s) => {
          if (selectedTeam.gender === 'FEMALE') {
            return !s.name.includes('男') && !s.name.includes('男子');
          } else {
            return !s.name.includes('女') && !s.name.includes('女子');
          }
        });
        setSeasons(filteredSeasons);
        const teamSeasonIds = selectedTeam.groupTeams?.map((gt) => gt.seasonId) || [];
        const matchedActiveSeason = filteredSeasons.find(s => s.status === 'active' && teamSeasonIds.includes(s.id));
        const activeSeason = matchedActiveSeason || filteredSeasons.find(s => s.status === 'active');
        const activeId = activeSeason ? activeSeason.id : (filteredSeasons[0]?.id || '');
        setSelectedSeasonId(activeId);
      } catch (err) {
        console.error('获取赛季列表失败:', err);
      }
    };
    loadSeasons();
    return () => { active = false; };
  }, [selectedTeam]);

  // 弹窗内球员加载
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
        if (active) setPlayersLoading(false);
      }
    };
    loadRoster();
    return () => { active = false; };
  }, [selectedTeam, selectedSeasonId]);

  const handleSeasonChange = (seasonId: string) => setSelectedSeasonId(seasonId);
  const totalPages = appliedSearchTerm ? 1 : Math.ceil(total / limit);

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

        <TeamFilters
          globalSeasons={globalSeasons}
          globalSeasonId={globalSeasonId}
          selectedGender={selectedGender}
          searchTerm={searchTerm}
          onSeasonChange={(id) => { setCurrentPage(1); setGlobalSeasonId(id); }}
          onGenderChange={handleGenderTabChange}
          onSearchTermChange={setSearchTerm}
          onSearch={handleSearch}
          onReset={handleReset}
          onKeyDown={handleKeyDown}
        />

        {/* 刷新按钮 */}
        <button onClick={() => loadTeams(currentPage, globalSeasonId, selectedGender, isSearching ? searchTerm : undefined)} className="refreshButton">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          刷新
        </button>

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
            <div className="teamsGrid">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={selectedTeam?.id === team.id}
                  onClick={() => setSelectedTeam(team)}
                />
              ))}
            </div>

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

        {selectedTeam && (
          <TeamModal
            team={selectedTeam}
            seasons={seasons}
            selectedSeasonId={selectedSeasonId}
            displayPlayers={displayPlayers}
            playersLoading={playersLoading}
            rosterError={rosterError}
            onClose={() => setSelectedTeam(null)}
            onSeasonChange={handleSeasonChange}
            onPreviewImage={setPreviewImage}
          />
        )}

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
