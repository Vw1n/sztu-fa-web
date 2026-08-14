import { useState, useEffect, useCallback } from 'react';
import { fetchNews } from '../../../api';
import type { News } from '../../../types';
import { mockActivities, type MockActivity } from '../../../data/mockNews';

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
  const [allNews, setAllNews] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 一次性获取所有数据，前端分页：第一页4条，后续每页6条
  const isMockEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_NEWS_MOCK === 'true';

  const loadNewsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsMock(false);
    try {
      const res = await fetchNews(1, 100);
      if (res && res.data) {
        setAllNews(res.data);
        setTotal(res.total || res.data.length || 0);
      } else {
        setAllNews([]);
        setTotal(0);
      }
    } catch (err) {
      if (isMockEnabled) {
        console.warn('[useActivities] 接口请求失败，采用开发环境 Mock 数据');
        setAllNews([]);
        setTotal(mockActivities.length);
        setIsMock(true);
      } else {
        console.error('[useActivities] 获取前台资讯列表失败:', err);
        setError(err instanceof Error ? err.message : '获取活动资讯失败');
        setAllNews([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [isMockEnabled]);

  useEffect(() => {
    void loadNewsData();
  }, [loadNewsData]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(max-width: 1024px)');
    if (!mq) {
      return;
    }
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 前端分页切片：第一页0-4，第二页4-10，第三页10-16...
  const firstPageSize = isMobile ? Math.min(5, total) : 4;
  const laterPageSize = isMobile ? 4 : 6;
  const pageStart = currentPage === 1 ? 0 : firstPageSize + (currentPage - 2) * laterPageSize;
  const pageEnd = currentPage === 1 ? firstPageSize : pageStart + laterPageSize;

  const sortedNews = [...allNews].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const displayList: ActivityDisplay[] = (isMock
    ? [...mockActivities]
        .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    : sortedNews
  )
    .slice(pageStart, pageEnd)
    .map((n: News | MockActivity) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      image: ('coverImage' in n ? n.coverImage : n.image) || '/activity1.jpg',
      date: n.date,
      location: '微信公众号',
      category: n.category,
      wechatUrl: n.wechatUrl,
    }));

  // 总页数：第一页4个，后续每页6个
  const totalPages = total > firstPageSize ? 1 + Math.ceil((total - firstPageSize) / laterPageSize) : 1;

  return {
    displayList,
    currentPage,
    totalPages,
    setCurrentPage,
    loading,
    error,
    total,
    isMock,
    reloadNews: loadNewsData,
  };
};

