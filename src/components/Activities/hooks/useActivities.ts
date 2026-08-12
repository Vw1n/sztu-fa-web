import { useState, useEffect, useCallback } from 'react';
import { fetchNews } from '../../../api';
import type { News } from '../../../types';
import { mockActivities } from '../../../data/mockNews';

export interface ActivityDisplay {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  location: string;
  category: string;
  wechatUrl: string;
}

export const useActivities = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const limit = 6;
  const displayLimit = currentPage === 1 ? 5 : (isMobile ? 4 : 6);

  const isMockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_NEWS_MOCK === 'true';

  const loadNewsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsMock(false);
    try {
      const res = await fetchNews(currentPage, limit);
      if (res && res.data) {
        setNewsList(res.data);
        setTotal(res.total || 0);
      } else {
        setNewsList([]);
        setTotal(0);
      }
    } catch (err) {
      if (isMockEnabled) {
        console.warn('[useActivities] 接口请求失败，采用开发环境 Mock 数据');
        setNewsList([]);
        setTotal(mockActivities.length);
        setIsMock(true);
      } else {
        console.error('[useActivities] 获取前台资讯列表失败:', err);
        setError(err instanceof Error ? err.message : '获取活动资讯失败');
        setNewsList([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, isMockEnabled]);

  useEffect(() => {
    void loadNewsData();
  }, [loadNewsData]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const displayList: ActivityDisplay[] = isMock
    ? [...mockActivities]
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice((currentPage - 1) * limit, currentPage * limit)
        .slice(0, displayLimit)
    : newsList
        .map((n) => ({
          id: n.id,
          title: n.title,
          description: n.description,
          image: n.coverImage || '/activity1.jpg',
          date: n.date,
          location: '微信公众号',
          category: n.category,
          wechatUrl: n.wechatUrl,
        }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        .slice(0, displayLimit);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    displayList,
    currentPage,
    totalPages,
    setCurrentPage,
    loading,
    error,
    limit,
    total,
    isMock,
    reloadNews: loadNewsData,
  };
};

