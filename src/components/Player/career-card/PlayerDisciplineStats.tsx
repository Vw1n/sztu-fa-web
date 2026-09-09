import React from 'react';
import type { PlayerDisciplineStatsProps } from './player-career-card.types';

/**
 * 红黄牌统计格子（1个格子，不含外层 grid 容器）
 * 只接收红黄牌数值，与 PlayerCareerStats 共同放入父级 cc-stats-grid
 */
export const PlayerDisciplineStats: React.FC<PlayerDisciplineStatsProps> = ({
  totalYellow,
  totalRed,
}) => {
  return (
    <div className="cc-stat-tile">
      <div className="cc-stat-value cc-stat-value--discipline">
        <span>🟨{totalYellow}</span>
        <span>🟥{totalRed}</span>
      </div>
      <div className="cc-stat-label">
        红黄牌
      </div>
    </div>
  );
};
