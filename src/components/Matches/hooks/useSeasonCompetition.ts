import { useCallback, useEffect, useState } from 'react';
import { fetchMatches, fetchSeasonStandings, fetchSeasonStats } from '../../../api';
import type { CupStandings, Match, SeasonStats, StandingRow } from '../../../types';
import type { AssistRow, MatchTab, ScorerRow } from '../types';

export const useSeasonCompetition = (selectedSeasonId: string) => {
  const [activeTab, setActiveTab] = useState<MatchTab>('matches');
  const [standings, setStandings] = useState<StandingRow[] | CupStandings>([]);
  const [stats, setStats] = useState<SeasonStats>({ scorers: [], assists: [], cards: [] });
  const [statsLoading, setStatsLoading] = useState(false);
  const [bracketMatches, setBracketMatches] = useState<Match[]>([]);
  const [bracketLoading, setBracketLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      if (!selectedSeasonId) return;
      setStatsLoading(true);
      try {
        const [standingsData, statsData] = await Promise.all([
          fetchSeasonStandings(selectedSeasonId),
          fetchSeasonStats(selectedSeasonId),
        ]);
        if (!active) return;
        setStandings(standingsData);
        setStats(statsData);
      } catch (loadError) {
        console.error('加载统计数据失败:', loadError);
      } finally {
        if (active) setStatsLoading(false);
      }
    };
    void loadStats();
    return () => { active = false; };
  }, [selectedSeasonId]);

  const loadBracketMatches = useCallback(async () => {
    if (!selectedSeasonId) return;
    setBracketLoading(true);
    try {
      const response = await fetchMatches(1, 200, undefined, selectedSeasonId);
      setBracketMatches((response.data || []).filter((match) => match.stage === 'KNOCKOUT'));
    } catch (loadError) {
      console.error('加载淘汰赛比赛失败:', loadError);
    } finally {
      setBracketLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    if (activeTab === 'bracket') void loadBracketMatches();
  }, [activeTab, loadBracketMatches]);

  return {
    activeTab,
    setActiveTab,
    standings,
    statsLoading,
    bracketMatches,
    bracketLoading,
    scorers: (stats.scorers || []).slice(0, 10) as ScorerRow[],
    assists: (stats.assists || []).slice(0, 10) as AssistRow[],
  };
};
