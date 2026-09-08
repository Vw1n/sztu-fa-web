import React from 'react';
import type { Match } from '../../../types';
import type { BracketSlot, BracketRoundKey } from './bracket.types';
import { BracketMatchCard } from './BracketMatchCard';

export interface BracketRoundProps {
  /** 本轮展示的槽位 */
  slots: BracketSlot[];
  /** 列头文字，例如 "1/4 决赛"、"半决赛"、"🏆 决赛" */
  headerLabel?: string;
  /** 是否为冠军列头样式（金色） */
  championHeader?: boolean;
  /** 紧凑模式（移动端卡片） */
  compact?: boolean;
  /** 额外包裹 class（列容器的附加样式） */
  className?: string;
  /** 点击比赛卡片 */
  onMatchClick?: (match: Match) => void;
  /** 决赛列专用：传入冠军 & 三四名额外内容，渲染在 matchGroups 内部 */
  centerColumnContent?: React.ReactNode;
}

/**
 * 单轮对阵渲染。
 *
 * - 桌面端：作为 columnHeader + matchGroups 的组合外壳；
 * - 移动端：作为 treeRound 的标签 + 卡片容器外壳；
 * - 桌面中心列（决赛+冠军+三四名）通过 centerColumnContent 注入，
 *   这种情况下 slots 通常仅包含决赛本身（或为空），由调用方组装。
 */
export const BracketRound: React.FC<BracketRoundProps> = ({
  slots,
  headerLabel,
  championHeader = false,
  compact = false,
  className,
  onMatchClick,
  centerColumnContent,
}) => {
  const columnHeaderClass = [
    'columnHeader',
    championHeader ? 'championHeader' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {headerLabel && <div className={columnHeaderClass}>{headerLabel}</div>}
      {centerColumnContent ? (
        <div className="matchGroups">{centerColumnContent}</div>
      ) : (
        <div className="matchGroups">
          {slots.map((slot) => (
            <BracketMatchCard
              key={`${slot.round}-${slot.index}`}
              round={slot.round as BracketRoundKey}
              index={slot.index}
              match={slot.match}
              compact={compact}
              onMatchClick={onMatchClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BracketRound;
