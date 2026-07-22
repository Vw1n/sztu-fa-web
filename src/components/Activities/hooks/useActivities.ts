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

  useEffect(() => {
    const loadNewsData = async () => {
      try {
        const res = await fetchNews(1, 6);
        if (res && res.data && res.data.length > 0) {
          setNewsList(res.data);
        }
      } catch (err) {
        console.error('获取前台资讯列表失败，采用本地 Mock 数据 fallback:', err);
      }
    };
    loadNewsData();
  }, []);

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
    : mockActivities;

  return { displayList };
};
