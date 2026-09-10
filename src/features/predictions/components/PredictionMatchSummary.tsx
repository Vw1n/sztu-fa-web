/**
 * PredictionMatchSummary — 单场助威摘要卡
 *
 * 纯展示组件：通过 formatter 派生所有文字，不内联 if/else。
 * 桌面/移动共用同一份卡片结构，通过 CSS class 控制外观差异。
 */

import React from 'react';
import type { PredictionMatch, PredictionChoice } from '../../../api/predictions';
import {
  getMatchStageLabel,
  formatMatchTime,
  resolveMatchDisplayStatus,
  getMatchStatusLabel,
  getChoiceLabels,
  getUserPredictionSummary,
} from '../prediction-formatters';
import type { MatchDisplayStatus } from '../prediction.types';

export interface PredictionMatchSummaryProps {
  match: PredictionMatch;
  /** 选择回调 */
  onChoice?: (matchId: string, choice: PredictionChoice) => void;
  /** 提交中状态 */
  submitting?: boolean;
}

export const PredictionMatchSummary: React.FC<PredictionMatchSummaryProps> = ({
  match,
  onChoice,
  submitting = false,
}) => {
  const stageLabel = getMatchStageLabel(match);
  const matchTime = formatMatchTime(match.matchDate);
  const displayStatus: MatchDisplayStatus = resolveMatchDisplayStatus(match);
  const statusLabel = getMatchStatusLabel(displayStatus);
  const isFinished = displayStatus === 'completed';
  const isClosed = match.isClosed;
  const userChoice = match.userPrediction?.choice;
  const choiceLabels = getChoiceLabels(match);
  const summary = getUserPredictionSummary(match);
  const btnDisabled = isClosed || submitting;

  return (
    <div className={`predictionCard ${isClosed ? 'closedCard' : ''}`}>
      {/* 顶部：阶段 + 场地 + 时间 */}
      <div className="cardTop">
        <span className="stageTag">{stageLabel}</span>
        <span className="locationTag">{match.location || '待定场地'}</span>
        <span className="timeTag">{matchTime}</span>
      </div>

      {/* 中部：两队 VS + 比分/状态 */}
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
          {isFinished ? (
            <div className="matchScoreDisplay">
              <span>{match.homeScore}</span>
              <span className="scoreDivider">:</span>
              <span>{match.awayScore}</span>
            </div>
          ) : (
            <div className="vsTag">VS</div>
          )}
          <span className="statusText">{statusLabel}</span>
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

      {/* 选项区 */}
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
            disabled={btnDisabled}
            className={`choiceBtn ${userChoice === 'HOME_WIN' ? 'selected' : ''}`}
            onClick={() => onChoice?.(match.id, 'HOME_WIN')}
          >
            <span className="choiceText">{choiceLabels.fullHome}</span>
            <span className="choiceBadge">{choiceLabels.homeWin}</span>
          </button>

          <button
            type="button"
            disabled={btnDisabled}
            className={`choiceBtn ${userChoice === 'DRAW' ? 'selected' : ''}`}
            onClick={() => onChoice?.(match.id, 'DRAW')}
          >
            <span className="choiceText">打 平</span>
            <span className="choiceBadge">{choiceLabels.draw}</span>
          </button>

          <button
            type="button"
            disabled={btnDisabled}
            className={`choiceBtn ${userChoice === 'AWAY_WIN' ? 'selected' : ''}`}
            onClick={() => onChoice?.(match.id, 'AWAY_WIN')}
          >
            <span className="choiceText">{choiceLabels.fullAway}</span>
            <span className="choiceBadge">{choiceLabels.awayWin}</span>
          </button>
        </div>
      </div>

      {/* 底部：用户已选 + 积分徽章 */}
      {summary && (
        <div className="myChoiceStatusFooter">
          <span className="userSelectedInfo">
            已选：<strong>{summary.choiceText}</strong>
          </span>
          {summary.points && (
            <span className={`resultPointsBadge ${summary.points.variant}`}>
              {summary.points.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
