import type { Team } from '../../types';
import './TeamCard.css';

interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onClick: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isSelected, onClick }) => {
  return (
    <div
      className={`teamCard ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="teamImageWrapper" style={{ position: 'relative' }}>
        <img
          src={team.teamLogo || 'https://picsum.photos/seed/team/300/200'}
          alt={team.teamName}
          className="teamImage"
          loading="lazy"
        />
      </div>
      <div className="teamContent">
        <h3 className="teamName">{team.teamName}</h3>
        <div className="teamInfo">
          <div className="teamInfoItem">
            <span className="teamInfoLabel">主教练</span>
            <span className="teamInfoValue">{team.headCoach || '暂无'}</span>
          </div>
          <div className="teamInfoItem">
            <span className="teamInfoLabel">队长</span>
            <span className="teamInfoValue">{team.teamLeader || '暂无'}</span>
          </div>
          <div className="teamInfoItem">
            <span className="teamInfoLabel">队医</span>
            <span className="teamInfoValue">{team.teamDoctor || '暂无'}</span>
          </div>
          <div className="teamInfoItem">
            <span className="teamInfoLabel">主场球衣</span>
            <span className="teamInfoValue">{team.homeJerseyColor || '暂无'}</span>
          </div>
        </div>
        <button className="teamDetailsButton">查看详情</button>
      </div>
    </div>
  );
};

export default TeamCard;
