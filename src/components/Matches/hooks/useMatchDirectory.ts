import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMatches, fetchSeasons, fetchTeams } from '../../../api';
import type { Match, Season, Team } from '../../../types';
import type { SortOption, StatusFilter } from '../types';
import { selectUpcomingMatches, sortMatches } from '../utils/matchData';

export const useMatchDirectory = (enabled = true) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchStats, setMatchStats] = useState({ total: 0, completed: 0, scheduled: 0, ongoing: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [teamFilter, setTeamFilter] = useState('');
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [seasonsReady, setSeasonsReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const loadInitialData = async () => {
      try {
        const seasonsList = await fetchSeasons();
        if (!active) return;
        setSeasons(seasonsList);
        const activeSeason = seasonsList.find((season) => season.status === 'active');
        setSelectedSeasonId(activeSeason?.id || seasonsList[0]?.id || '');
      } catch (loadError) {
        console.error('加载初始数据失败:', loadError);
      } finally {
        if (active) setSeasonsReady(true);
      }
    };
    void loadInitialData();
    return () => { active = false; };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !seasonsReady) return;
    const activeToken = { active: true };

    const loadSeasonTeams = async () => {
      if (!selectedSeasonId) {
        setAvailableTeams([]);
        setTeamFilter('');
        return;
      }

      try {
        const response = await fetchTeams(1, 100, selectedSeasonId);
        if (!activeToken.active) return;
        const seasonTeams = response?.data || [];
        setAvailableTeams(seasonTeams);
        setTeamFilter((currentTeamId) => (
          currentTeamId && !seasonTeams.some((team) => team.id === currentTeamId)
            ? ''
            : currentTeamId
        ));
      } catch (loadError) {
        if (activeToken.active) {
          setAvailableTeams([]);
          setTeamFilter('');
        }
        console.error('加载当前赛季球队失败:', loadError);
      }
    };

    void loadSeasonTeams();
    return () => { activeToken.active = false; };
  }, [enabled, seasonsReady, selectedSeasonId]);

  const loadMatches = useCallback(async (
    page: number,
    status?: string,
    teamId?: string,
    seasonId?: string,
    activeToken: { active: boolean } = { active: true },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const filteredTeamId = teamId && teamId !== 'all' ? teamId : undefined;
      const response = await fetchMatches(page, limit, filteredTeamId, seasonId, status);
      if (!activeToken.active) return;
      setMatches(response.data);
      setTotal(response.total);
      setMatchStats(response.stats || {
        total: response.total,
        completed: response.data.filter((match) => match.status === 'completed').length,
        scheduled: response.data.filter((match) => match.status === 'scheduled').length,
        ongoing: response.data.filter((match) => match.status === 'in_progress').length,
      });
    } catch (loadError) {
      if (activeToken.active) {
        setError(loadError instanceof Error ? loadError.message : '加载比赛数据失败');
      }
      console.error(loadError);
    } finally {
      if (activeToken.active) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !seasonsReady) return;
    const activeToken = { active: true };
    setCurrentPage(1);
    void loadMatches(1, statusFilter, teamFilter, selectedSeasonId, activeToken);
    return () => { activeToken.active = false; };
  }, [enabled, seasonsReady, statusFilter, teamFilter, selectedSeasonId, loadMatches]);

  const sortedMatches = useMemo(() => sortMatches(matches, sortBy), [matches, sortBy]);

  const changePage = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    void loadMatches(page, statusFilter, teamFilter, selectedSeasonId);
  };

  const changeSeason = (seasonId: string) => {
    setAvailableTeams([]);
    setTeamFilter('');
    setSelectedSeasonId(seasonId);
  };

  const reloadMatches = useCallback(() => {
    void loadMatches(currentPage, statusFilter, teamFilter, selectedSeasonId);
  }, [currentPage, statusFilter, teamFilter, selectedSeasonId, loadMatches]);

  return {
    matches: sortedMatches, matchStats, loading, error, currentPage, total, limit,
    sortBy, setSortBy, statusFilter, setStatusFilter, teamFilter, setTeamFilter,
    availableTeams, seasons, selectedSeasonId, setSelectedSeasonId: changeSeason,
    upcomingMatches: selectUpcomingMatches(sortedMatches), changePage, reloadMatches,
  };
};

