import React from 'react';
import type { Match } from '../../../types';
import type { BracketModel } from './bracket.types';
import { BracketMatchCard } from './BracketMatchCard';
import { BracketRound } from './BracketRound';

export interface DesktopBracketLayoutProps {
  model: BracketModel;
  onMatchClick: (match: Match) => void;
}

/* ---------- 冠军卡片（与原 KnockoutBracket 内 renderChampionCard 等价） ---------- */

export const ChampionCard: React.FC<{
  champion: BracketModel['champion'];
}> = ({ champion }) => {
  if (!champion) return null;
  return (
    <div className="championCard">
      <div className="championCrown">🏆</div>
      <div className="championTitle">冠军</div>
      {champion.teamLogo && (
        <img
          src={champion.teamLogo}
          alt={champion.teamName}
          className="championLogo"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="championName">{champion.teamName}</div>
    </div>
  );
};

/* ============================================================
 *  桌面端：横向 bracket（有 1/4 决赛）
 *  R16 左 -> QF 左 -> SF 左 -> Final/Center <- SF 右 <- QF 右 <- R16 右
 * ============================================================ */

const DesktopHorizontalQF: React.FC<DesktopBracketLayoutProps> = ({
  model,
  onMatchClick,
}) => {
  const { roundOf16, quarterFinals, semiFinals, final, thirdPlace, champion } =
    model;

  return (
    <div className="bracketContainer bracketDesktop">
      {/* 1/8 决赛 - 左 */}
      {model.hasRoundOf16 && (
        <BracketRound
          slots={roundOf16.slice(0, 4)}
          headerLabel="1/8 决赛"
          className="bracketColumn r16-left-column"
          onMatchClick={onMatchClick}
        />
      )}

      {/* 1/4 决赛 - 左 */}
      <BracketRound
        slots={quarterFinals.slice(0, 2)}
        headerLabel="1/4 决赛"
        className="bracketColumn qf-left-column"
        onMatchClick={onMatchClick}
      />

      {/* 半决赛 - 左 */}
      <BracketRound
        slots={[semiFinals[0]]}
        headerLabel="半决赛"
        className="bracketColumn sf-left-column"
        onMatchClick={onMatchClick}
      />

      {/* 中心列：决赛 + 冠军卡 + 三四名 */}
      <div className="bracketColumn f-center-column centerColumn">
        <div className="columnHeader championHeader">🏆 决赛</div>
        <div className="matchGroups finalGroup">
          <ChampionCard champion={champion} />
          <div style={{ marginTop: '-4px', marginBottom: 'auto' }}>
            {final && (
              <BracketMatchCard
                round={final.round}
                index={final.index}
                match={final.match}
                onMatchClick={onMatchClick}
              />
            )}
          </div>
          <div className="thirdPlaceSection">
            <div className="thirdPlaceLabel">🥉 三四名决赛</div>
            {thirdPlace && (
              <BracketMatchCard
                round={thirdPlace.round}
                index={thirdPlace.index}
                match={thirdPlace.match}
                onMatchClick={onMatchClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* 半决赛 - 右 */}
      <BracketRound
        slots={[semiFinals[1]]}
        headerLabel="半决赛"
        className="bracketColumn sf-right-column"
        onMatchClick={onMatchClick}
      />

      {/* 1/4 决赛 - 右 */}
      <BracketRound
        slots={quarterFinals.slice(2, 4)}
        headerLabel="1/4 决赛"
        className="bracketColumn qf-right-column"
        onMatchClick={onMatchClick}
      />

      {/* 1/8 决赛 - 右 */}
      {model.hasRoundOf16 && (
        <BracketRound
          slots={roundOf16.slice(4, 8)}
          headerLabel="1/8 决赛"
          className="bracketColumn r16-right-column"
          onMatchClick={onMatchClick}
        />
      )}
    </div>
  );
};

/* ============================================================
 *  桌面端：竖向 bracket（无 1/4 决赛，仅决赛 + 半决赛）
 *     冠军
 *     决赛
 *    ┌─┴─┐
 *   SF1 SF2
 *   三四名
 * ============================================================ */

const DesktopVerticalNoQF: React.FC<DesktopBracketLayoutProps> = ({
  model,
  onMatchClick,
}) => {
  const { semiFinals, final, thirdPlace, champion } = model;

  return (
    <div className="bracketTreeNoQF bracketDesktop">
      <div className="noQfCell">
        <div className="columnHeader championHeader">🏆 决赛</div>
      </div>

      {champion && (
        <div className="noQfCell noQfChampion">
          <ChampionCard champion={champion} />
        </div>
      )}

      <div className="noQfCell noQfFinal">
        {final && (
          <BracketMatchCard
            round={final.round}
            index={final.index}
            match={final.match}
            onMatchClick={onMatchClick}
          />
        )}
      </div>

      <div className="noQfConnector" />

      <div className="noQfSemis">
        <div className="noQfStage noQfSemiStage">
          <div className="columnHeader">半决赛</div>
          <div className="noQfCell noQfSemi">
            {semiFinals[0] && (
              <BracketMatchCard
                round={semiFinals[0].round}
                index={semiFinals[0].index}
                match={semiFinals[0].match}
                onMatchClick={onMatchClick}
              />
            )}
          </div>
        </div>
        <div className="noQfStage noQfSemiStage">
          <div className="columnHeader">半决赛</div>
          <div className="noQfCell noQfSemi">
            {semiFinals[1] && (
              <BracketMatchCard
                round={semiFinals[1].round}
                index={semiFinals[1].index}
                match={semiFinals[1].match}
                onMatchClick={onMatchClick}
              />
            )}
          </div>
        </div>
      </div>

      <div className="thirdPlaceSection noQfThirdSection">
        <div className="thirdPlaceLabel">🥉 三四名决赛</div>
        <div className="noQfCell noQfThird">
          {thirdPlace && (
            <BracketMatchCard
              round={thirdPlace.round}
              index={thirdPlace.index}
              match={thirdPlace.match}
              onMatchClick={onMatchClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  对外统一门面                                                               */
/* -------------------------------------------------------------------------- */

export const DesktopBracketLayout: React.FC<DesktopBracketLayoutProps> = (
  props,
) => {
  return props.model.hasQuarterFinals ? (
    <DesktopHorizontalQF {...props} />
  ) : (
    <DesktopVerticalNoQF {...props} />
  );
};

export default DesktopBracketLayout;
