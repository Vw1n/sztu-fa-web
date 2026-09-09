import React from 'react';
import type { Match } from '../../../types';
import type { BracketModel, BracketSlot } from './bracket.types';
import { BracketMatchCard } from './BracketMatchCard';
import { ChampionCard } from './DesktopBracketLayout';

export interface MobileBracketLayoutProps {
  model: BracketModel;
  onMatchClick: (match: Match) => void;
}

/* ---------- 辅助：紧凑卡片渲染（直接复用 BracketMatchCard，compact=true） ---------- */

const CompactMatch: React.FC<{
  slot: BracketSlot | null | undefined;
  onMatchClick: (match: Match) => void;
}> = ({ slot, onMatchClick }) => {
  if (!slot) return null;
  return (
    <BracketMatchCard
      round={slot.round}
      index={slot.index}
      match={slot.match}
      compact
      onMatchClick={onMatchClick}
    />
  );
};

/* ============================================================
 *  移动端：上下半区纵向对阵图（有 1/4 决赛）
 *
 *    上半区：QF1、QF2 → SF1 → Final + 冠军
 *    下半区：Final + 冠军 → SF2 → QF3、QF4
 *    （中间插入 三四名）
 * ============================================================ */

const MobileVerticalWithQF: React.FC<MobileBracketLayoutProps> = ({
  model,
  onMatchClick,
}) => {
  const { quarterFinals, semiFinals, final, thirdPlace, champion } = model;
  const [qf1, qf2, qf3, qf4] = quarterFinals;
  const [sf1, sf2] = semiFinals;

  return (
    <div className="bracketTreeMobile">
      {/* 上半区：QF1、QF2 */}
      {model.hasQuarterFinals && (
        <div className="treeRound">
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#1a1a2e',
              padding: '10px 0 6px',
              letterSpacing: 1,
            }}
          >
            1/4 决赛
          </div>
          <div className="treePair">
            <div className="treeMatchCell">
              <CompactMatch slot={qf1} onMatchClick={onMatchClick} />
            </div>
            <div className="treeMatchCell">
              <CompactMatch slot={qf2} onMatchClick={onMatchClick} />
            </div>
          </div>
        </div>
      )}

      {/* SF1 */}
      <div className="treeRound">
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#1a1a2e',
            padding: '10px 0 6px',
            letterSpacing: 1,
          }}
        >
          半决赛
        </div>
        <div className="treeSingle">
          <div className="treeMatchCell">
            <CompactMatch slot={sf1} onMatchClick={onMatchClick} />
          </div>
        </div>
      </div>

      {/* Final + 冠军 并排 */}
      <div className="treeRound">
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#fbbf24',
            padding: '10px 0 6px',
            letterSpacing: 1,
          }}
        >
          🏆 决赛
        </div>
        <div className="treePair">
          <div className="treeMatchCell">
            <CompactMatch slot={final} onMatchClick={onMatchClick} />
          </div>
          <div className="treeMatchCell">
            <ChampionCard champion={champion} />
          </div>
        </div>
      </div>

      {/* 三四名决赛 */}
      <div className="treeRound">
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#cd7f32',
            padding: '10px 0 6px',
            letterSpacing: 1,
          }}
        >
          🥉 三四名决赛
        </div>
        <div className="treeSingle">
          <div className="treeMatchCell">
            <CompactMatch slot={thirdPlace} onMatchClick={onMatchClick} />
          </div>
        </div>
      </div>

      {/* SF2 */}
      <div className="treeRound">
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#1a1a2e',
            padding: '10px 0 6px',
            letterSpacing: 1,
          }}
        >
          半决赛
        </div>
        <div className="treeSingle">
          <div className="treeMatchCell">
            <CompactMatch slot={sf2} onMatchClick={onMatchClick} />
          </div>
        </div>
      </div>

      {/* 下半区：QF3、QF4 */}
      {model.hasQuarterFinals && (
        <div className="treeRound">
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#1a1a2e',
              padding: '10px 0 6px',
              letterSpacing: 1,
            }}
          >
            1/4 决赛
          </div>
          <div className="treePair">
            <div className="treeMatchCell">
              <CompactMatch slot={qf3} onMatchClick={onMatchClick} />
            </div>
            <div className="treeMatchCell">
              <CompactMatch slot={qf4} onMatchClick={onMatchClick} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
 *  移动端：居中对称树（无 1/4 决赛，仅半决赛 + 决赛）
 *
 *        半决赛
 *      [SF1] [SF2]
 *        └─┬─┘
 *      🏆 决赛
 *     [Final] [冠军]
 *      ─ ─ ─ ─
 *      🥉 三四名
 * ============================================================ */

const MobileSymmetricNoQF: React.FC<MobileBracketLayoutProps> = ({
  model,
  onMatchClick,
}) => {
  const { semiFinals, final, thirdPlace, champion } = model;
  const [sf1, sf2] = semiFinals;

  return (
    <div className="bracketTreeNoQFMobile">
      {/* 半决赛：两场并排 */}
      <div className="noQfMobLabel">半决赛</div>
      <div className="noQfMobSemis">
        <div className="noQfMobHalf">
          <div className="noQfMobHalfCard">
            <CompactMatch slot={sf1} onMatchClick={onMatchClick} />
          </div>
        </div>
        <div className="noQfMobHalf">
          <div className="noQfMobHalfCard">
            <CompactMatch slot={sf2} onMatchClick={onMatchClick} />
          </div>
        </div>
      </div>

      {/* 连接线：SF1/SF2 汇入决赛 */}
      <div className="noQfMobConnector">
        <span className="noQfMobConnBar" />
        <span className="noQfMobConnDown" />
      </div>

      {/* 决赛：卡片 + 冠军 */}
      <div className="noQfMobLabel noQfMobLabelFinal">🏆 决赛</div>
      <div className="noQfMobFinal">
        <div className="noQfMobFinalCard">
          <CompactMatch slot={final} onMatchClick={onMatchClick} />
        </div>
        <ChampionCard champion={champion} />
      </div>

      {/* 三四名决赛 */}
      <div className="noQfMobThird">
        <div className="thirdPlaceLabel">🥉 三四名决赛</div>
        <div className="noQfMobThirdCard">
          <CompactMatch slot={thirdPlace} onMatchClick={onMatchClick} />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  对外统一门面                                                               */
/* -------------------------------------------------------------------------- */

export const MobileBracketLayout: React.FC<MobileBracketLayoutProps> = (
  props,
) => {
  return props.model.hasQuarterFinals ? (
    <MobileVerticalWithQF {...props} />
  ) : (
    <MobileSymmetricNoQF {...props} />
  );
};

export default MobileBracketLayout;
