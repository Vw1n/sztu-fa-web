import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyPredictions, fetchMyStats } from '../api/predictions';
import type { UserPredictionRecord, MyPredictionStats } from '../api/predictions';
import { fetchSeasons } from '../api/seasons';
import type { Season } from '../api/seasons';
import { useAuth } from '../contexts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './pages.css';

const MyPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<UserPredictionRecord[]>([]);
  const [stats, setStats] = useState<MyPredictionStats | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const list = await fetchSeasons();
        setSeasons(list);
        const active = list.find((s) => s.status === 'active');
        if (active) setSelectedSeasonId(active.id);
      } catch {
        // ignore
      }
    };
    loadSeasons();
  }, []);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const [listRes, statsRes] = await Promise.all([
        fetchMyPredictions(selectedSeasonId || undefined),
        fetchMyStats(selectedSeasonId || undefined),
      ]);
      setPredictions(listRes.data);
      setStats(statsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '获取个人战绩数据失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedSeasonId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isAuthenticated) {
    return (
      <div className="pageLayout">
        <Header />
        <main className="mainContent flexCenter">
          <div className="loginNotice">
            <h2>请先登录账号</h2>
            <p>登录后可查看您的个人竞猜统计、积分排名及历史记录</p>
            <div className="noticeActions">
              <Link to="/login" className="actionBtn primary">
                登录账号
              </Link>
              <Link to="/register" className="actionBtn secondary">
                注册绑定学号
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pageLayout">
      <Header />
      <main className="mainContent">
        <div className="pageContainer">
          <div className="pageHeader">
            <div>
              <h1 className="pageTitle">我的竞猜中心</h1>
              <p className="pageSubtitle">
                查看您的预测战绩、获得积分、命中率及历史个人记录
              </p>
            </div>
            {seasons.length > 0 && (
              <div className="filterBox">
                <label htmlFor="seasonSelect">选择赛季：</label>
                <select
                  id="seasonSelect"
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="seasonSelect"
                >
                  <option value="">全部赛季</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === 'active' ? '(当前)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="userProfileCard">
            <div className="profileInfo">
              <span className="profileAvatar">
                {(user?.nickname || user?.username || 'U')[0].toUpperCase()}
              </span>
              <div className="profileDetails">
                <h3>{user?.nickname || user?.username}</h3>
                <p>学号：{user?.studentId || '未绑定学号'}</p>
              </div>
            </div>

            <div className="statsGrid">
              <div className="statItem">
                <span className="statLabel">当前赛季积分</span>
                <span className="statValue highlight">{stats?.seasonPoints || 0}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">赛季排名</span>
                <span className="statValue">
                  {stats?.seasonRank ? `第 ${stats.seasonRank} 名` : '-'}
                </span>
              </div>
              <div className="statItem">
                <span className="statLabel">历史总积分</span>
                <span className="statValue">{stats?.totalPoints || 0}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">有效参与次数</span>
                <span className="statValue">{stats?.totalPredictions || 0}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">猜中次数</span>
                <span className="statValue">{stats?.correctPredictions || 0}</span>
              </div>
              <div className="statItem">
                <span className="statLabel">命中率</span>
                <span className="statValue rate">{stats?.accuracyRate || 0}%</span>
              </div>
            </div>
          </div>

          <div className="sectionTitleRow">
            <h2>竞猜历史明细</h2>
          </div>

          {error && <div className="errorMessage">{error}</div>}

          {loading ? (
            <div className="loadingContainer">加载个人历史记录中...</div>
          ) : predictions.length === 0 ? (
            <div className="emptyContainer">
              暂无任何竞猜记录，去 <Link to="/predictions">竞猜大厅</Link> 预测一场吧！
            </div>
          ) : (
            <div className="historyTableContainer">
              <table className="historyTable">
                <thead>
                  <tr>
                    <th>比赛信息</th>
                    <th>比赛时间</th>
                    <th>我的预测</th>
                    <th>常规时间比分</th>
                    <th>状态</th>
                    <th>获得积分</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => {
                    const match = p.match;
                    const matchTime = match?.matchDate
                      ? new Date(match.matchDate).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '时间未知';

                    let choiceText = '主胜';
                    if (p.choice === 'DRAW') choiceText = '打平';
                    if (p.choice === 'AWAY_WIN') choiceText = '客胜';

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="tableMatchVs">
                            <span>{match?.homeTeam?.teamName || '主队'}</span>
                            <span className="vsSmall">VS</span>
                            <span>{match?.awayTeam?.teamName || '客队'}</span>
                          </div>
                        </td>
                        <td className="timeCell">{matchTime}</td>
                        <td>
                          <span className="choiceBadgeTag">{choiceText}</span>
                        </td>
                        <td className="scoreCell">
                          {match?.status === 'finished' || match?.status === 'completed'
                            ? `${match.homeScore} : ${match.awayScore}`
                            : '未完赛'}
                        </td>
                        <td>
                          {p.status === 'CORRECT' && (
                            <span className="statusTag success">猜中</span>
                          )}
                          {p.status === 'WRONG' && (
                            <span className="statusTag danger">猜错</span>
                          )}
                          {p.status === 'PENDING' && (
                            <span className="statusTag pending">待结算</span>
                          )}
                          {p.status === 'VOID' && (
                            <span className="statusTag void">已作废</span>
                          )}
                        </td>
                        <td className="pointsCell">
                          {p.status === 'CORRECT' ? '+3 分' : '+0 分'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyPredictions;
