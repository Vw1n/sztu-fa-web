import type { Season } from '../../types';
import { SeasonSelector, RefreshButton } from '../common';

interface TeamFiltersProps {
  globalSeasons: Season[];
  globalSeasonId: string;
  searchTerm: string;
  onSeasonChange: (seasonId: string) => void;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onRefresh: () => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
  globalSeasons,
  globalSeasonId,
  searchTerm,
  onSeasonChange,
  onSearchTermChange,
  onSearch,
  onReset,
  onKeyDown,
  onRefresh,
}) => {
  return (
    <>
      {/* 搜索框 */}
      <div className="teamSearch">
        <div className="searchInputWrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索球队名称..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="searchInput"
          />
          {searchTerm && (
            <button onClick={onReset} className="searchClear" aria-label="清除搜索">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button onClick={onSearch} className="searchButton">
          搜索
        </button>
      </div>

      {/* 赛季筛选器 + 刷新按钮同一行 */}
      <div className="filterControls" style={{ display: 'flex', flexWrap: 'nowrap', gap: '30px', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 25px 0', padding: '15px 0', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <SeasonSelector
          seasons={globalSeasons}
          selectedSeasonId={globalSeasonId}
          onChange={onSeasonChange}
          includeAllOption
        />
        <RefreshButton onClick={onRefresh} />
      </div>
    </>
  );
};

export default TeamFilters;
