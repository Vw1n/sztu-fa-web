import React from 'react';
import type { CareerData } from '../../Matches/utils/matchData';
import './player-career-card.css';
import { PlayerCareerHeader } from './PlayerCareerHeader';
import { PlayerSeasonHistory } from './PlayerSeasonHistory';
import { PlayerCareerStats } from './PlayerCareerStats';
import { PlayerDisciplineStats } from './PlayerDisciplineStats';

interface PlayerCareerCardProps {
  careerPlayerId: string | null;
  careerPlayerName: string;
  careerData: CareerData | null;
  careerLoading: boolean;
  onClose: () => void;
}

/**
 * 球员生涯卡主组件（兼容门面）
 * 只负责：Modal 容器组合、loading/empty 分支、关闭事件
 * 所有展示细节委托给子组件
 * 对外 props 保持不变，调用方无需修改
 */
export const PlayerCareerCard: React.FC<PlayerCareerCardProps> = ({ careerPlayerId, careerPlayerName, careerData, careerLoading, onClose }) => {
  if (!careerPlayerId) return null;

  return (
    <div className="matchModalOverlay cc-overlay" onClick={onClose}>
      <div
        className="matchModal careerCardModal cc-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="matchModalClose" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {careerLoading ? (
          <div className="cc-loading">
            <div className="loadingSpinner cc-loading-spinner"></div>
            <p className="cc-loading-text">正在生成赛季球星卡...</p>
          </div>
        ) : careerData ? (
          <div className="cc-content">
            {/* 球星卡顶部个人信息 */}
            <PlayerCareerHeader
              photo={careerData.photo}
              jerseyNumber={careerData.jerseyNumber}
              playerName={careerPlayerName}
              teamName={careerData.teamName}
              status={careerData.status}
            />

            {/* 当前赛季统计面板 */}
            <div className="cc-stats-grid">
              <PlayerCareerStats
                totalMatches={careerData.summary.totalMatches}
                totalGoals={careerData.summary.totalGoals}
                totalAssists={careerData.summary.totalAssists}
              />
              <PlayerDisciplineStats
                totalYellow={careerData.summary.totalYellow}
                totalRed={careerData.summary.totalRed}
              />
            </div>

            {/* 当前赛季明细 */}
            <PlayerSeasonHistory seasons={careerData.seasons} />
          </div>
        ) : (
          <div className="cc-empty">无法加载赛季数据</div>
        )}
      </div>
    </div>
  );
};
