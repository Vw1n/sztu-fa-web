/**
 * usePredictionSeason — 赛季加载与选择
 *
 * 职责：mount 时加载赛季列表；自动选中第一个 active 赛季；
 * 暴露精简选项 + 当前选择 + setter，不缓存比赛详情。
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchSeasons } from '../../../api/seasons';
import type { Season } from '../../../api/seasons';
import { toSeasonOptions, getDefaultSeasonId } from '../prediction-formatters';
import type { PredictionSeasonOption } from '../prediction.types';

export interface UsePredictionSeason {
  seasons: PredictionSeasonOption[];
  selectedSeasonId: string;
  setSelectedSeasonId: (id: string) => void;
  loadingSeasons: boolean;
}

export function usePredictionSeason(): UsePredictionSeason {
  const [seasons, setSeasons] = useState<PredictionSeasonOption[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [loadingSeasons, setLoadingSeasons] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const list: Season[] = await fetchSeasons();
        if (!mounted) return;
        setSeasons(toSeasonOptions(list));
        setSelectedSeasonId(getDefaultSeasonId(list));
      } catch {
        // 赛季加载失败不阻塞页面，选择器不显示
        if (mounted) setSeasons([]);
      } finally {
        if (mounted) setLoadingSeasons(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const handleSetSeasonId = useCallback((id: string) => {
    setSelectedSeasonId(id);
  }, []);

  return {
    seasons,
    selectedSeasonId,
    setSelectedSeasonId: handleSetSeasonId,
    loadingSeasons,
  };
}
