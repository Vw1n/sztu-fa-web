import React, { useState } from 'react';
import './Matches.css';
import type { Match } from '../../types';
import { LeagueStandings } from './components/LeagueStandings';
import { KnockoutBracket } from './components/KnockoutBracket';
import { ScorerBoard } from './components/ScorerBoard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { MatchList } from './components/MatchList';
import { PlayerCareerCard } from '../Player';
import { useMatchDirectory, useSeasonCompetition } from './hooks';
import { usePlayerCareer } from '../../hooks/usePlayerCareer';
import { useSectionActivation } from '../../hooks/useSectionActivation';
import { SectionHeader, SeasonSelector } from '../common';

const Matches: React.FC = () => {
  const section = useSectionActivation<HTMLElement>();
  const directory = useMatchDirectory(section.isActive);
  const competition = useSeasonCompetition(directory.selectedSeasonId, section.isActive);
  const career = usePlayerCareer();
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [modalTab, setModalTab] = useState<'events' | 'lineups'>('events');
  const selectedSeason = directory.seasons.find((season) => season.id === directory.selectedSeasonId);

  const openMatch = (match: Match) => {
    setSelectedMatchForModal(match);
    setModalTab('events');
  };
  const openSeasonPlayerCard = (playerId: string, playerName: string) => career.openCareer(playerId, playerName, directory.selectedSeasonId);

  return (
    <section ref={section.ref} className="matches" id="matches">
      <div className="matchesContainer">
        <SectionHeader tag="赛事公告" title="赛事" emphasis="安排" description="了解最新赛事安排，见证精彩对决" />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '12px',
          }}
        >
          <div className="matchesTabs" style={{ margin: 0 }}>
            <button className={`tabButton ${competition.activeTab === 'matches' ? 'active' : ''}`} onClick={() => competition.setActiveTab('matches')}>
              📅 赛程安排
            </button>
            <button className={`tabButton ${competition.activeTab === 'standings' ? 'active' : ''}`} onClick={() => competition.setActiveTab('standings')}>
              🏆 积分榜
            </button>
            <button className={`tabButton ${competition.activeTab === 'scorers' ? 'active' : ''}`} onClick={() => competition.setActiveTab('scorers')}>
              ⚽ 射手榜
            </button>
            <button className={`tabButton ${competition.activeTab === 'assists' ? 'active' : ''}`} onClick={() => competition.setActiveTab('assists')}>
              🎯 助攻榜
            </button>
          </div>

          {directory.seasons.length > 0 && (
            <div className="season-selector-container">
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                📅 选择赛季:
              </span>
              <SeasonSelector seasons={directory.seasons} selectedSeasonId={directory.selectedSeasonId} onChange={directory.setSelectedSeasonId} />
            </div>
          )}
        </div>

        {competition.activeTab === 'matches' && <MatchList matches={directory.matches} loading={directory.loading} error={directory.error} teamFilter={directory.teamFilter} statusFilter={directory.statusFilter} sortBy={directory.sortBy} availableTeams={directory.availableTeams} currentPage={directory.currentPage} limit={directory.limit} total={directory.total} matchStats={directory.matchStats} upcomingMatches={directory.upcomingMatches} onTeamFilterChange={directory.setTeamFilter} onStatusFilterChange={directory.setStatusFilter} onSortByChange={directory.setSortBy} onPageChange={directory.changePage} onMatchClick={openMatch} onPlayerClick={openSeasonPlayerCard} onRetry={directory.reloadMatches} />}

        {competition.activeTab === 'standings' && (
          <>
            {selectedSeason?.type === 'CUP' && <KnockoutBracket bracketMatches={competition.bracketMatches} bracketLoading={competition.bracketLoading} onMatchClick={openMatch} />}
            <LeagueStandings standings={competition.standings} statsLoading={competition.statsLoading} statsError={competition.statsError} onRetry={competition.reloadStats} />
          </>
        )}
        {(competition.activeTab === 'scorers' || competition.activeTab === 'assists') && <ScorerBoard activeTab={competition.activeTab} scorers={competition.scorers} assists={competition.assists} statsLoading={competition.statsLoading} statsError={competition.statsError} onRetry={competition.reloadStats} onPlayerClick={openSeasonPlayerCard} />}

        <MatchDetailModal selectedMatchForModal={selectedMatchForModal} modalTab={modalTab} onClose={() => setSelectedMatchForModal(null)} onTabChange={setModalTab} onPlayerClick={openSeasonPlayerCard} />
        <PlayerCareerCard careerPlayerId={career.careerPlayerId} careerPlayerName={career.careerPlayerName} careerData={career.careerData} careerLoading={career.careerLoading} onClose={career.closeCareer} />
      </div>
    </section>
  );
};

export default Matches;
