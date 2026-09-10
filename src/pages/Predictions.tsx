import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { submitPredictionApi } from '../api/predictions';
import type { PredictionChoice } from '../api/predictions';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PredictionNavTabs from '../components/Predictions/PredictionNavTabs';
import { usePredictionSeason } from '../features/predictions/hooks/usePredictionSeason';
import { usePredictionMatches } from '../features/predictions/hooks/usePredictionMatches';
import { PredictionPageState } from '../features/predictions/components/PredictionPageState';
import { PredictionMatchSummary } from '../features/predictions/components/PredictionMatchSummary';
import './pages.css';

const Predictions: React.FC = () => {
  const { seasons, selectedSeasonId, setSelectedSeasonId, loadingSeasons } = usePredictionSeason();
  const { matches, phase, error, reload, updateMatchPrediction } = usePredictionMatches(selectedSeasonId);
  const { user, isAuthenticated } = useAuth();

  const [submittingMatchId, setSubmittingMatchId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChoice = useCallback(async (matchId: string, choice: PredictionChoice) => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: '请先登录账号再进行助威提交' });
      return;
    }
    if (user?.role !== 'user') {
      setMessage({ type: 'error', text: '管理账号不参与助威' });
      return;
    }
    if (!user?.studentId) {
      setMessage({ type: 'error', text: '您的账号未绑定学号，请先去绑定学号' });
      return;
    }

    try {
      setSubmittingMatchId(matchId);
      setMessage(null);
      await submitPredictionApi(matchId, choice);
      setMessage({ type: 'success', text: '助威提交成功！开赛前可随时修改选择。' });
      updateMatchPrediction(matchId, choice);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '助威提交失败';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSubmittingMatchId(null);
    }
  }, [isAuthenticated, user, updateMatchPrediction]);

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
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
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
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

          {/* 未登录提示 */}
          {!isAuthenticated && (
            <div className="loginNotice">
              <p>您尚未登录账号。登录并绑定真实学号后即可参加比赛胜负预测。</p>
              <div className="noticeActions">
                <Link to="/login" className="actionBtn primary">
                  立即登录
                </Link>
                <Link to="/register" className="actionBtn secondary">
                  注册绑定学号
                </Link>
              </div>
            </div>
          )}

          {/* 未绑定学号提示 */}
          {isAuthenticated && user?.role === 'user' && !user.studentId && (
            <div className="loginNotice warning">
              <p>您的账号尚未绑定学号，暂无法提交助威。请联系管理员完成学号绑定核验。</p>
            </div>
          )}

          {/* Toast 消息 */}
          {message && (
            <div className={`toastMessage ${message.type}`}>
              {message.text}
              <button
                type="button"
                className="closeToast"
                onClick={() => setMessage(null)}
              >
                ×
              </button>
            </div>
          )}

          {/* 四态列表 */}
          <PredictionPageState
            phase={loadingSeasons ? 'loading' : phase}
            error={error}
            onRetry={reload}
          >
            <div className="matchCardsGrid">
              {matches.map((match) => (
                <PredictionMatchSummary
                  key={match.id}
                  match={match}
                  onChoice={handleChoice}
                  submitting={submittingMatchId === match.id}
                />
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
