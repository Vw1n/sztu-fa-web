import type { Season } from '../../types';

interface TeamFiltersProps {
  globalSeasons: Season[];
  globalSeasonId: string;
  selectedGender: string;
  searchTerm: string;
  onSeasonChange: (seasonId: string) => void;
  onGenderChange: (gender: string) => void;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const TeamFilters: React.FC<TeamFiltersProps> = ({
  globalSeasons,
  globalSeasonId,
  selectedGender,
  searchTerm,
  onSeasonChange,
  onGenderChange,
  onSearchTermChange,
  onSearch,
  onReset,
  onKeyDown,
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

      {/* 赛季与男女组别筛选器 */}
      <div className="filterControls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', margin: '20px 0 25px 0', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>选择赛季:</span>
          <select
            value={globalSeasonId}
            onChange={(e) => onSeasonChange(e.target.value)}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '6px 12px',
              height: '38px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">全部赛季 (All Seasons)</option>
            {globalSeasons
              .filter((s) => {
                if (selectedGender === 'FEMALE') {
                  return !s.name.includes('男') && !s.name.includes('男子');
                } else if (selectedGender === 'MALE') {
                  return !s.name.includes('女') && !s.name.includes('女子');
                }
                return true;
              })
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === 'active' ? '(当前活跃)' : ''}
                </option>
              ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#1a1a1a', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          {[
            { value: 'all', label: '全部球队' },
            { value: 'MALE', label: "男子组 (Men's)" },
            { value: 'FEMALE', label: "女子组 (Women's)" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onGenderChange(value)}
              style={{
                background: selectedGender === value ? '#1890ff' : 'transparent',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontWeight: selectedGender === value ? 600 : 400
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamFilters;
