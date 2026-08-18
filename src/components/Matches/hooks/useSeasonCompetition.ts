import { useCallback, useEffect, useState } from 'react';
import { fetchMatches, fetchSeasonStandings, fetchSeasonStats } from '../../../api';
import type { CupStandings, Match, SeasonStats, StandingRow } from '../../../types';
import type { AssistRow, MatchTab, ScorerRow } from '../types';
import { getWinnerTeamId } from '../utils/matchOutcome';

export const useSeasonCompetition = (selectedSeasonId: string, enabled = true) => {
  const [activeTab, setActiveTab] = useState<MatchTab>('matches');
  const [standings, setStandings] = useState<StandingRow[] | CupStandings>([]);
  const [stats, setStats] = useState<SeasonStats>({ scorers: [], assists: [], cards: [] });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [bracketMatches, setBracketMatches] = useState<Match[]>([]);
  const [bracketLoading, setBracketLoading] = useState(false);

  const loadStats = useCallback(async (
    seasonId: string,
    tab: MatchTab,
    active = true,
  ) => {
    if (!seasonId || tab === 'matches') return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      if (tab === 'standings') {
        const standingsData = await fetchSeasonStandings(seasonId);
        if (active) setStandings(standingsData);
        return;
      }

      const statsData = await fetchSeasonStats(seasonId);
      if (!active) return;
      setStats(statsData);
    } catch (loadError) {
      if (active) {
        setStatsError(loadError instanceof Error ? loadError.message : '加载赛季统计数据失败');
      }
      console.error('加载统计数据失败:', loadError);
    } finally {
      if (active) setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadStats(selectedSeasonId, activeTab, active);
    return () => { active = false; };
  }, [enabled, selectedSeasonId, activeTab, loadStats]);

  const loadBracketMatches = useCallback(async () => {
    if (!selectedSeasonId) return;
    setBracketLoading(true);
    try {
      const response = await fetchMatches(
        1,
        100,
        undefined,
        selectedSeasonId,
        undefined,
        'KNOCKOUT',
      );
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
          const sf1Winner = getWinnerTeamId(sf1);
          const sf1Loser = sf1Winner === sf1.homeTeamId ? sf1.awayTeamId : sf1.homeTeamId;

          const sf2Winner = getWinnerTeamId(sf2);
          const sf2Loser = sf2Winner === sf2.homeTeamId ? sf2.awayTeamId : sf2.homeTeamId;

          if (sf1Winner && sf2Winner && sf1Loser && sf2Loser) {
            const semifinalEnd = Math.max(
              new Date(sf1.matchDate).getTime(),
              new Date(sf2.matchDate).getTime(),
            );
            const thirdPlaceMatch = allMatches
              .filter(
                (m) =>
                  m.stage !== 'GROUP' &&
                  new Date(m.matchDate).getTime() >= semifinalEnd &&
                  ((m.homeTeamId === sf1Loser && m.awayTeamId === sf2Loser) ||
                    (m.homeTeamId === sf2Loser && m.awayTeamId === sf1Loser)),
              )
              .sort(
                (first, second) =>
                  new Date(first.matchDate).getTime() -
                  new Date(second.matchDate).getTime(),
              )[0];
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
    if (enabled && activeTab === 'standings') void loadBracketMatches();
  }, [enabled, activeTab, loadBracketMatches]);

  return {
    activeTab,
    setActiveTab,
    standings,
    statsLoading,
    statsError,
    reloadStats: () => void loadStats(selectedSeasonId, activeTab),
    bracketMatches,
    bracketLoading,
    scorers: (stats.scorers || []).slice(0, 10) as ScorerRow[],
    assists: (stats.assists || []).slice(0, 10) as AssistRow[],
  };
};

