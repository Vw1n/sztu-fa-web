import React from 'react';
import type { Match, Team } from '../../../types';
import type { SortOption, StatusFilter } from '../types';
import { MatchCard } from './MatchCard';
import { MatchFilters } from './MatchFilters';
import { MatchSidebar } from './MatchSidebar';
import { LoadingSpinner, EmptyState, ErrorMessage, Pagination } from '../../common';

interface MatchListProps {
  matches: Match[];
  loading: boolean;
  error: string | null;
  teamFilter: string;
  statusFilter: StatusFilter;
  sortBy: SortOption;
  availableTeams: Team[];
  currentPage: number;
  limit: number;
  total: number;
  matchStats: { total: number; completed: number; scheduled: number; ongoing: number };
  upcomingMatches: Match[];
  onTeamFilterChange: (teamId: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onSortByChange: (sortBy: SortOption) => void;
  onPageChange: (page: number) => void;
  onMatchClick: (match: Match) => void;
  onPlayerClick: (playerId: string, playerName: string) => void;
  onRetry?: () => void;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches, loading, error, teamFilter, statusFilter, sortBy, availableTeams,
  currentPage, limit, total, matchStats, upcomingMatches,
  onTeamFilterChange, onStatusFilterChange, onSortByChange,
  onPageChange, onMatchClick, onPlayerClick, onRetry,
}) => {
  const totalPages = Math.ceil(total / limit);
  return (
    <>
      <MatchFilters
        teamFilter={teamFilter}
        statusFilter={statusFilter}
        sortBy={sortBy}
        availableTeams={availableTeams}
        onTeamFilterChange={onTeamFilterChange}
        onStatusFilterChange={onStatusFilterChange}
        onSortByChange={onSortByChange}
      />
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={onRetry} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={(
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          )}
          message="暂无比赛数据"
        />
      ) : (
        <div className="matchesLayout">
          <div className="matchesList">
            {matches.map((match) => <MatchCard key={match.id} match={match} onMatchClick={onMatchClick} onPlayerClick={onPlayerClick} />)}
            {total > limit && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}
          </div>
          <MatchSidebar upcomingMatches={upcomingMatches} matchStats={matchStats} />
        </div>
      )}
    </>
  );
};

