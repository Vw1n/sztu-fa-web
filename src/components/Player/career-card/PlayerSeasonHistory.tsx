import React from 'react';
import type { PlayerSeasonHistoryProps } from './player-career-card.types';

/**
 * 赛季履历表格：只接收排序后的赛季行数组
 * 组件内部不做排序，排序由 mapper 或服务端契约决定
 */
export const PlayerSeasonHistory: React.FC<PlayerSeasonHistoryProps> = ({ seasons }) => {
  return (
    <>
      <h4 className="cc-section-title">
        📊 当前赛季数据
      </h4>
      <div className="cc-table-wrapper">
        <table className="cc-table">
          <thead>
            <tr className="cc-table-header-row">
              <th className="cc-table-th cc-table-th--season">
                赛季
              </th>
              <th className="cc-table-th cc-table-th--matches">
                出场
              </th>
              <th className="cc-table-th cc-table-th--goals">
                进球
              </th>
              <th className="cc-table-th cc-table-th--assists">
                助攻
              </th>
              <th className="cc-table-th cc-table-th--discipline">
                黄牌/红牌
              </th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s, idx: number) => (
              <tr
                key={idx}
                className={`cc-table-row ${idx === seasons.length - 1 ? 'cc-table-row--last' : ''} ${idx % 2 === 1 ? 'cc-table-row--alt' : ''}`}
              >
                <td className="cc-table-td cc-table-td--season">
                  {s.seasonName}
                </td>
                <td className="cc-table-td">{s.matchesPlayed}</td>
                <td className="cc-table-td cc-table-td--goals">
                  {s.goals}
                </td>
                <td className="cc-table-td cc-table-td--assists">
                  {s.assists}
                </td>
                <td className="cc-table-td cc-table-td--discipline">
                  <span className="cc-discipline">
                    <span className="cc-discipline-item">
                      <span className="cc-discipline-emoji">🟨</span>
                      <span>{s.yellowCards}</span>
                    </span>
                    <span className="cc-discipline-sep">/</span>
                    <span className="cc-discipline-item">
                      <span className="cc-discipline-emoji">🟥</span>
                      <span>{s.redCards}</span>
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
