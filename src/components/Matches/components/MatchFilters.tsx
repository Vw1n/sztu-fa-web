import React from 'react';
import type { Team } from '../../../types';
import type { SortOption, StatusFilter } from '../types';

interface MatchFiltersProps {
  teamFilter: string;
  statusFilter: StatusFilter;
  sortBy: SortOption;
  availableTeams: Team[];
  onTeamFilterChange: (teamId: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onSortByChange: (sortBy: SortOption) => void;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  teamFilter, statusFilter, sortBy, availableTeams,
  onTeamFilterChange, onStatusFilterChange, onSortByChange,
}) => (
  <div className="matches-filter-bar">
    <div className="filter-item-wrapper">
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>🛡️ 筛选球队</span>
      <select value={teamFilter} onChange={(event) => onTeamFilterChange(event.target.value)} className="filter-select">
        <option value="">全部球队</option>
        {availableTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}
      </select>
    </div>
    <div className="filter-item-wrapper">
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>⏳ 比赛状态</span>
      <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)} className="filter-select">
        <option value="all">全部比赛</option><option value="scheduled">即将开始</option>
        <option value="in_progress">进行中</option><option value="completed">已结束</option>
      </select>
    </div>
    <div className="filter-item-wrapper">
      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>🔃 排序方式</span>
      <select value={sortBy} onChange={(event) => onSortByChange(event.target.value as SortOption)} className="filter-select">
        <option value="date-desc">按时间 (从近到远)</option><option value="date-asc">按时间 (从远到近)</option>
        <option value="score-desc">按总比分 (从大到小)</option><option value="score-asc">按总比分 (从小到大)</option>
      </select>
    </div>
  </div>
);
