import React from 'react';
import type { PlayerCareerHeaderProps } from './player-career-card.types';

/**
 * 球员卡头部：头像、球衣号、姓名、球队、停赛标签
 * 纯展示组件，只接收最小 props，不感知完整 CareerData
 */
export const PlayerCareerHeader: React.FC<PlayerCareerHeaderProps> = ({
  photo,
  jerseyNumber,
  playerName,
  teamName,
  status,
}) => {
  return (
    <div className="cc-header">
      {photo ? (
        <div className="cc-avatar">
          <img
            src={photo}
            alt={playerName}
            className="cc-avatar-img"
          />
        </div>
      ) : (
        <div className="cc-avatar-fallback">
          {jerseyNumber || '#'}
        </div>
      )}
      <div className="cc-header-info">
        <h3 className="cc-player-name">
          {playerName}
        </h3>
        <p className="cc-team-info">
          <span>🛡️</span> <span>{teamName || '暂无队伍'}</span>
          {status === 'suspended' && (
            <span className="cc-suspended-badge">
              🛑 停赛中
            </span>
          )}
        </p>
      </div>
    </div>
  );
};
