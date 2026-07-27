import React from 'react';
import type { Match } from '../../../types';

interface MatchSidebarProps {
  upcomingMatches?: Match[];
  matchStats: { total: number; completed: number; scheduled: number; ongoing: number };
}

export const MatchSidebar: React.FC<MatchSidebarProps> = ({ matchStats }) => (
  <div className="matchesSidebar">
    <div className="statsSection">
      <h3 className="sectionTitleSmall">赛事统计</h3>
      <div className="statsGrid">
        <div className="statCard"><span className="statValue">{matchStats.total}</span><span className="statLabel">总比赛数</span></div>
        <div className="statCard"><span className="statValue">{matchStats.completed}</span><span className="statLabel">已结束</span></div>
        <div className="statCard"><span className="statValue">{matchStats.scheduled}</span><span className="statLabel">即将开始</span></div>
        <div className="statCard"><span className="statValue">{matchStats.ongoing}</span><span className="statLabel">进行中</span></div>
      </div>
    </div>
  </div>
);
