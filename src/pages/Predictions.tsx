import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PredictionNavTabs from '../components/Predictions/PredictionNavTabs';
import { usePredictionSeason } from '../features/predictions/hooks/usePredictionSeason';
import { usePredictionMatches } from '../features/predictions/hooks/usePredictionMatches';
import { PredictionPageState } from '../features/predictions/components/PredictionPageState';
import { PredictionMatchSummary } from '../features/predictions/components/PredictionMatchSummary';
import './pages.css';

const Predictions: React.FC = () => {
  const { seasons, selectedSeasonId, loadingSeasons } = usePredictionSeason();
  const { matches, phase, error, reload } = usePredictionMatches(selectedSeasonId);

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer predictionsLocked">
          <PredictionNavTabs activeTab="predictions" />

          {/* 标题 + 赛季选择器 */}
          <div className="pageHeader">
            <div>
              <h1 className="pageTitle">助威中心</h1>
              <p className="pageSubtitle">
                预测比赛胜平负结果，猜中即得 3 积分！冲刺当前赛季与历史排行榜榜首。
              </p>
            </div>
            {seasons.length > 0 && (
              <div className="filterBox">
                <label htmlFor="seasonFilter">选择赛季：</label>
                <select
                  id="seasonFilter"
                  value={selectedSeasonId}
                  disabled
                  className="seasonSelect"
                >
                  <option value="">全部赛季</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.active ? '(当前)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 规则说明 */}
          <div className="noticeBanner">
            <span className="noticeBadge">助威规则说明</span>
            <ul className="noticeRules">
              <li>仅供校园娱乐互动，使用站内虚拟积分</li>
              <li>比赛开始前 5 分钟停止助威/修改</li>
              <li>淘汰赛按常规时间比分结算（不含加时赛及点球大战）</li>
            </ul>
          </div>

          {/* 功能未开放 banner */}
          <div className="loginNotice disabledNotice">
            <p>🚧 功能暂未开放，预计新生杯正式投入使用，敬请期待！</p>
          </div>

          {/* 四态列表 */}
          <PredictionPageState
            phase={loadingSeasons ? 'loading' : phase}
            error={error}
            onRetry={reload}
          >
            <div className="matchCardsGrid">
              {matches.map((match) => (
                <PredictionMatchSummary key={match.id} match={match} locked />
              ))}
            </div>
          </PredictionPageState>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Predictions;
