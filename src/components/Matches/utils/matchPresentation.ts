export const matchStatusLabels: Record<string, string> = {
  scheduled: '即将开始',
  in_progress: '进行中',
  completed: '已结束',
};

export const matchStatusColors: Record<string, string> = {
  scheduled: 'var(--primary-light)',
  in_progress: 'var(--primary-color)',
  completed: 'var(--text-light)',
};

export const formatMatchDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
