import type { Team } from '../../types';
import './TeamCard.css';
import { useResilientImage } from './useResilientImage';

interface TeamCardProps {
  team: Team;
  isSelected: boolean;
  onClick: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, isSelected, onClick }) => {
  const logo = useResilientImage(team.teamLogo);
  const hasLogo = Boolean(team.teamLogo && !logo.failed);

  return (
    <div
      className={`teamCard ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* 顶部横幅区：参考切尔西样式 — 水印背景 + 左侧文字 + 右侧圆形队徽 */}
      <div className="teamBanner">
        {/* 半透明水印队徽 */}
        {hasLogo && (
          <img
            src={logo.src}
            alt=""
            className="teamBannerWatermark"
            aria-hidden="true"
          />
        )}

        <div className="teamBannerContent">
          {/* 左侧队名 */}
          <div className="teamBannerLeft">
            <h3 className="teamBannerName">{team.teamName}</h3>
          </div>

          {/* 右侧圆形队徽 */}
          <div className="teamBannerRight">
            {hasLogo ? (
              <img
                src={logo.src}
                alt={team.teamName}
                className="teamBannerLogo"
                loading="lazy"
                onError={logo.onError}
              />
            ) : (
              <div className="teamBannerLogo teamLogoPlaceholder teamBannerLogoPlaceholder">
                <span className="teamLogoInitial">{team.teamName.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下方信息区 */}
      <div className="teamContent">
        <div className="teamInfo">
          <div className="teamInfoItem">
            <span className="teamInfoLabel">主教练</span>
            <span className="teamInfoValue">{team.headCoach || '暂无'}</span>
          </div>
          <div className="teamInfoItem">
            <span className="teamInfoLabel">领队</span>
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
