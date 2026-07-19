import React, { useState } from 'react';
import './Matches.css';
import type { Match } from '../../types';
import { LeagueStandings } from './components/LeagueStandings';
import { KnockoutBracket } from './components/KnockoutBracket';
import { ScorerBoard } from './components/ScorerBoard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { MatchList } from './components/MatchList';
import { PlayerCareerCard } from './components/PlayerCareerCard';
import { useMatchDirectory, usePlayerCareer, useSeasonCompetition } from './hooks';

const Matches: React.FC = () => {
  const directory = useMatchDirectory();
  const competition = useSeasonCompetition(directory.selectedSeasonId);
  const career = usePlayerCareer();
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [modalTab, setModalTab] = useState<'events' | 'lineups'>('events');
  const selectedSeason = directory.seasons.find(
    (season) => season.id === directory.selectedSeasonId,
  );

  const openMatch = (match: Match) => {
    setSelectedMatchForModal(match);
    setModalTab('events');
  };

  return (
    <section className="matches" id="matches">
      <div className="matchesContainer">
        <div className="sectionHeader">
          <span className="sectionTag">赛事公告</span>
          <h2 className="sectionTitle">赛事<span>安排</span></h2>
          <p className="sectionDescription">了解最新赛事安排，见证精彩对决</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px' }}>
          <div className="matchesTabs" style={{ margin: 0 }}>
            <button className={`tabButton ${competition.activeTab === 'matches' ? 'active' : ''}`} onClick={() => competition.setActiveTab('matches')}>
              📅 赛程安排
            </button>
            <button className={`tabButton ${competition.activeTab === 'standings' ? 'active' : ''}`} onClick={() => competition.setActiveTab('standings')}>
              🏆 积分榜
            </button>
            {selectedSeason?.type === 'CUP' && (
              <button className={`tabButton ${competition.activeTab === 'bracket' ? 'active' : ''}`} onClick={() => competition.setActiveTab('bracket')}>
                🌳 淘汰赛对阵
              </button>
            )}
            <button className={`tabButton ${competition.activeTab === 'scorers' ? 'active' : ''}`} onClick={() => competition.setActiveTab('scorers')}>
              ⚽ 射手榜
            </button>
            <button className={`tabButton ${competition.activeTab === 'assists' ? 'active' : ''}`} onClick={() => competition.setActiveTab('assists')}>
              🎯 助攻榜
            </button>
          </div>

          {directory.seasons.length > 0 && (
            <div className="season-selector-container">
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>📅 选择赛季:</span>
              <select value={directory.selectedSeasonId} onChange={(event) => directory.setSelectedSeasonId(event.target.value)} className="season-select-element">
                {directory.seasons.map((season) => (
                  <option key={season.id} value={season.id}>
                    {season.name} {season.status === 'active' ? '(当前赛季)' : '(往期归档)'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {competition.activeTab === 'matches' && (
          <MatchList
            matches={directory.matches}
            loading={directory.loading}
            error={directory.error}
            teamFilter={directory.teamFilter}
            statusFilter={directory.statusFilter}
            sortBy={directory.sortBy}
            availableTeams={directory.availableTeams}
            currentPage={directory.currentPage}
            limit={directory.limit}
            total={directory.total}
            matchStats={directory.matchStats}
            upcomingMatches={directory.upcomingMatches}
            onTeamFilterChange={directory.setTeamFilter}
            onStatusFilterChange={directory.setStatusFilter}
            onSortByChange={directory.setSortBy}
            onPageChange={directory.changePage}
            onMatchClick={openMatch}
            onPlayerClick={career.openCareer}
          />
        )}

        {competition.activeTab === 'standings' && (
          <LeagueStandings standings={competition.standings} statsLoading={competition.statsLoading} />
        )}
        {competition.activeTab === 'bracket' && (
          <KnockoutBracket
            bracketMatches={competition.bracketMatches}
            bracketLoading={competition.bracketLoading}
            onMatchClick={openMatch}
          />
        )}
        {(competition.activeTab === 'scorers' || competition.activeTab === 'assists') && (
          <ScorerBoard
            activeTab={competition.activeTab}
            scorers={competition.scorers}
            assists={competition.assists}
            statsLoading={competition.statsLoading}
            onPlayerClick={career.openCareer}
          />
        )}

        <MatchDetailModal
          selectedMatchForModal={selectedMatchForModal}
          modalTab={modalTab}
          onClose={() => setSelectedMatchForModal(null)}
          onTabChange={setModalTab}
          onPlayerClick={career.openCareer}
        />
        <PlayerCareerCard
          careerPlayerId={career.careerPlayerId}
          careerPlayerName={career.careerPlayerName}
          careerData={career.careerData}
          careerLoading={career.careerLoading}
          onClose={career.closeCareer}
        />
      </div>
    </section>
  );
};

export default Matches;
