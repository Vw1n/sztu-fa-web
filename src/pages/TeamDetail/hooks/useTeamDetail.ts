import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchTeamById, fetchTeamPlayersBySeason, fetchSeasons } from '../../../api';
import type { Player, Season, TeamWithPlayers } from '../../../types';

export const useTeamDetail = (teamId: string) => {
  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [displayPlayers, setDisplayPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const latestRequestId = useRef(0);

  // 加载球队详情
  const loadTeam = useCallback(async () => {
    if (!teamId) return;
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await fetchTeamById(teamId);
      if (requestId !== latestRequestId.current) return;
      setTeam(data);
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      if (err instanceof Error && err.message === '球队不存在') {
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : '加载球队详情失败');
      }
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, [teamId]);

  // 加载赛季列表
  useEffect(() => {
    if (!team) return;
    let active = true;
    const loadSeasons = async () => {
      try {
        const seasonsList = await fetchSeasons();
        if (!active) return;
        const filtered = seasonsList.filter((season) =>
          team.gender === 'FEMALE'
            ? !season.name.includes('男') && !season.name.includes('男子')
            : !season.name.includes('女') && !season.name.includes('女子'),
        );
        setSeasons(filtered);
        const teamSeasonIds = team.groupTeams?.map((item) => item.seasonId) || [];
        const activeSeason =
          filtered.find((season) => season.status === 'active' && teamSeasonIds.includes(season.id)) ||
          filtered.find((season) => season.status === 'active');
        setSelectedSeasonId(activeSeason?.id || filtered[0]?.id || '');
      } catch (loadError) {
        console.error('获取赛季列表失败:', loadError);
      }
    };
    void loadSeasons();
    return () => { active = false; };
  }, [team]);

  // 加载赛季球员名单
  useEffect(() => {
    if (!teamId || !selectedSeasonId) {
      setDisplayPlayers([]);
      setRosterError(null);
      return;
    }
    let active = true;
    const loadRoster = async () => {
      setPlayersLoading(true);
      setRosterError(null);
      try {
        const roster = await fetchTeamPlayersBySeason(teamId, selectedSeasonId);
        if (active) setDisplayPlayers(roster);
      } catch (loadError) {
        console.error('获取球员名单失败:', loadError);
        if (active) {
          setDisplayPlayers([]);
          setRosterError('获取球员名册失败，请稍后重试');
        }
      } finally {
        if (active) setPlayersLoading(false);
      }
    };
    void loadRoster();
    return () => { active = false; };
  }, [teamId, selectedSeasonId]);

  // 首次加载球队
  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  return {
    team,
    loading,
    error,
    notFound,
    seasons,
    selectedSeasonId,
    setSelectedSeasonId,
    displayPlayers,
    playersLoading,
    rosterError,
    reload: loadTeam,
  };
};
