import { useNavigate } from 'react-router-dom';
import type { Player, Season } from '../../../types';
import { EmptyState } from '../../../components/common';

interface TeamRosterProps {
  seasons: Season[];
  selectedSeasonId: string;
  onSeasonChange: (seasonId: string) => void;
  displayPlayers: Player[];
  playersLoading: boolean;
  rosterError: string | null;
}

const TeamRoster: React.FC<TeamRosterProps> = ({
  seasons,
  selectedSeasonId,
  onSeasonChange,
  displayPlayers,
  playersLoading,
  rosterError,
}) => {
  const navigate = useNavigate();

  return (
    <div className="teamDetailRoster">
      <div className="teamDetailRosterHeader">
        <h2 className="teamDetailRosterTitle">👥 队员名单</h2>
        {seasons.length > 0 && (
          <select
            value={selectedSeasonId}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="teamDetailSeasonSelect"
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
        <div className="teamDetailRosterLoading">
          <div className="teamDetailRosterSpinner" />
          <p>加载球员列表中...</p>
        </div>
      ) : rosterError ? (
        <div className="teamDetailRosterError">{rosterError}</div>
      ) : displayPlayers.length === 0 ? (
        <EmptyState message="该赛季暂无队员登记或出场记录" />
      ) : (
        <div className="teamDetailRosterGrid">
          {displayPlayers.map((player) => {
            const isSuspended = player.status === 'suspended';
            return (
              <div
                key={player.id || `${player.name}_${player.jerseyNumber}`}
                className={`teamDetailPlayerCard ${isSuspended ? 'teamDetailPlayerCard--suspended' : ''}`}
                onClick={() => { if (player.id) navigate(`/players/${player.id}`); }}
                title={isSuspended ? '该球员本赛季因红黄牌停赛' : '查看球员详情'}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && player.id) {
                    e.preventDefault();
                    navigate(`/players/${player.id}`);
                  }
                }}
              >
                {player.photo ? (
                  <img src={player.photo} alt={player.name} className="teamDetailPlayerPhoto" />
                ) : (
                  <div
                    className={`teamDetailPlayerPhotoPlaceholder ${isSuspended ? 'teamDetailPlayerPhotoPlaceholder--suspended' : ''}`}
                  >
                    {isSuspended ? '🛑' : '👕'}
                  </div>
                )}
                <div className="teamDetailPlayerInfo">
                  <span className={`teamDetailPlayerName ${isSuspended ? 'teamDetailPlayerName--suspended' : ''}`}>
                    {player.name}
                    {isSuspended && <span className="teamDetailPlayerBadge">停</span>}
                  </span>
                  <div className="teamDetailPlayerMeta">
                    <span className="teamDetailPlayerNumber">
                      {player.jerseyNumber ? `${player.jerseyNumber}号` : '无号'}
                    </span>
                    {((player.yellowCards ?? 0) > 0 || (player.redCards ?? 0) > 0) && (
                      <span className="teamDetailPlayerCards">
                        {(player.yellowCards ?? 0) > 0 && (
                          <span className="teamDetailPlayerCardStat teamDetailPlayerCardStat--yellow">
                            🟨{player.yellowCards}
                          </span>
                        )}
                        {(player.redCards ?? 0) > 0 && (
                          <span className="teamDetailPlayerCardStat teamDetailPlayerCardStat--red">
                            🟥{player.redCards}
                          </span>
                        )}
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
  );
};

export default TeamRoster;
