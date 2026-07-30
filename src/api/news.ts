import type { News, PaginatedResponse } from '../types';
import { BASE_URL, apiFetch } from './http';

export async function fetchNews(
  page: number = 1,
  limit: number = 10,
  category?: string
): Promise<PaginatedResponse<News>> {
  let url = `${BASE_URL}/news?page=${page}&limit=${limit}`;
  if (category && category !== 'all') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const response = await apiFetch(url);
  if (!response.ok) throw new Error('获取活动资讯失败');
  return response.json();
}

