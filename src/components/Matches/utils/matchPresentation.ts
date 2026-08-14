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

const roundLabels: Record<string, string> = {
  R16: '十六分之一决赛',
  QF: '四分之一决赛',
  SF: '半决赛',
  F: '决赛',
  '3RD': '季军赛',
  '3RD_PLACE': '季军赛',
  THIRD_PLACE: '季军赛',
};

const stageLabels: Record<string, string> = {
  GROUP: '小组赛',
  KNOCKOUT: '淘汰赛',
  LEAGUE: '联赛阶段',
};

export const formatMatchInfo = (opts: {
  stage?: string;
  groupName?: string;
  knockoutRound?: string;
}): string => {
  const parts: string[] = [];

  if (opts.groupName) {
    parts.push(`${opts.groupName}组`);
  }

  if (opts.knockoutRound) {
    const label = roundLabels[opts.knockoutRound.toUpperCase()] ?? opts.knockoutRound;
    parts.push(label);
  } else if (!opts.groupName && opts.stage) {
    const label = stageLabels[opts.stage.toUpperCase()] ?? opts.stage;
    parts.push(label);
  }

  return parts.join(' · ');
};
