import type { Player, Season, Team } from '../../types';

interface TeamModalProps {
  team: Team;
  seasons: Season[];
  selectedSeasonId: string;
  displayPlayers: Player[];
  playersLoading: boolean;
  rosterError: string | null;
  onClose: () => void;
  onSeasonChange: (seasonId: string) => void;
  onPreviewImage: (url: string) => void;
}

const TeamModal: React.FC<TeamModalProps> = ({
  team,
  seasons,
  selectedSeasonId,
  displayPlayers,
  playersLoading,
  rosterError,
  onClose,
  onSeasonChange,
  onPreviewImage,
}) => {
  return (
    <div className="teamModalOverlay" onClick={onClose}>
      <div className="teamModal" onClick={(e) => e.stopPropagation()}>
        <button className="modalClose" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="modalHeader">
          <img
            src={team.teamLogo || 'https://picsum.photos/seed/jersey1/100/100'}
            alt={team.teamName}
            className="modalLogo"
            onClick={() => onPreviewImage(team.teamLogo || 'https://picsum.photos/seed/jersey1/100/100')}
          />
          <h3 className="modalTitle">{team.teamName}</h3>
        </div>
        <div className="modalContent">
          <div className="modalInfoGrid">
            <div className="modalInfoItem">
              <span className="modalInfoLabel">球队组别</span>
              <span className="modalInfoValue" style={{ color: team.gender === 'FEMALE' ? '#ff4d4f' : '#1890ff', fontWeight: 600 }}>
                {team.gender === 'FEMALE' ? '女子组' : '男子组'}
              </span>
            </div>
            <div className="modalInfoItem coachInfoItem">
              <span className="modalInfoLabel">主教练</span>
              <span className="modalInfoValue">{team.headCoach || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">队长</span>
              <span className="modalInfoValue">{team.teamLeader || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">队医</span>
              <span className="modalInfoValue">{team.teamDoctor || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">教练电话</span>
              <span className="modalInfoValue">{team.coachPhone || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">队长电话</span>
              <span className="modalInfoValue">{team.leaderPhone || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">主场球衣颜色</span>
              <span className="modalInfoValue">{team.homeJerseyColor || '暂无'}</span>
            </div>
            <div className="modalInfoItem">
              <span className="modalInfoLabel">客场球衣颜色</span>
              <span className="modalInfoValue">{team.awayJerseyColor || '暂无'}</span>
            </div>
          </div>
          <div className="modalJerseys">
            <div className="modalJersey">
              <img
                src={team.homeJersey || 'https://picsum.photos/seed/jersey2/200/300'}
                alt="主场球衣"
                className="jerseyImage"
                onClick={() => onPreviewImage(team.homeJersey || 'https://picsum.photos/seed/jersey2/200/300')}
              />
              <span className="jerseyLabel">主场球衣</span>
            </div>
            <div className="modalJersey">
              <img
                src={team.awayJersey || 'https://picsum.photos/seed/jersey2/200/300'}
                alt="客场球衣"
                className="jerseyImage"
                onClick={() => onPreviewImage(team.awayJersey || 'https://picsum.photos/seed/jersey2/200/300')}
              />
              <span className="jerseyLabel">客场球衣</span>
            </div>
          </div>

          {/* 赛季球员名单 */}
          <div className="modalPlayersSection">
            <div className="modalPlayersHeader">
              <h4>👥 队员名单</h4>
              {seasons.length > 0 && (
                <select
                  value={selectedSeasonId}
                  onChange={(e) => onSeasonChange(e.target.value)}
                  className="modalSeasonSelect"
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === 'active' ? '(当前)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            {playersLoading ? (
              <div className="modalPlayersLoading">加载球员列表中...</div>
            ) : rosterError ? (
              <div className="modalPlayersEmpty" style={{ color: '#fa5252' }}>{rosterError}</div>
            ) : displayPlayers.length === 0 ? (
              <div className="modalPlayersEmpty">该赛季暂无队员登记或出场记录</div>
            ) : (
              <div className="modalPlayersList">
                {displayPlayers.map((player) => {
                  const isSuspended = player.status === 'suspended';
                  return (
                    <div 
                      key={player.id || `${player.name}_${player.jerseyNumber}`} 
                      className="modalPlayerCard"
                      style={isSuspended ? { borderLeft: '3px solid #fa5252', backgroundColor: '#fff5f5' } : undefined}
                      title={isSuspended ? '该球员本赛季因红黄牌停赛' : undefined}
                    >
                      {player.photo ? (
                        <img src={player.photo} alt={player.name} className="modalPlayerPhoto" />
                      ) : (
                        <div 
                          className="modalPlayerPhotoPlaceholder"
                          style={isSuspended ? { backgroundColor: '#fa5252' } : undefined}
                        >
                          {isSuspended ? '🛑' : '👕'}
                        </div>
                      )}
                      <div className="modalPlayerInfo">
                        <span className="modalPlayerName" style={isSuspended ? { color: '#c92a2a' } : undefined}>
                          {player.name} {isSuspended && <span style={{ fontSize: '0.75rem', color: '#fa5252', fontWeight: 'bold' }}>(停)</span>}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span className="modalPlayerNumber">{player.jerseyNumber ? `${player.jerseyNumber}号` : '无号'}</span>
                          {((player.yellowCards ?? 0) > 0 || (player.redCards ?? 0) > 0) && (
                            <span style={{ display: 'inline-flex', gap: '3px', fontSize: '0.75rem' }}>
                              {(player.yellowCards ?? 0) > 0 && <span style={{ color: '#f59f00' }}>🟨{player.yellowCards}</span>}
                              {(player.redCards ?? 0) > 0 && <span style={{ color: '#fa5252' }}>🟥{player.redCards}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;
