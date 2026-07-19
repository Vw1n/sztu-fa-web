import React from 'react';
import type { Match, Team } from '../../../types';
import type { SortOption, StatusFilter } from '../types';
import { MatchCard } from './MatchCard';
import { MatchFilters } from './MatchFilters';
import { MatchPagination } from './MatchPagination';
import { MatchSidebar } from './MatchSidebar';

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
}

export const MatchList: React.FC<MatchListProps> = ({
  matches, loading, error, teamFilter, statusFilter, sortBy, availableTeams,
  currentPage, limit, total, matchStats, upcomingMatches,
  onTeamFilterChange, onStatusFilterChange, onSortByChange,
  onPageChange, onMatchClick, onPlayerClick,
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
      {error && (
        <div className="errorMessage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
      {loading ? (
        <div className="loadingContainer"><div className="loadingSpinner" /><p>加载中...</p></div>
      ) : matches.length === 0 ? (
        <div className="emptyState">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
          <p>暂无比赛数据</p>
        </div>
      ) : (
        <div className="matchesLayout">
          <div className="matchesList">
            {matches.map((match) => <MatchCard key={match.id} match={match} onMatchClick={onMatchClick} onPlayerClick={onPlayerClick} />)}
            {total > limit && <MatchPagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />}
          </div>
          <MatchSidebar upcomingMatches={upcomingMatches} matchStats={matchStats} />
        </div>
      )}
    </>
  );
};
