import type { Match } from '../../../types';

/** 对阵图槽位：单场比赛的占位数据 */
export interface BracketSlot {
  /** 规范化轮次名，如 'R16' | 'QF' | 'SF' | 'F' | '3RD' */
  round: BracketRoundKey;
  /** 该轮中的索引（从 1 开始） */
  index: number;
  /** 匹配到的比赛，未产生则为 null */
  match: Match | null;
}

/** 规范化轮次名 */
export type BracketRoundKey = 'R16' | 'QF' | 'SF' | 'F' | '3RD';

/** 对阵图模型：纯数据结构，不含 CSS class、媒体查询或 DOM */
export interface BracketModel {
  roundOf16: BracketSlot[];       // 1/8 决赛，8 场
  quarterFinals: BracketSlot[];   // 1/4 决赛，4 场
  semiFinals: BracketSlot[];      // 半决赛，2 场
  thirdPlace: BracketSlot | null; // 三四名决赛（可选）
  final: BracketSlot | null;      // 决赛
  /** 是否存在 1/4 决赛数据（决定桌面/移动使用哪种布局） */
  hasQuarterFinals: boolean;
  /** 是否存在 1/8 决赛数据 */
  hasRoundOf16: boolean;
  /** 冠军队伍信息（决赛完赛时才有），未产生为 null */
  champion: { teamName: string; teamLogo?: string | null } | null;
}

/** 侧别：用于为卡片附加左右对齐 class */
export type BracketSide = 'left' | 'right' | 'center';

/**
 * 纯函数：根据 (round, index) 判定卡片在桌面端的左右侧别。
 * 不含 React / DOM / 媒体查询，可供布局组件复用。
 */
export function resolveBracketSide(
  round: BracketRoundKey,
  index: number,
): BracketSide {
  switch (round) {
    case 'R16':
      return index <= 4 ? 'left' : 'right';
    case 'QF':
      return index <= 2 ? 'left' : 'right';
    case 'SF':
      return index === 1 ? 'left' : 'right';
    case 'F':
    case '3RD':
    default:
      return 'center';
  }
}
