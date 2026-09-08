import React from 'react';
import { LoadingSpinner } from '../../common';
import type { Match } from '../../../types';
import { buildBracketModel } from '../bracket/bracket-model';
import { DesktopBracketLayout } from '../bracket/DesktopBracketLayout';
import { MobileBracketLayout } from '../bracket/MobileBracketLayout';

interface KnockoutBracketProps {
  bracketMatches: Match[];
  bracketLoading: boolean;
  onMatchClick: (match: Match) => void;
}

/**
 * KnockoutBracket 薄门面：
 *   - 仅负责 loading / 非 loading 分支；
 *   - 将比赛数组交给 buildBracketModel（纯函数）推导模型；
 *   - 分别渲染桌面布局 & 移动布局（两者通过 CSS 媒体查询切换显示）；
 *   - 不再内联任何对阵推导、轮次匹配或胜者判断逻辑。
 */
export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  bracketMatches,
  bracketLoading,
  onMatchClick,
}) => {
  if (bracketLoading) {
    return (
      <div className="bracketSection">
        <LoadingSpinner message="正在加载对阵图..." />
      </div>
    );
  }

  const model = buildBracketModel(bracketMatches);

  return (
    <div className="bracketSection">
      <div className="bracketWrapper">
        {/* 桌面端布局（横向 bracket 或 竖向无QF 布局，内部按 hasQF 切换） */}
        <DesktopBracketLayout model={model} onMatchClick={onMatchClick} />
        {/* 移动端布局（内部按 hasQF 切换） */}
        <MobileBracketLayout model={model} onMatchClick={onMatchClick} />
      </div>
    </div>
  );
};

export default KnockoutBracket;
