import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchPredictionMatches,
} from '../api/predictions';
import type { PredictionMatch } from '../api/predictions';
import { fetchSeasons } from '../api/seasons';
import type { Season } from '../api/seasons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PredictionNavTabs from '../components/Predictions/PredictionNavTabs';
import './pages.css';

const Predictions: React.FC = () => {
  const [matches, setMatches] = useState<PredictionMatch[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const list = await fetchSeasons();
        setSeasons(list);
        const active = list.find((s) => s.status === 'active');
        if (active) setSelectedSeasonId(active.id);
      } catch {
        // ignore
      }
    };
    loadSeasons();
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchPredictionMatches(selectedSeasonId || undefined);
      setMatches(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const getMatchStageLabel = (match: PredictionMatch) => {
    if (match.stage === 'KNOCKOUT') {
      return match.knockoutRound ? `淘汰赛 · ${match.knockoutRound}` : '淘汰赛';
    }
    if (match.stage === 'GROUP') {
      return match.groupName ? `小组赛 · ${match.groupName}组` : '小组赛';
    }
    return '联赛阶段';
  };

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer predictionsLocked">
          <PredictionNavTabs activeTab="predictions" />
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
                      {s.name} {s.status === 'active' ? '(当前)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="noticeBanner">
            <span className="noticeBadge">助威规则说明</span>
            <ul className="noticeRules">
              <li>仅供校园娱乐互动，使用站内虚拟积分</li>
              <li>比赛开始前 5 分钟停止助威/修改</li>
              <li>淘汰赛按常规时间比分结算（不含加时赛及点球大战）</li>
            </ul>
          </div>

          <div className="loginNotice disabledNotice">
            <p>🚧 功能暂未开放，预计新生杯正式投入使用，敬请期待！</p>
          </div>

          {loading ? (
            <div className="loadingContainer">加载比赛列表中...</div>
          ) : matches.length === 0 ? (
            <div className="emptyContainer">暂无相关比赛数据</div>
          ) : (
            <div className="matchCardsGrid">
              {matches.map((match) => {
                const matchTime = new Date(match.matchDate).toLocaleString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const userChoice = match.userPrediction?.choice;
                const isClosed = match.isClosed;
                const status = match.status;

                return (
                  <div
                    key={match.id}
                    className={`predictionCard ${isClosed ? 'closedCard' : ''} lockedCard`}
                  >
                    <div className="cardTop">
                      <span className="stageTag">{getMatchStageLabel(match)}</span>
                      <span className="locationTag">{match.location || '待定场地'}</span>
                      <span className="timeTag">{matchTime}</span>
                    </div>

                    <div className="teamsVsRow">
                      <div className="teamCol home">
                        {match.homeTeam.teamLogo ? (
                          <img
                            src={match.homeTeam.teamLogo}
                            alt={match.homeTeam.teamName}
                            className="teamLogo"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="teamLogoPlaceholder">
                            {match.homeTeam.teamName[0]}
                          </div>
                        )}
                        <span className="teamName">{match.homeTeam.teamName}</span>
                      </div>

                      <div className="scoreCol">
                        {status === 'finished' || status === 'completed' ? (
                          <div className="matchScoreDisplay">
                            <span>{match.homeScore}</span>
                            <span className="scoreDivider">:</span>
                            <span>{match.awayScore}</span>
                          </div>
                        ) : (
                          <div className="vsTag">VS</div>
                        )}
                        <span className="statusText">
                          {status === 'finished' || status === 'completed'
                            ? '已完赛'
                            : status === 'ongoing' || status === 'in_progress'
                              ? '比赛中'
                              : isClosed
                                ? '助威已截止'
                                : '开放助威中'}
                        </span>
                      </div>

                      <div className="teamCol away">
                        {match.awayTeam.teamLogo ? (
                          <img
                            src={match.awayTeam.teamLogo}
                            alt={match.awayTeam.teamName}
                            className="teamLogo"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="teamLogoPlaceholder">
                            {match.awayTeam.teamName[0]}
                          </div>
                        )}
                        <span className="teamName">{match.awayTeam.teamName}</span>
                      </div>
                    </div>

                    <div className="predictionChoiceSection">
                      <div className="choiceTitle">
                        <span>胜平负预测</span>
                        {isClosed && (
                          <span className="closedNotice">
                            {match.userPrediction ? '结果锁定' : '已停止预测'}
                          </span>
                        )}
                      </div>

                      <div className="choiceButtons">
                        <button
                          type="button"
                          disabled
                          className={`choiceBtn ${
                            userChoice === 'HOME_WIN' ? 'selected' : ''
                          }`}
                        >
                          <span className="choiceText">
                            {match.homeTeam.teamName} 胜
                          </span>
                          <span className="choiceBadge">主胜</span>
                        </button>

                        <button
                          type="button"
                          disabled
                          className={`choiceBtn ${
                            userChoice === 'DRAW' ? 'selected' : ''
                          }`}
                        >
                          <span className="choiceText">打 平</span>
                          <span className="choiceBadge">平局</span>
                        </button>

                        <button
                          type="button"
                          disabled
                          className={`choiceBtn ${
                            userChoice === 'AWAY_WIN' ? 'selected' : ''
                          }`}
                        >
                          <span className="choiceText">
                            {match.awayTeam.teamName} 胜
                          </span>
                          <span className="choiceBadge">客胜</span>
                        </button>
                      </div>
                    </div>

                    {match.userPrediction && (
                      <div className="myChoiceStatusFooter">
                        <span className="userSelectedInfo">
                          已选：
                          <strong>
                            {userChoice === 'HOME_WIN'
                              ? `${match.homeTeam.teamName} 胜`
                              : userChoice === 'DRAW'
                                ? '打平'
                                : `${match.awayTeam.teamName} 胜`}
                          </strong>
                        </span>
                        {match.userPrediction.status === 'CORRECT' && (
                          <span className="resultPointsBadge success">
                            猜中 +3分
                          </span>
                        )}
                        {match.userPrediction.status === 'WRONG' && (
                          <span className="resultPointsBadge wrong">
                            猜错 +0分
                          </span>
                        )}
                        {match.userPrediction.status === 'PENDING' && (
                          <span className="resultPointsBadge pending">
                            待结算
                          </span>
                        )}
                        {match.userPrediction.status === 'VOID' && (
                          <span className="resultPointsBadge void">
                            比赛作废
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Predictions;
