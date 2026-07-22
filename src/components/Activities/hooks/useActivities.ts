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
  const pageSize = 6;
  const [newsList, setNewsList] = useState<News[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNewsData = async () => {
      setIsLoading(true);
      try {
        const res = await fetchNews(currentPage, pageSize);
        setNewsList(res.data || []);
        setTotal(res.total || 0);
        setUseMockData(false);
      } catch (err) {
        console.error('获取前台资讯列表失败，采用本地 Mock 数据 fallback:', err);
        setUseMockData(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadNewsData();
  }, [currentPage]);

  const fallbackStart = (currentPage - 1) * pageSize;
  const displayList: ActivityDisplay[] = useMockData
    ? mockActivities.slice(fallbackStart, fallbackStart + pageSize)
    : newsList.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        image: n.coverImage || '/activity1.jpg',
        date: n.date,
        location: '微信公众号',
        category: n.category,
        wechatUrl: n.wechatUrl,
      }));

  const totalPages = Math.max(1, Math.ceil((useMockData ? mockActivities.length : total) / pageSize));

  return { displayList, currentPage, totalPages, setCurrentPage, isLoading };
};
