import { useState } from 'react';
import { fetchPlayerCareer } from '../../../api';
import { buildCareerData, type CareerData } from '../utils/matchData';

export const usePlayerCareer = () => {
  const [careerPlayerId, setCareerPlayerId] = useState<string | null>(null);
  const [careerPlayerName, setCareerPlayerName] = useState('');
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [careerLoading, setCareerLoading] = useState(false);

  const openCareer = async (playerId: string, playerName: string) => {
    if (!playerId) return;
    setCareerPlayerId(playerId);
    setCareerPlayerName(playerName);
    setCareerLoading(true);
    setCareerData(null);
    try {
      const response = await fetchPlayerCareer(playerId);
      const data = buildCareerData(response);
      if (data) setCareerData(data);
      else console.error('返回数据格式不正确:', response);
    } catch (loadError) {
      console.error('加载球员生涯数据失败:', loadError);
    } finally {
      setCareerLoading(false);
    }
  };

  return {
    careerPlayerId,
    careerPlayerName,
    careerData,
    careerLoading,
    openCareer,
    closeCareer: () => setCareerPlayerId(null),
  };
};
