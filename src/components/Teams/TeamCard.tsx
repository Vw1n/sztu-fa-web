import type { Team } from '../../types';

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
        <span
          className="teamGenderBadge"
          style={{ background: team.gender === 'FEMALE' ? '#ff4d4f' : '#1890ff' }}
        >
          {team.gender === 'FEMALE' ? '女' : '男'}
        </span>
        {team.teamLogo ? (
          <img
            src={team.teamLogo}
            alt={team.teamName}
            className="teamImage"
            loading="lazy"
          />
        ) : (
          <div className="teamLogoPlaceholder">
            <span>{team.teamName.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="teamContent">
        <h3 className="teamName">{team.teamName}</h3>
      </div>
    </div>
  );
};

export default TeamCard;
