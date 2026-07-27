import React from 'react';
import type { CareerData } from '../Matches/utils/matchData';

interface PlayerCareerCardProps {
  careerPlayerId: string | null;
  careerPlayerName: string;
  careerData: CareerData | null;
  careerLoading: boolean;
  onClose: () => void;
}

export const PlayerCareerCard: React.FC<PlayerCareerCardProps> = ({
  careerPlayerId,
  careerPlayerName,
  careerData,
  careerLoading,
  onClose,
}) => {
  if (!careerPlayerId) return null;

  return (
    <div className="matchModalOverlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="matchModal careerCardModal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '92%',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        <button className="matchModalClose" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {careerLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="loadingSpinner" style={{ margin: '0 auto 15px auto' }}></div>
            <p style={{ color: 'var(--text-color)', fontWeight: 600 }}>正在生成生涯球星卡...</p>
          </div>
        ) : careerData ? (
          <div style={{ padding: '24px 18px' }}>
            {/* 球星卡顶部个人信息 */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '16px' }}>
              {careerData.photo ? (
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                  border: '3px solid #fff',
                  background: '#f1f5f9',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img 
                    src={careerData.photo} 
                    alt={careerPlayerName} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center 20%',
                    }} 
                  />
                </div>
              ) : (
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
                  border: '3px solid #fff',
                  color: '#fff',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}>
                  {careerData.jerseyNumber || '#'}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {careerPlayerName}
                </h3>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                  <span>🛡️</span> <span>{careerData.teamName || '暂无队伍'}</span>
                  {careerData.status === 'suspended' && (
                    <span style={{ background: '#ffebeb', color: '#d93838', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px', whiteSpace: 'nowrap' }}>🛑 停赛中</span>
                  )}
                </p>
              </div>
            </div>

            {/* 生涯总计面板 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-color)', whiteSpace: 'nowrap' }}>{careerData.summary.totalMatches}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', whiteSpace: 'nowrap' }}>出场数</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>{careerData.summary.totalGoals}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', whiteSpace: 'nowrap' }}>总进球</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0288d1', whiteSpace: 'nowrap' }}>{careerData.summary.totalAssists}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', whiteSpace: 'nowrap' }}>总助攻</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)', padding: '10px 4px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f57c00', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                  <span>🟨{careerData.summary.totalYellow}</span>
                  <span>🟥{careerData.summary.totalRed}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px', whiteSpace: 'nowrap' }}>红黄牌</div>
              </div>
            </div>

            {/* 跨赛季历史表单 */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)' }}>📊 赛季生涯历程</h4>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <th style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>赛季</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>估算出场</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>进球</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>助攻</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600, whiteSpace: 'nowrap' }}>黄牌/红牌</th>
                  </tr>
                </thead>
                <tbody>
                  {careerData.seasons.map((s, idx: number) => (
                    <tr key={idx} style={{ borderBottom: idx === careerData.seasons.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.2)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.seasonName}</td>
                      <td style={{ padding: '8px 4px', whiteSpace: 'nowrap' }}>{s.matchesPlayed}</td>
                      <td style={{ padding: '8px 4px', fontWeight: 600, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>{s.goals}</td>
                      <td style={{ padding: '8px 4px', fontWeight: 600, color: '#0288d1', whiteSpace: 'nowrap' }}>{s.assists}</td>
                      <td style={{ padding: '8px 4px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <span>🟨{s.yellowCards}</span>
                          <span style={{ color: '#999', margin: '0 1px' }}>/</span>
                          <span>🟥{s.redCards}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>无法加载生涯数据</div>
        )}
      </div>
    </div>
  );
};
