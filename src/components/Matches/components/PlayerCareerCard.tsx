import React from 'react';
import type { CareerData } from '../utils/matchData';

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
    <div className="matchModalOverlay" style={{ zIndex: 1000 }} onClick={onClose}>
      <div
        className="matchModal careerCardModal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          borderRadius: '24px',
          overflow: 'hidden'
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
          <div style={{ padding: '30px 24px' }}>
            {/* 球星卡顶部个人信息 */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '20px' }}>
              {careerData.photo ? (
                <img src={careerData.photo} alt={careerPlayerName} style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  flexShrink: 0
                }} />
              ) : (
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  color: '#fff',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {careerData.jerseyNumber || '#'}
                </div>
              )}
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)' }}>
                  {careerPlayerName}
                </h3>
                <p style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>🛡️</span> {careerData.teamName || '暂无队伍'}
                  {careerData.status === 'suspended' && (
                    <span style={{ background: '#ffebeb', color: '#d93838', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '5px' }}>🛑 停赛中</span>
                  )}
                </p>
              </div>
            </div>

            {/* 生涯总计面板 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-color)' }}>{careerData.summary.totalMatches}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>出场数</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>{careerData.summary.totalGoals}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>总进球</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0288d1' }}>{careerData.summary.totalAssists}</div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>总助攻</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.5)', padding: '12px 8px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f57c00' }}>
                  🟨{careerData.summary.totalYellow} 🟥{careerData.summary.totalRed}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>红黄牌</div>
              </div>
            </div>

            {/* 跨赛季历史表单 */}
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>📊 赛季生涯历程</h4>
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>赛季</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>估算出场</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>进球</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>助攻</th>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>黄牌/红牌</th>
                  </tr>
                </thead>
                <tbody>
                  {careerData.seasons.map((s, idx: number) => (
                    <tr key={idx} style={{ borderBottom: idx === careerData.seasons.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.2)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 500 }}>{s.seasonName}</td>
                      <td style={{ padding: '10px 8px' }}>{s.matchesPlayed}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--primary-color)' }}>{s.goals}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0288d1' }}>{s.assists}</td>
                      <td style={{ padding: '10px 8px' }}>🟨{s.yellowCards} / 🟥{s.redCards}</td>
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
