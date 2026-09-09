import React from 'react';
import type { PlayerCareerStatsProps } from './player-career-card.types';

/**
 * 轻量统计格子：纯展示，只接收 label/value/颜色修饰符
 * 不感知 CareerData 全对象
 */
interface StatTileProps {
  value: React.ReactNode;
  label: string;
  valueClassName?: string;
}

const StatTile: React.FC<StatTileProps> = ({ value, label, valueClassName }) => (
  <div className="cc-stat-tile">
    <div className={valueClassName ? `cc-stat-value ${valueClassName}` : 'cc-stat-value'}>
      {value}
    </div>
    <div className="cc-stat-label">
      {label}
    </div>
  </div>
);

/**
 * 主统计：出场/进球/助攻（3个格子，不含外层 grid 容器）
 * 只接收数值 DTO，不感知完整 CareerData
 * 与 PlayerDisciplineStats 共同放入父级 cc-stats-grid 中形成4列布局
 */
export const PlayerCareerStats: React.FC<PlayerCareerStatsProps> = ({
  totalMatches,
  totalGoals,
  totalAssists,
}) => {
  return (
    <>
      <StatTile value={totalMatches} label="出场数" />
      <StatTile value={totalGoals} label="总进球" valueClassName="cc-stat-value--goals" />
      <StatTile value={totalAssists} label="总助攻" valueClassName="cc-stat-value--assists" />
    </>
  );
};
