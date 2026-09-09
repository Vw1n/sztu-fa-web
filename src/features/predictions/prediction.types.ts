import type {
  PredictionMatch,
  PredictionChoice,
  PredictionStatus,
} from '../../api/predictions';

export type { PredictionMatch, PredictionChoice, PredictionStatus };

/** 比赛阶段标签（对应原 getMatchStageLabel 输出） */
export type MatchStageLabel = string;

/** 比赛展示时的状态语义（不同于 status 字段） */
export type MatchDisplayStatus =
  | 'completed'    // 已完赛
  | 'in_progress'  // 比赛中
  | 'closed'       // 助威截止，未开始
  | 'open';        // 开放助威中

/** 比赛展示状态标签 */
export type MatchStatusLabel =
  | '已完赛'
  | '比赛中'
  | '助威已截止'
  | '开放助威中';

/** 用户选择文案（例如 "主队 胜" / "打平" / "客队 胜"） */
export interface ChoiceLabels {
  homeWin: string;   // 主胜
  draw: string;      // 平局
  awayWin: string;   // 客胜
  /** 完整带球队名："XX队 胜" / "打平" / "YY队 胜" */
  fullHome: string;
  fullAway: string;
}

/** 单场状态文案（已选底部展示） */
export interface UserPredictionSummary {
  choiceText: string;           // "打平" 或 "XX队 胜"
  points?: { label: string; variant: 'success' | 'wrong' | 'pending' | 'void' } | null;
}

/** 列表四态（页面统一使用） */
export type PredictionPagePhase = 'loading' | 'error' | 'empty' | 'ready';

/** Season 的精简 DTO（仅保留页面使用字段，避免耦合 Season 完整类型） */
export interface PredictionSeasonOption {
  id: string;
  name: string;
  active: boolean;
}
