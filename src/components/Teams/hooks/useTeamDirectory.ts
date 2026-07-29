import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchSeasons, fetchTeams, searchTeams } from '../../../api';
import type { Season, Team } from '../../../types';

const PAGE_SIZE = 8;

const getSeasonGender = (seasonName: string) => {
  if (seasonName.includes('女')) return 'FEMALE';
  if (seasonName.includes('男')) return 'MALE';
  return null;
};

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
  const [selectedGender, setSelectedGender] = useState('MALE');
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
        if (seasons.length > 0) {
          // 从赛季名称解析年份（如 2026 赛季）
          const getYear = (name: string) => {
            const match = (name || '').match(/(\d{4})/);
            return match ? parseInt(match[1], 10) : 0;
          };

          // 优先挑选最新年份且属于男子组的赛季
          const sortedSeasons = [...seasons].sort((a, b) => {
            const yearA = getYear(a.name);
            const yearB = getYear(b.name);
            if (yearA !== yearB) return yearB - yearA;

            const isMaleA = a.name.includes('男') || a.name.includes('男子');
            const isMaleB = b.name.includes('男') || b.name.includes('男子');
            if (isMaleA !== isMaleB) return isMaleA ? -1 : 1;

            return (b.name || '').localeCompare(a.name || '');
          });

          // 优先拿激活的男子组赛季，否则拿年份最新的男子组赛季
          const activeMale = seasons.find(
            (season) => season.status === 'active' && (season.name.includes('男') || season.name.includes('男子')),
          );
          const active = seasons.find((season) => season.status === 'active');

          const targetSeason = activeMale || active || sortedSeasons[0] || seasons[0];
          if (targetSeason) {
            setGlobalSeasonId(targetSeason.id);
            setSelectedGender(getSeasonGender(targetSeason.name) || 'MALE');
          }
        }
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

  const changeSeason = (id: string) => {
    setCurrentPage(1);
    setGlobalSeasonId(id);
    const season = globalSeasons.find((item) => item.id === id);
    const seasonGender = season ? getSeasonGender(season.name) : null;
    if (seasonGender) setSelectedGender(seasonGender);
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
    changeSeason,
    totalPages: appliedSearchTerm ? 1 : Math.ceil(total / PAGE_SIZE),
    isSearching: appliedSearchTerm.length > 0,
  };
};
