import { useState } from 'react';
import type { Team } from '../../types';
import './TeamCard.css';

interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onClick: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isSelected, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const hasLogo = team.teamLogo && !imgError;

  return (
    <div
      className={`teamCard ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="teamImageWrapper" style={{ position: 'relative' }}>
        {hasLogo ? (
          <img
            src={team.teamLogo}
            alt={team.teamName}
            className="teamImage"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="teamImage teamLogoPlaceholder">
            <span className="teamLogoInitial">{team.teamName.charAt(0)}</span>
          </div>
        )}
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
