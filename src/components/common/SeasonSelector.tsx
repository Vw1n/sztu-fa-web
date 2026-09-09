import React from 'react';
import type { Season } from '../../types';

interface SeasonSelectorProps {
  seasons: Season[];
  selectedSeasonId: string;
  onChange: (seasonId: string) => void;
  includeAllOption?: boolean;
  allOptionLabel?: string;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  seasons,
  selectedSeasonId,
  onChange,
  includeAllOption = false,
  allOptionLabel = '全部赛季 (All Seasons)',
}) => (
  <select
    value={selectedSeasonId}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '6px',
      padding: '6px 12px',
      height: '38px',
      outline: 'none',
      cursor: 'pointer',
      flex: '0 0 auto',
      width: 'auto',
    }}
  >
    {includeAllOption && <option value="all">{allOptionLabel}</option>}
    {seasons.map((s) => (
      <option key={s.id} value={s.id}>
        {s.name} {s.status === 'active' ? '(当前活跃)' : ''}
      </option>
    ))}
  </select>
);
