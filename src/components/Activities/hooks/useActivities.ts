import { useState, useEffect } from 'react';
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
  const limit = 6;

  useEffect(() => {
    const loadNewsData = async () => {
      setLoading(true);
      setError(null);
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
        console.error('获取前台资讯列表失败，采用本地 Mock 数据 fallback:', err);
        setNewsList([]);
        setTotal(mockActivities.length);
      } finally {
        setLoading(false);
      }
    };
    loadNewsData();
  }, [currentPage]);

  const hasNews = newsList.length > 0;

  const displayList: ActivityDisplay[] = hasNews
    ? newsList.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        image: n.coverImage || '/activity1.jpg',
        date: n.date,
        location: '微信公众号',
        category: n.category,
        wechatUrl: n.wechatUrl,
      }))
    : mockActivities.slice((currentPage - 1) * limit, currentPage * limit);

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
  };
};
