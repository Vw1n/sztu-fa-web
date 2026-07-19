import React from 'react';
import type { Match } from '../../../types';

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
  if (bracketLoading) {
    return (
      <div className="bracketSection">
        <div className="loadingContainer">
          <div className="loadingSpinner"></div>
          <p>正在加载对阵图...</p>
        </div>
      </div>
    );
  }

  // 查找并放置比赛
  const findMatch = (round: string, index: number) => {
    return bracketMatches.find(m => m.knockoutRound === round && m.knockoutMatchIndex === index);
  };

  const hasR16 = bracketMatches.some(m => m.knockoutRound === 'R16');

  // 渲染单场比赛卡片
  const renderMatchCard = (match: Match | undefined, round: string, index: number) => {
    const side = round === 'R16' ? (index <= 4 ? 'left' : 'right') :
                 round === 'QF' ? (index <= 2 ? 'left' : 'right') :
                 round === 'SF' ? (index === 1 ? 'left' : 'right') : 'center';

    if (!match) {
      return (
        <div className={`bracketMatchCard emptyCard bracket-card-${round.toLowerCase()} bracket-card-${side} bracket-card-${round.toLowerCase()}-${index}`}>
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

    const isHomeWinner = match.status === 'completed' && match.homeScore > match.awayScore;
    const isAwayWinner = match.status === 'completed' && match.awayScore > match.homeScore;

    return (
      <div 
        className={`bracketMatchCard bracket-card-${round.toLowerCase()} bracket-card-${side} bracket-card-${round.toLowerCase()}-${index} ${match.status === 'in_progress' ? 'ongoingMatch' : ''} ${match.status === 'completed' ? 'completedMatch' : ''}`}
        onClick={() => onMatchClick(match)}
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
              <img src={match.homeTeam.teamLogo} alt={match.homeTeam.teamName} className="bracketTeamLogo" />
            ) : (
              <span className="bracketLogoPlaceholder">⚽</span>
            )}
            <span className="bracketTeamName">{match.homeTeam?.teamName || '待定'}</span>
          </div>
          <span className="bracketTeamScore">
            {match.status === 'completed' || match.status === 'in_progress' ? match.homeScore : '-'}
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
          </span>
        </div>
        <div className="bracketTime">
          {match.matchDate ? new Date(match.matchDate).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '时间未定'}
        </div>
      </div>
    );
  };

  return (
    <div className="bracketSection">
      <div className="bracketWrapper">
        <div className="bracketContainer">
          {/* 左半翼 */}
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

          {/* 决赛 (中心) */}
          <div className="bracketColumn f-center-column centerColumn">
            <div className="columnHeader championHeader">🏆 决赛</div>
            <div className="matchGroups finalGroup">
              {renderMatchCard(findMatch('F', 1), 'F', 1)}
              {(() => {
                const finalMatch = findMatch('F', 1);
                if (finalMatch && finalMatch.status === 'completed') {
                  const champion = finalMatch.homeScore > finalMatch.awayScore ? finalMatch.homeTeam : finalMatch.awayTeam;
                  if (champion) {
                    return (
                      <div className="championCard">
                        <div className="championCrown">🏆</div>
                        <div className="championTitle">冠军</div>
                        {champion.teamLogo && <img src={champion.teamLogo} alt={champion.teamName} className="championLogo" />}
                        <div className="championName">{champion.teamName}</div>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          </div>

          {/* 右半翼 */}
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
      </div>
    </div>
  );
};
