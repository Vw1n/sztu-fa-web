import type { TeamWithPlayers } from '../../../types';

interface TeamInfoProps {
  team: TeamWithPlayers;
  onPreviewImage: (url: string) => void;
}

const TeamInfo: React.FC<TeamInfoProps> = ({ team, onPreviewImage }) => {
  const genderLabel = team.gender === 'FEMALE' ? '女子组' : '男子组';
  const genderColor = team.gender === 'FEMALE' ? '#ff4d4f' : '#1890ff';

  return (
    <div className="teamDetailInfo">
      <div className="teamDetailHero">
        <img
          src={team.teamLogo || 'https://picsum.photos/seed/team/300/300'}
          alt={team.teamName}
          className="teamDetailLogo"
          onClick={() => onPreviewImage(team.teamLogo || 'https://picsum.photos/seed/team/300/300')}
        />
        <div className="teamDetailHeroText">
          <h1 className="teamDetailName">{team.teamName}</h1>
          <span
            className="teamDetailGender"
            style={{ background: genderColor }}
          >
            {genderLabel}
          </span>
        </div>
      </div>

      <div className="teamDetailMeta">
        <div className="teamDetailMetaItem">
          <span className="teamDetailMetaLabel">👔 主教练</span>
          <span className="teamDetailMetaValue">{team.headCoach || '暂无'}</span>
        </div>
        <div className="teamDetailMetaItem">
          <span className="teamDetailMetaLabel">🛡️ 队长</span>
          <span className="teamDetailMetaValue">{team.teamLeader || '暂无'}</span>
        </div>
        <div className="teamDetailMetaItem">
          <span className="teamDetailMetaLabel">💊 队医</span>
          <span className="teamDetailMetaValue">{team.teamDoctor || '暂无'}</span>
        </div>
        <div className="teamDetailMetaItem">
          <span className="teamDetailMetaLabel">📞 教练电话</span>
          <span className="teamDetailMetaValue">{team.coachPhone || '暂无'}</span>
        </div>
        <div className="teamDetailMetaItem">
          <span className="teamDetailMetaLabel">📞 队长电话</span>
          <span className="teamDetailMetaValue">{team.leaderPhone || '暂无'}</span>
        </div>
      </div>

      <div className="teamDetailJerseys">
        <div className="teamDetailJersey">
          <img
            src={team.homeJersey || 'https://picsum.photos/seed/jersey_home/200/300'}
            alt="主场球衣"
            className="teamDetailJerseyImg"
            onClick={() => onPreviewImage(team.homeJersey || 'https://picsum.photos/seed/jersey_home/200/300')}
          />
          <span className="teamDetailJerseyLabel">
            🏠 主场球衣
            {team.homeJerseyColor && (
              <span className="teamDetailJerseyColor">（{team.homeJerseyColor}）</span>
            )}
          </span>
        </div>
        <div className="teamDetailJersey">
          <img
            src={team.awayJersey || 'https://picsum.photos/seed/jersey_away/200/300'}
            alt="客场球衣"
            className="teamDetailJerseyImg"
            onClick={() => onPreviewImage(team.awayJersey || 'https://picsum.photos/seed/jersey_away/200/300')}
          />
          <span className="teamDetailJerseyLabel">
            🏟️ 客场球衣
            {team.awayJerseyColor && (
              <span className="teamDetailJerseyColor">（{team.awayJerseyColor}）</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamInfo;
