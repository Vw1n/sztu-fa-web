import React from 'react';
import { LoadingSpinner } from '../../common';
import type { Match } from '../../../types';
import { getPenaltyScore, getWinnerTeamId } from '../utils/matchOutcome';

interface KnockoutBracketProps {
  bracketMatches: Match[];
  bracketLoading: boolean;
  onMatchClick: (match: Match) => void;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  bracketMatches,
  bracketLoading,
  onMatchClick,
}) => {
  const matches = bracketMatches;

  if (bracketLoading) {
    return (
      <div className="bracketSection">
        <LoadingSpinner message="正在加载对阵图..." />
      </div>
    );
  }

  const findMatch = (round: string, index: number) => {
    return matches.find(m => m.knockoutRound === round && m.knockoutMatchIndex === index);
  };

  const hasR16 = matches.some(m => m.knockoutRound === 'R16');

  const renderMatchCard = (match: Match | undefined, round: string, index: number, compact?: boolean) => {
    const side = round === 'R16' ? (index <= 4 ? 'left' : 'right') :
                 round === 'QF' ? (index <= 2 ? 'left' : 'right') :
                 round === 'SF' ? (index === 1 ? 'left' : 'right') : 'center';

    if (!match) {
      return (
        <div className={`bracketMatchCard emptyCard bracket-card-${round.toLowerCase()} bracket-card-${side}${compact ? ' bracketCardCompact' : ''}`}>
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
    ].filter(Boolean).join(' ');

    return (
      <div className={cardClasses} onClick={() => onMatchClick(match)} style={{ cursor: 'pointer' }}>
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
              <img src={match.homeTeam.teamLogo} alt={match.homeTeam.teamName} className="bracketTeamLogo" />
            ) : (
              <span className="bracketLogoPlaceholder">⚽</span>
            )}
            <span className="bracketTeamName">{match.homeTeam?.teamName || '待定'}</span>
          </div>
          <span className="bracketTeamScore">
            {match.status === 'completed' || match.status === 'in_progress' ? match.homeScore : '-'}
            {penaltyScore ? ` (${penaltyScore.home})` : ''}
          </span>
        </div>
        <div className={`bracketTeamRow ${isAwayWinner ? 'winnerRow' : ''}`}>
          <div className="bracketTeamInfo">
            {match.awayTeam?.teamLogo ? (
              <img src={match.awayTeam.teamLogo} alt={match.awayTeam.teamName} className="bracketTeamLogo" />
            ) : (
              <span className="bracketLogoPlaceholder">⚽</span>
            )}
            <span className="bracketTeamName">{match.awayTeam?.teamName || '待定'}</span>
          </div>
          <span className="bracketTeamScore">
            {match.status === 'completed' || match.status === 'in_progress' ? match.awayScore : '-'}
            {penaltyScore ? ` (${penaltyScore.away})` : ''}
          </span>
        </div>
        {!compact && (
          <div className="bracketTime">
            {match.matchDate ? new Date(match.matchDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '时间未定'}
          </div>
        )}
      </div>
    );
  };

  const renderChampionCard = () => {
    const finalMatch = findMatch('F', 1);
    if (!finalMatch || finalMatch.status !== 'completed') return null;
    const winnerTeamId = getWinnerTeamId(finalMatch);
    const champion =
      winnerTeamId === finalMatch.homeTeamId
        ? finalMatch.homeTeam
        : winnerTeamId === finalMatch.awayTeamId
          ? finalMatch.awayTeam
          : null;
    if (!champion) return null;
    return (
      <div className="championCard">
        <div className="championCrown">🏆</div>
        <div className="championTitle">冠军</div>
        {champion.teamLogo && <img src={champion.teamLogo} alt={champion.teamName} className="championLogo" />}
        <div className="championName">{champion.teamName}</div>
      </div>
    );
  };

  // ============ 移动端：上下半区纵向对阵图 ============
  //
  //     上半区：QF1、QF2 → SF1 → Final+冠军
  //     下半区：Final+冠军 → SF2 → QF3、QF4
  //
  const renderMobileTree = () => {
    const qf1 = findMatch('QF', 1);
    const qf2 = findMatch('QF', 2);
    const qf3 = findMatch('QF', 3);
    const qf4 = findMatch('QF', 4);
    const sf1 = findMatch('SF', 1);
    const sf2 = findMatch('SF', 2);
    const finalMatch = findMatch('F', 1);
    const championCard = renderChampionCard();

    return (
      <div className="bracketTreeMobile">

        {/* 上半区：QF1、QF2 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e', padding: '10px 0 6px', letterSpacing: 1 }}>1/4 决赛</div>
          <div className="treePair">
            <div className="treeMatchCell">{renderMatchCard(qf1, 'QF', 1, true)}</div>
            <div className="treeMatchCell">{renderMatchCard(qf2, 'QF', 2, true)}</div>
          </div>
        </div>

        {/* SF1 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e', padding: '10px 0 6px', letterSpacing: 1 }}>半决赛</div>
          <div className="treeSingle">
            <div className="treeMatchCell">{renderMatchCard(sf1, 'SF', 1, true)}</div>
          </div>
        </div>

        {/* Final + 冠军 并排 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', padding: '10px 0 6px', letterSpacing: 1 }}>🏆 决赛</div>
          <div className="treePair">
            <div className="treeMatchCell">{renderMatchCard(finalMatch, 'F', 1, true)}</div>
            <div className="treeMatchCell">{championCard}</div>
          </div>
        </div>

        {/* 三四名决赛 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#cd7f32', padding: '10px 0 6px', letterSpacing: 1 }}>🥉 三四名决赛</div>
          <div className="treeSingle">
            <div className="treeMatchCell">{renderMatchCard(findMatch('3RD', 1), '3RD', 1, true)}</div>
          </div>
        </div>

        {/* SF2 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e', padding: '10px 0 6px', letterSpacing: 1 }}>半决赛</div>
          <div className="treeSingle">
            <div className="treeMatchCell">{renderMatchCard(sf2, 'SF', 2, true)}</div>
          </div>
        </div>

        {/* 下半区：QF3、QF4 */}
        <div className="treeRound">
          <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e', padding: '10px 0 6px', letterSpacing: 1 }}>1/4 决赛</div>
          <div className="treePair">
            <div className="treeMatchCell">{renderMatchCard(qf3, 'QF', 3, true)}</div>
            <div className="treeMatchCell">{renderMatchCard(qf4, 'QF', 4, true)}</div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="bracketSection">
      <div className="bracketWrapper">

        {/* ====== 桌面端：横向 bracket ====== */}
        <div className="bracketContainer bracketDesktop">
          {hasR16 && (
            <div className="bracketColumn r16-left-column">
              <div className="columnHeader">1/8 决赛</div>
              <div className="matchGroups">
                {renderMatchCard(findMatch('R16', 1), 'R16', 1)}
                {renderMatchCard(findMatch('R16', 2), 'R16', 2)}
                {renderMatchCard(findMatch('R16', 3), 'R16', 3)}
                {renderMatchCard(findMatch('R16', 4), 'R16', 4)}
              </div>
            </div>
          )}

          <div className="bracketColumn qf-left-column">
            <div className="columnHeader">1/4 决赛</div>
            <div className="matchGroups">
              {renderMatchCard(findMatch('QF', 1), 'QF', 1)}
              {renderMatchCard(findMatch('QF', 2), 'QF', 2)}
            </div>
          </div>

          <div className="bracketColumn sf-left-column">
            <div className="columnHeader">半决赛</div>
            <div className="matchGroups">
              {renderMatchCard(findMatch('SF', 1), 'SF', 1)}
            </div>
          </div>

          <div className="bracketColumn f-center-column centerColumn">
            <div className="columnHeader championHeader">🏆 决赛</div>
            <div className="matchGroups finalGroup">
              {renderChampionCard()}
              <div style={{ marginTop: '-4px', marginBottom: 'auto' }}>{renderMatchCard(findMatch('F', 1), 'F', 1)}</div>
              <div className="thirdPlaceSection">
                <div className="thirdPlaceLabel">🥉 三四名决赛</div>
                {renderMatchCard(findMatch('3RD', 1), '3RD', 1)}
              </div>
            </div>
          </div>

          <div className="bracketColumn sf-right-column">
            <div className="columnHeader">半决赛</div>
            <div className="matchGroups">
              {renderMatchCard(findMatch('SF', 2), 'SF', 2)}
            </div>
          </div>

          <div className="bracketColumn qf-right-column">
            <div className="columnHeader">1/4 决赛</div>
            <div className="matchGroups">
              {renderMatchCard(findMatch('QF', 3), 'QF', 3)}
              {renderMatchCard(findMatch('QF', 4), 'QF', 4)}
            </div>
          </div>

          {hasR16 && (
            <div className="bracketColumn r16-right-column">
              <div className="columnHeader">1/8 决赛</div>
              <div className="matchGroups">
                {renderMatchCard(findMatch('R16', 5), 'R16', 5)}
                {renderMatchCard(findMatch('R16', 6), 'R16', 6)}
                {renderMatchCard(findMatch('R16', 7), 'R16', 7)}
                {renderMatchCard(findMatch('R16', 8), 'R16', 8)}
              </div>
            </div>
          )}
        </div>

        {/* ====== 移动端：上下半区纵向 bracket ====== */}
        {renderMobileTree()}

      </div>
    </div>
  );
};
