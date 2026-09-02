import { useState } from 'react';
import './Teams.css';
import type { Team } from '../../types';
import TeamCard from './TeamCard';
import TeamFilters from './TeamFilters';
import TeamModal from './TeamModal';
import { PlayerCareerCard } from '../Player';
import { useTeamDirectory, useTeamRoster } from './hooks';
import { usePlayerCareer } from '../../hooks/usePlayerCareer';
import { useSectionActivation } from '../../hooks/useSectionActivation';
import { LoadingSpinner, EmptyState, ErrorMessage, Pagination, ImagePreviewModal, RefreshButton, SectionHeader } from '../common';

const Teams: React.FC = () => {
  const section = useSectionActivation<HTMLElement>();
  const directory = useTeamDirectory(section.isActive);
  const career = usePlayerCareer();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const roster = useTeamRoster(selectedTeam);

  return (
    <section ref={section.ref} className="teams" id="teams">
      <div className="teamsContainer">
        <SectionHeader tag="球队信息" title="我们的" emphasis="球队" description="多支实力强劲的球队，展现SZTU足球风采" />

        <TeamFilters
          globalSeasons={directory.globalSeasons}
          globalSeasonId={directory.globalSeasonId}
          searchTerm={directory.searchTerm}
          onSeasonChange={directory.changeSeason}
          onSearchTermChange={directory.setSearchTerm}
          onSearch={directory.search}
          onReset={directory.reset}
          onKeyDown={(event) => {
            if (event.key === 'Enter') directory.search();
          }}
        />

        <RefreshButton onClick={() => directory.loadTeams(directory.currentPage, directory.globalSeasonId, directory.selectedGender, directory.isSearching ? directory.searchTerm : undefined)} />

        {directory.loading ? (
          <LoadingSpinner />
        ) : directory.error ? (
          <ErrorMessage message={directory.error} onRetry={() => directory.loadTeams(directory.currentPage, directory.globalSeasonId, directory.selectedGender, directory.isSearching ? directory.searchTerm : undefined)} />
        ) : directory.teams.length === 0 ? (
          <EmptyState message="暂无球队数据" />
        ) : (
          <>
            <div className="teamsGrid">
              {directory.teams.map((team) => (
                <TeamCard key={team.id} team={team} isSelected={selectedTeam?.id === team.id} onClick={() => setSelectedTeam(team)} />
              ))}
            </div>

            {!directory.isSearching && directory.total > directory.limit && <Pagination currentPage={directory.currentPage} totalPages={directory.totalPages} onPageChange={directory.setCurrentPage} />}
          </>
        )}

        {selectedTeam && <TeamModal team={selectedTeam} seasons={roster.seasons} selectedSeasonId={roster.selectedSeasonId} displayPlayers={roster.displayPlayers} playersLoading={roster.playersLoading} rosterError={roster.rosterError} onClose={() => setSelectedTeam(null)} onSeasonChange={roster.setSelectedSeasonId} onPreviewImage={setPreviewImage} onPlayerClick={(playerId, playerName) => career.openCareer(playerId, playerName, roster.selectedSeasonId)} />}

        <PlayerCareerCard careerPlayerId={career.careerPlayerId} careerPlayerName={career.careerPlayerName} careerData={career.careerData} careerLoading={career.careerLoading} onClose={career.closeCareer} />

        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      </div>
    </section>
  );
};

export default Teams;
