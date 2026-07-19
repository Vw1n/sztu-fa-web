import React from 'react';
import type { Match } from '../../../types';

interface MatchSidebarProps {
  upcomingMatches: Match[];
  matchStats: { total: number; completed: number; scheduled: number; ongoing: number };
}

export const MatchSidebar: React.FC<MatchSidebarProps> = ({ upcomingMatches, matchStats }) => (
  <div className="matchesSidebar">
    <div className="upcomingSection">
      <h3 className="sectionTitleSmall">即将开始</h3>
      {upcomingMatches.length > 0 ? (
        <div className="upcomingList">
          {upcomingMatches.map((match) => (
            <div key={match.id} className="upcomingItem">
              <div className="upcomingDate">
                <span className="upcomingDay">{new Date(match.matchDate).getDate()}</span>
                <span className="upcomingMonth">{new Date(match.matchDate).toLocaleDateString('zh-CN', { month: 'short' })}</span>
              </div>
              <div className="upcomingInfo">
                <div className="upcomingTeams">{match.homeTeam.teamName} vs {match.awayTeam.teamName}</div>
                <div className="upcomingTime">{new Date(match.matchDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="emptyUpcoming"><p>暂无即将开始的比赛</p></div>}
    </div>
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
