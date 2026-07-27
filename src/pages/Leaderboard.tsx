import React, { useState, useEffect, useCallback } from 'react';
import { fetchLeaderboard } from '../api/predictions';
import type { LeaderboardItem } from '../api/predictions';
import { fetchSeasons } from '../api/seasons';
import type { Season } from '../api/seasons';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './pages.css';

const Leaderboard: React.FC = () => {
  const [scope, setScope] = useState<'season' | 'all'>('season');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [list, setList] = useState<LeaderboardItem[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  const [seasonsLoaded, setSeasonsLoaded] = useState(false);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const seasonList = await fetchSeasons();
        setSeasons(seasonList);
        const active = seasonList.find((s) => s.status === 'active');
        if (active) {
          setSelectedSeasonId(active.id);
        } else if (seasonList.length > 0) {
          setSelectedSeasonId(seasonList[0].id);
        }
      } catch {
        // ignore
      } finally {
        setSeasonsLoaded(true);
      }
    };
    loadSeasons();
  }, []);

  const loadData = useCallback(async () => {
    if (scope === 'season' && !seasonsLoaded) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetchLeaderboard(
        scope,
        scope === 'season' ? selectedSeasonId || undefined : undefined,
      );
      setList(res.list);
      setCurrentUser(res.currentUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '获取排行榜失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [scope, selectedSeasonId, seasonsLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
          <div className="pageHeader">
            <div>
              <h1 className="pageTitle">赛事竞猜英雄榜</h1>
              <p className="pageSubtitle">
                积分多重排序（积分排名 &gt; 命中率 &gt; 参与次数），同分并列。学号脱敏展示保护隐私。
              </p>
            </div>

            <div className="scopeSwitchBox">
              <button
                type="button"
                className={`scopeTab ${scope === 'season' ? 'active' : ''}`}
                onClick={() => setScope('season')}
              >
                赛季排行榜
              </button>
              <button
                type="button"
                className={`scopeTab ${scope === 'all' ? 'active' : ''}`}
                onClick={() => setScope('all')}
              >
                历史总榜
              </button>
            </div>
          </div>

          {scope === 'season' && seasons.length > 0 && (
            <div className="seasonFilterRow">
              <label htmlFor="seasonSelect">选择赛季：</label>
              <select
                id="seasonSelect"
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                className="seasonSelect"
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.status === 'active' ? '(当前)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="errorMessage">{error}</div>}

          {loading ? (
            <div className="loadingContainer">加载排行榜数据中...</div>
          ) : list.length === 0 ? (
            <div className="emptyContainer">
              暂无已结算的竞猜数据，榜单静候首位神预测选手！
            </div>
          ) : (
            <div className="leaderboardCard">
              <div className="tableResponsiveWrapper">
                <table className="leaderboardTable">
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>选手昵称</th>
                      <th>绑定学号</th>
                      <th>总积分</th>
                      <th>命中率</th>
                      <th>参与/猜中</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => {
                      let rankClass = 'normalRank';
                      if (item.rank === 1) rankClass = 'topRank rank1';
                      if (item.rank === 2) rankClass = 'topRank rank2';
                      if (item.rank === 3) rankClass = 'topRank rank3';

                      return (
                        <tr
                          key={item.userId}
                          className={
                            currentUser?.userId === item.userId ? 'currentUserRow' : ''
                          }
                        >
                          <td>
                            <span className={`rankBadge ${rankClass}`}>
                              {item.rank}
                            </span>
                          </td>
                          <td className="userCell">
                            <div className="userFlex">
                              <span className="userAvatar">
                                {item.nickname[0].toUpperCase()}
                              </span>
                              <span className="userName">{item.nickname}</span>
                            </div>
                          </td>
                          <td className="studentIdCell">{item.maskedStudentId}</td>
                          <td className="pointsCell">
                            <strong>{item.points}</strong> 分
                          </td>
                          <td className="accuracyCell">{item.accuracyRate}%</td>
                          <td className="countCell">
                            {item.totalCount} 次 / {item.correctCount} 中
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isAuthenticated && currentUser && (
            <div className="currentUserFloatBar">
              <div className="floatLeft">
                <span className="floatRank">
                  {currentUser.rank > 0
                    ? `我的排名：第 ${currentUser.rank} 名`
                    : '我的排名：暂未上榜 (0 次有效参与)'}
                </span>
                <span className="floatName">
                  {currentUser.nickname} ({currentUser.maskedStudentId})
                </span>
              </div>
              <div className="floatRight">
                <span className="floatStat">
                  积分: <strong>{currentUser.points}</strong>
                </span>
                <span className="floatStat">
                  命中率: <strong>{currentUser.accuracyRate}%</strong>
                </span>
                <span className="floatStat">
                  猜中: {currentUser.correctCount}/{currentUser.totalCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
