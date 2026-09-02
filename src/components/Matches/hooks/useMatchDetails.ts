import { useCallback, useRef, useState } from 'react';
import { fetchMatchById } from '../../../api';
import type { Match } from '../../../types';

const DETAILS_CACHE_TTL_MS = 30_000;

export const useMatchDetails = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const requestId = useRef(0);
  const cache = useRef(new Map<string, { match: Match; expiresAt: number }>());

  const loadDetails = useCallback(async (summary: Match, force = false) => {
    const currentRequestId = ++requestId.current;
    setSelectedMatch(summary);
    setDetailsError(null);

    const cached = cache.current.get(summary.id);
    if (!force && cached && cached.expiresAt > Date.now()) {
      setSelectedMatch(cached.match);
      setDetailsLoading(false);
      return;
    }

    setDetailsLoading(true);

    try {
      const details = await fetchMatchById(summary.id);
      if (requestId.current === currentRequestId) {
        cache.current.set(summary.id, {
          match: details,
          expiresAt: Date.now() + DETAILS_CACHE_TTL_MS,
        });
        setSelectedMatch(details);
      }
    } catch (error) {
      if (requestId.current === currentRequestId) {
        setDetailsError(error instanceof Error ? error.message : '获取比赛详情失败');
      }
    } finally {
      if (requestId.current === currentRequestId) setDetailsLoading(false);
    }
  }, []);

  const openDetails = useCallback(
    (summary: Match) => void loadDetails(summary),
    [loadDetails],
  );

  const closeDetails = useCallback(() => {
    requestId.current += 1;
    setSelectedMatch(null);
    setDetailsLoading(false);
    setDetailsError(null);
  }, []);

  const retryDetails = useCallback(() => {
    if (selectedMatch) void loadDetails(selectedMatch, true);
  }, [loadDetails, selectedMatch]);

  return {
    selectedMatch,
    detailsLoading,
    detailsError,
    openDetails,
    closeDetails,
    retryDetails,
  };
};
