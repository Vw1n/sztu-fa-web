/**
 * usePredictionMatches — 比赛摘要列表加载
 *
 * 职责：根据 selectedSeasonId 加载摘要列表；
 * 区分 error vs empty（网络错误不显示为空数据）；
 * 赛季切换时竞态取消（旧请求结果丢弃）；
 * 提供 retry 入口。
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPredictionMatches } from '../../../api/predictions';
import type { PredictionMatch } from '../../../api/predictions';
import type { PredictionPagePhase } from '../prediction.types';

export interface UsePredictionMatches {
  matches: PredictionMatch[];
  phase: PredictionPagePhase;
  error: string | null;
  reload: () => void;
}

export function usePredictionMatches(
  selectedSeasonId: string,
): UsePredictionMatches {
  const [matches, setMatches] = useState<PredictionMatch[]>([]);
  const [phase, setPhase] = useState<PredictionPagePhase>('loading');
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const reqIdRef = useRef(0);

  const reload = useCallback(() => {
    setReloadTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const currentReqId = ++reqIdRef.current;

    // 赛季 ID 为空时不发请求（等待赛季加载完成）
    if (selectedSeasonId === undefined) {
      return;
    }

    const load = async () => {
      setPhase('loading');
      setError(null);

      try {
        const res = await fetchPredictionMatches(
          selectedSeasonId || undefined,
        );

        // 竞态取消：如果后续请求已发出，丢弃本次结果
        if (currentReqId !== reqIdRef.current) return;

        setMatches(res.data);
        setPhase(res.data.length === 0 ? 'empty' : 'ready');
      } catch (e) {
        if (currentReqId !== reqIdRef.current) return;
        const msg = e instanceof Error ? e.message : '加载比赛列表失败';
        setError(msg);
        setPhase('error');
      }
    };

    load();
  }, [selectedSeasonId, reloadTick]);

  return { matches, phase, error, reload };
}
