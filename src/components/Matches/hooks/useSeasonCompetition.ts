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
      const allMatches = response.data || [];
      const knockoutMatches = allMatches.filter(
        (match) =>
          match.stage === 'KNOCKOUT' ||
          (match.knockoutRound && match.knockoutRound.trim() !== '') ||
          (match.matchName &&
            (match.matchName.includes('三四名') ||
              match.matchName.includes('季军') ||
              match.matchName.includes('3/4'))),
      );

      const hasExplicit3RD = knockoutMatches.some(
        (m) =>
          m.knockoutRound === '3RD' ||
          m.knockoutRound === '3RD_PLACE' ||
          m.knockoutRound === 'THIRD_PLACE' ||
          (m.matchName && (m.matchName.includes('三四名') || m.matchName.includes('季军'))),
      );

      if (!hasExplicit3RD) {
        const sf1 = knockoutMatches.find(
          (m) => m.knockoutRound === 'SF' && Number(m.knockoutMatchIndex) === 1,
        );
        const sf2 = knockoutMatches.find(
          (m) => m.knockoutRound === 'SF' && Number(m.knockoutMatchIndex) === 2,
        );
        if (sf1 && sf2 && sf1.status === 'completed' && sf2.status === 'completed') {
          const sf1Winner =
            sf1.winnerTeamId || (sf1.homeScore > sf1.awayScore ? sf1.homeTeamId : sf1.awayTeamId);
          const sf1Loser = sf1Winner === sf1.homeTeamId ? sf1.awayTeamId : sf1.homeTeamId;

          const sf2Winner =
            sf2.winnerTeamId || (sf2.homeScore > sf2.awayScore ? sf2.homeTeamId : sf2.awayTeamId);
          const sf2Loser = sf2Winner === sf2.homeTeamId ? sf2.awayTeamId : sf2.homeTeamId;

          if (sf1Loser && sf2Loser) {
            const thirdPlaceMatch = allMatches.find(
              (m) =>
                (m.homeTeamId === sf1Loser && m.awayTeamId === sf2Loser) ||
                (m.homeTeamId === sf2Loser && m.awayTeamId === sf1Loser),
            );
            if (thirdPlaceMatch) {
              knockoutMatches.push({
                ...thirdPlaceMatch,
                stage: 'KNOCKOUT',
                knockoutRound: '3RD',
                knockoutMatchIndex: 1,
              });
            }
          }
        }
      }

      setBracketMatches(knockoutMatches);
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
