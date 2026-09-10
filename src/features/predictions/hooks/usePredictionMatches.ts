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
import type { PredictionMatch, PredictionChoice } from '../../../api/predictions';
import type { PredictionPagePhase } from '../prediction.types';

export interface UsePredictionMatches {
  matches: PredictionMatch[];
  phase: PredictionPagePhase;
  error: string | null;
  reload: () => void;
  /** 提交后乐观更新本地比赛列表中的 userPrediction */
  updateMatchPrediction: (matchId: string, choice: PredictionChoice) => void;
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

  const updateMatchPrediction = useCallback(
    (matchId: string, choice: PredictionChoice) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                userPrediction: {
                  id: m.userPrediction?.id || 'temp',
                  choice,
                  status: 'PENDING',
                  awardedPoints: 0,
                  submittedAt: new Date().toISOString(),
                },
              }
            : m,
        ),
      );
    },
    [],
  );

  return { matches, phase, error, reload, updateMatchPrediction };
}
