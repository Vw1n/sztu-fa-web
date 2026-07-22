import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeamDetail } from './hooks';
import { TeamInfo, TeamRoster } from './components';
import {
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  ImagePreviewModal,
} from '../../components/common';
import './TeamDetailPage.css';

const TeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    team,
    loading,
    error,
    notFound,
    seasons,
    selectedSeasonId,
    setSelectedSeasonId,
    displayPlayers,
    playersLoading,
    rosterError,
  } = useTeamDetail(id || '');

  if (loading) {
    return (
      <div className="teamDetailContainer">
        <LoadingSpinner message="正在加载球队详情..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="teamDetailContainer">
        <div className="teamDetailBackRow">
          <button className="teamDetailBack" onClick={() => navigate('/')}>
            ← 返回首页
          </button>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (notFound || !team) {
    return (
      <div className="teamDetailContainer">
        <div className="teamDetailBackRow">
          <button className="teamDetailBack" onClick={() => navigate('/')}>
            ← 返回首页
          </button>
        </div>
        <EmptyState
          message="球队不存在"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="teamDetailContainer">
      <div className="teamDetailBackRow">
        <button className="teamDetailBack" onClick={() => navigate('/')}>
          ← 返回首页
        </button>
      </div>

      <TeamInfo team={team} onPreviewImage={setPreviewImage} />

      <TeamRoster
        seasons={seasons}
        selectedSeasonId={selectedSeasonId}
        onSeasonChange={setSelectedSeasonId}
        displayPlayers={displayPlayers}
        playersLoading={playersLoading}
        rosterError={rosterError}
      />

      <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
};

export default TeamDetailPage;
