import React from 'react';
import type { Match } from '../../../types';
import type { BracketRoundKey, BracketSide } from './bracket.types';
import { resolveBracketSide } from './bracket.types';
import { getPenaltyScore, getWinnerTeamId } from '../utils/matchOutcome';

export interface BracketMatchCardProps {
  /** 比赛数据，为空时渲染"待定"占位卡 */
  match: Match | null | undefined;
  /** 规范化轮次名，用于拼接 CSS 类 */
  round: BracketRoundKey;
  /** 该轮中的索引（从 1 开始），用于占位卡标题"对阵 #N" */
  index: number;
  /** 左右侧别（用于桌面端对齐的 class） */
  side?: BracketSide;
  /** 紧凑模式（移动端使用） */
  compact?: boolean;
  /** 点击卡片回调（有 match 时才可点击） */
  onMatchClick?: (match: Match) => void;
}

/* -------------------------------------------------------------------------- */
/*  BracketMatchCard                                                           */
/* -------------------------------------------------------------------------- */

export const BracketMatchCard: React.FC<BracketMatchCardProps> = ({
  match,
  round,
  index,
  side: sideProp,
  compact = false,
  onMatchClick,
}) => {
  const side = sideProp ?? resolveBracketSide(round, index);

  // ---------- 空占位卡 ----------
  if (!match) {
    const emptyClasses = [
      'bracketMatchCard',
      'emptyCard',
      `bracket-card-${round.toLowerCase()}`,
      `bracket-card-${side}`,
      compact ? 'bracketCardCompact' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return (
      <div className={emptyClasses}>
        <div className="bracketMatchHeader">对阵 #{index}</div>
        <div className="bracketTeamRow">
          <span className="bracketTeamName">待定</span>
          <span className="bracketTeamScore">-</span>
        </div>
        <div className="bracketTeamRow">
          <span className="bracketTeamName">待定</span>
          <span className="bracketTeamScore">-</span>
        </div>
      </div>
    );
  }

  // ---------- 正常比赛卡 ----------
  const winnerTeamId =
    match.status === 'completed' ? getWinnerTeamId(match) : null;
  const isHomeWinner = winnerTeamId === match.homeTeamId;
  const isAwayWinner = winnerTeamId === match.awayTeamId;
  const penaltyScore = getPenaltyScore(match);

  const cardClasses = [
    'bracketMatchCard',
    `bracket-card-${round.toLowerCase()}`,
    `bracket-card-${side}`,
    match.status === 'in_progress' ? 'ongoingMatch' : '',
    match.status === 'completed' ? 'completedMatch' : '',
    compact ? 'bracketCardCompact' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => onMatchClick?.(match);

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="bracketMatchHeader">
        <span>{match.location || '待定'}</span>
        {match.status === 'in_progress' ? (
          <span className="liveBadge">LIVE</span>
        ) : match.status === 'completed' ? (
          <span className="completedBadge">已结束</span>
        ) : (
          <span className="scheduledBadge">未开始</span>
        )}
      </div>
      <div className={`bracketTeamRow ${isHomeWinner ? 'winnerRow' : ''}`}>
        <div className="bracketTeamInfo">
          {match.homeTeam?.teamLogo ? (
            <img
              src={match.homeTeam.teamLogo}
              alt={match.homeTeam.teamName}
              className="bracketTeamLogo"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="bracketLogoPlaceholder">⚽</span>
          )}
          <span className="bracketTeamName">
            {match.homeTeam?.teamName || '待定'}
          </span>
        </div>
        <span className="bracketTeamScore">
          {match.status === 'completed' || match.status === 'in_progress'
            ? match.homeScore
            : '-'}
          {penaltyScore ? ` (${penaltyScore.home})` : ''}
        </span>
      </div>
      <div className={`bracketTeamRow ${isAwayWinner ? 'winnerRow' : ''}`}>
        <div className="bracketTeamInfo">
          {match.awayTeam?.teamLogo ? (
            <img
              src={match.awayTeam.teamLogo}
              alt={match.awayTeam.teamName}
              className="bracketTeamLogo"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="bracketLogoPlaceholder">⚽</span>
          )}
          <span className="bracketTeamName">
            {match.awayTeam?.teamName || '待定'}
          </span>
        </div>
        <span className="bracketTeamScore">
          {match.status === 'completed' || match.status === 'in_progress'
            ? match.awayScore
            : '-'}
          {penaltyScore ? ` (${penaltyScore.away})` : ''}
        </span>
      </div>
      {!compact && (
        <div className="bracketTime">
          {match.matchDate
            ? new Date(match.matchDate).toLocaleDateString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '时间未定'}
        </div>
      )}
    </div>
  );
};

export default BracketMatchCard;
