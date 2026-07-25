import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchSeasons, fetchTeams, searchTeams } from '../../../api';
import type { Season, Team } from '../../../types';

const PAGE_SIZE = 6;

export const useTeamDirectory = () => {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [globalSeasons, setGlobalSeasons] = useState<Season[]>([]);
  const [globalSeasonId, setGlobalSeasonId] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const latestRequestId = useRef(0);

  // 移动端检测（≤768px）
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const loadTeams = useCallback(async (
    _page: number,
    seasonId: string,
    gender: string,
    search?: string,
  ) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    try {
      if (search?.trim()) {
        const results = await searchTeams(search);
        const filtered = results.filter((team) =>
          (gender === 'all' || team.gender === gender) &&
          (seasonId === 'all' || team.groupTeams?.some((item) => item.seasonId === seasonId)),
        );
        if (requestId !== latestRequestId.current) return;
        setAllTeams(filtered);
        setTotal(filtered.length);
      } else {
        // 一次拉取全部球队
        const response = await fetchTeams(
          1,
          50,
          seasonId === 'all' ? undefined : seasonId,
          gender === 'all' ? undefined : gender,
        );
        if (requestId !== latestRequestId.current) return;
        setAllTeams(response.data);
        setTotal(response.total);
      }
    } catch (loadError) {
      if (requestId !== latestRequestId.current) return;
      setError(loadError instanceof Error ? loadError.message : '加载球队数据失败');
      console.error(loadError);
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const seasons = await fetchSeasons();
        setGlobalSeasons(seasons);
        const active = seasons.find((season) => season.status === 'active');
        if (active) setGlobalSeasonId(active.id);
      } catch (loadError) {
        console.error('获取赛季列表失败:', loadError);
      }
    };
    void loadSeasons();
  }, []);

  useEffect(() => {
    void loadTeams(currentPage, globalSeasonId, selectedGender, appliedSearchTerm || undefined);
  }, [currentPage, globalSeasonId, selectedGender, appliedSearchTerm, loadTeams]);

  // PC 端前端分页，移动端全部展示
  const teams = useMemo(() => {
    if (appliedSearchTerm || isMobile) return allTeams;
    const start = (currentPage - 1) * PAGE_SIZE;
    return allTeams.slice(start, start + PAGE_SIZE);
  }, [allTeams, currentPage, appliedSearchTerm, isMobile]);

  const changeGender = (gender: string) => {
    setCurrentPage(1);
    setSelectedGender(gender);
    if (globalSeasonId === 'all') return;
    const season = globalSeasons.find((item) => item.id === globalSeasonId);
    if (!season) return;
    const invalid =
      (gender === 'FEMALE' && (season.name.includes('男') || season.name.includes('男子'))) ||
      (gender === 'MALE' && (season.name.includes('女') || season.name.includes('女子')));
    if (invalid) setGlobalSeasonId('all');
  };

  const search = () => {
    setCurrentPage(1);
    const next = searchTerm.trim();
    setAppliedSearchTerm(next);
    if (currentPage === 1 && appliedSearchTerm === next) {
      void loadTeams(1, globalSeasonId, selectedGender, next || undefined);
    }
  };

  const reset = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setAppliedSearchTerm('');
    if (currentPage === 1 && appliedSearchTerm === '') {
      void loadTeams(1, globalSeasonId, selectedGender);
    }
  };

  return {
    teams, loading, error, searchTerm, setSearchTerm, appliedSearchTerm,
    currentPage, setCurrentPage, total, limit: PAGE_SIZE, globalSeasons, globalSeasonId,
    selectedGender, changeGender, search, reset, loadTeams,
    changeSeason: (id: string) => { setCurrentPage(1); setGlobalSeasonId(id); },
    totalPages: appliedSearchTerm ? 1 : Math.ceil(total / PAGE_SIZE),
    isSearching: appliedSearchTerm.length > 0,
  };
};
