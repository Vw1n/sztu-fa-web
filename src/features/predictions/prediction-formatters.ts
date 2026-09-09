/**
 * Predictions 页面纯函数模块
 *
 * 不引用 React / 浏览器 API / 外部服务；
 * 所有函数仅根据输入派生展示文案，可安全用于表驱动单测。
 */

import type { PredictionMatch, PredictionChoice, PredictionStatus } from '../../api/predictions';
import type {
  MatchDisplayStatus,
  MatchStageLabel,
  ChoiceLabels,
  UserPredictionSummary,
  PredictionSeasonOption,
} from './prediction.types';
import type { Season } from '../../api/seasons';

/* -------------------------------------------------------------------------- */
/*  比赛阶段标签                                                               */
/* -------------------------------------------------------------------------- */

/**
 * 根据比赛 stage 字段返回阶段标签。
 * - KNOCKOUT + knockoutRound -> "淘汰赛 · QF"
 * - GROUP + groupName         -> "小组赛 · A组"
 * - 其他                       -> "联赛阶段"
 */
export function getMatchStageLabel(match: PredictionMatch): MatchStageLabel {
  if (match.stage === 'KNOCKOUT') {
    return match.knockoutRound
      ? `淘汰赛 · ${match.knockoutRound}`
      : '淘汰赛';
  }
  if (match.stage === 'GROUP') {
    return match.groupName
      ? `小组赛 · ${match.groupName}组`
      : '小组赛';
  }
  return '联赛阶段';
}

/* -------------------------------------------------------------------------- */
/*  时间格式化                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * 将 ISO 时间字符串格式化为 "M/D HH:mm" 形式（zh-CN locale）。
 * 空字符串或无效输入返回 '--'。
 */
export function formatMatchTime(dateStr: string): string {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '--';
  return d.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* -------------------------------------------------------------------------- */
/*  比赛展示状态                                                               */
/* -------------------------------------------------------------------------- */

/**
 * 从 status + isClosed 推导展示语义。
 * 优先级：已完成 → 比赛中 → 已截止 → 开放
 */
export function resolveMatchDisplayStatus(match: PredictionMatch): MatchDisplayStatus {
  const { status, isClosed } = match;

  // 后端可能返回 finished 或 completed
  if (status === 'finished' || status === 'completed') return 'completed';
  // 后端可能返回 ongoing 或 in_progress
  if (status === 'ongoing' || status === 'in_progress') return 'in_progress';
  // 未开始但已截止助威
  if (isClosed) return 'closed';
  // 未开始且可助威
  return 'open';
}

/**
 * 将展示语义转为中文标签。
 */
export function getMatchStatusLabel(display: MatchDisplayStatus): string {
  switch (display) {
    case 'completed':   return '已完赛';
    case 'in_progress': return '比赛中';
    case 'closed':      return '助威已截止';
    case 'open':        return '开放助威中';
  }
}

/* -------------------------------------------------------------------------- */
/*  选项文案                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 返回三选项的简称与完整带球队名文案。
 * 简称用于按钮 badge，完整用于按钮主体文字和底部"已选"展示。
 */
export function getChoiceLabels(match: PredictionMatch): ChoiceLabels {
  const homeName = match.homeTeam?.teamName ?? '主队';
  const awayName = match.awayTeam?.teamName ?? '客队';
  return {
    homeWin: '主胜',
    draw: '平局',
    awayWin: '客胜',
    fullHome: `${homeName} 胜`,
    fullAway: `${awayName} 胜`,
  };
}

/**
 * 根据用户已选 choice 返回底部展示文案。
 * DRAW -> "打平"；HOME_WIN -> "主队 胜"；AWAY_WIN -> "客队 胜"
 */
export function getUserChoiceText(
  choice: PredictionChoice | undefined,
  match: PredictionMatch,
): string {
  const labels = getChoiceLabels(match);
  switch (choice) {
    case 'HOME_WIN': return labels.fullHome;
    case 'DRAW':     return '打平';
    case 'AWAY_WIN': return labels.fullAway;
    default:         return '';
  }
}

/* -------------------------------------------------------------------------- */
/*  积分徽章                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * 根据用户预测状态返回积分徽章文案与样式 variant。
 * 无预测时返回 null。
 */
export function getPointsBadge(
  status: PredictionStatus | undefined,
): { label: string; variant: 'success' | 'wrong' | 'pending' | 'void' } | null {
  switch (status) {
    case 'CORRECT': return { label: '猜中 +3分', variant: 'success' };
    case 'WRONG':   return { label: '猜错 +0分', variant: 'wrong' };
    case 'PENDING': return { label: '待结算',     variant: 'pending' };
    case 'VOID':    return { label: '比赛作废',   variant: 'void' };
    default:        return null;
  }
}

/**
 * 聚合：从单场比赛派生底部"已选 + 积分"信息。
 * 无用户预测时返回 null。
 */
export function getUserPredictionSummary(
  match: PredictionMatch,
): UserPredictionSummary | null {
  const pred = match.userPrediction;
  if (!pred) return null;

  return {
    choiceText: getUserChoiceText(pred.choice, match),
    points: getPointsBadge(pred.status),
  };
}

/* -------------------------------------------------------------------------- */
/*  赛季默认选择                                                               */
/* -------------------------------------------------------------------------- */

/**
 * 将 Season[] 转为页面使用的精简选项。
 */
export function toSeasonOptions(seasons: Season[]): PredictionSeasonOption[] {
  return seasons.map((s) => ({
    id: s.id,
    name: s.name,
    active: s.status === 'active',
  }));
}

/**
 * 从赛季列表中找出默认选中的赛季 ID。
 * 规则：取第一个 status === 'active' 的赛季；无则返回 ''（全部赛季）。
 */
export function getDefaultSeasonId(seasons: Season[]): string {
  const active = seasons.find((s) => s.status === 'active');
  return active ? active.id : '';
}
