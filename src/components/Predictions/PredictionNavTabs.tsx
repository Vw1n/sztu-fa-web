import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './PredictionNavTabs.css';

interface PredictionNavTabsProps {
  activeTab?: 'predictions' | 'leaderboard' | 'my-predictions';
}

export const PredictionNavTabs: React.FC<PredictionNavTabsProps> = ({ activeTab }) => {
  const location = useLocation();
  const current =
    activeTab ||
    (location.pathname.startsWith('/leaderboard')
      ? 'leaderboard'
      : location.pathname.startsWith('/my-predictions')
      ? 'my-predictions'
      : 'predictions');

  return (
    <div className="predictionCenterNav" role="navigation" aria-label="竞猜中心子导航">
      <div className="predictionCenterNavInner">
        <Link
          to="/predictions"
          className={`predictionCenterTab ${current === 'predictions' ? 'active' : ''}`}
        >
          <span className="tabIcon" aria-hidden="true">🎯</span>
          <span>竞猜大厅</span>
        </Link>
        <Link
          to="/leaderboard"
          className={`predictionCenterTab ${current === 'leaderboard' ? 'active' : ''}`}
        >
          <span className="tabIcon" aria-hidden="true">🏆</span>
          <span>排行榜</span>
        </Link>
        <Link
          to="/my-predictions"
          className={`predictionCenterTab ${current === 'my-predictions' ? 'active' : ''}`}
        >
          <span className="tabIcon" aria-hidden="true">👤</span>
          <span>我的竞猜</span>
        </Link>
      </div>
    </div>
  );
};

export default PredictionNavTabs;
