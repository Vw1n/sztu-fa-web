import { describe, it, expect } from 'vitest';
import {
  getMatchStageLabel,
  formatMatchTime,
  resolveMatchDisplayStatus,
  getMatchStatusLabel,
  getChoiceLabels,
  getUserChoiceText,
  getPointsBadge,
  getUserPredictionSummary,
  toSeasonOptions,
  getDefaultSeasonId,
} from './prediction-formatters';
import type { PredictionMatch } from '../../api/predictions';
import type { Season } from '../../api/seasons';

/* -------------------------------------------------------------------------- */
/*  Fixture 工具                                                              */
/* -------------------------------------------------------------------------- */

function makeMatch(overrides: Partial<PredictionMatch> = {}): PredictionMatch {
  return {
    id: 'm1',
    homeTeamId: 'h1',
    awayTeamId: 'a1',
    homeTeam: { id: 'h1', teamName: '工学院', teamLogo: null },
    awayTeam: { id: 'a1', teamName: '商学院', teamLogo: null },
    homeScore: 0,
    awayScore: 0,
    matchDate: '2026-09-15T10:00:00Z',
    location: '体育场',
    status: 'scheduled',
    stage: 'LEAGUE',
    groupName: null,
    knockoutRound: null,
    season: null,
    deadline: '2026-09-15T09:55:00Z',
    isClosed: false,
    userPrediction: null,
    ...overrides,
  };
}

function makeSeason(id: string, status: string, name = id): Season {
  return { id, name, status, type: undefined };
}

/* -------------------------------------------------------------------------- */
/*  getMatchStageLabel                                                        */
/* -------------------------------------------------------------------------- */

describe('getMatchStageLabel', () => {
  const cases: Array<[Partial<PredictionMatch>, string]> = [
    [{ stage: 'KNOCKOUT', knockoutRound: 'QF' },  '淘汰赛 · QF'],
    [{ stage: 'KNOCKOUT', knockoutRound: 'SF' }, '淘汰赛 · SF'],
    [{ stage: 'KNOCKOUT', knockoutRound: null }, '淘汰赛'],
    [{ stage: 'KNOCKOUT' },                       '淘汰赛'],
    [{ stage: 'GROUP', groupName: 'A' },          '小组赛 · A组'],
    [{ stage: 'GROUP', groupName: 'B' },          '小组赛 · B组'],
    [{ stage: 'GROUP', groupName: null },         '小组赛'],
    [{ stage: 'GROUP' },                          '小组赛'],
    [{ stage: 'LEAGUE' },                         '联赛阶段'],
    [{ stage: 'OTHER' },                          '联赛阶段'],
    [{},                                          '联赛阶段'],
  ];

  it.each(cases)('stage=%o -> %s', (partial, expected) => {
    const m = makeMatch(partial);
    expect(getMatchStageLabel(m)).toBe(expected);
  });
});

/* -------------------------------------------------------------------------- */
/*  formatMatchTime                                                           */
/* -------------------------------------------------------------------------- */

describe('formatMatchTime', () => {
  it('正常 ISO 字串 -> "M/D HH:mm"', () => {
    const result = formatMatchTime('2026-09-15T10:00:00Z');
    // 跨时区可能导致日期差 1，但格式应稳定包含 / 和 :
    expect(result).toMatch(/^\d{1,2}\/\d{1,2} \d{2}:\d{2}$/);
  });

  it('空字符串 -> "--"', () => {
    expect(formatMatchTime('')).toBe('--');
  });

  it('无效字串 -> "--"', () => {
    expect(formatMatchTime('not-a-date')).toBe('--');
  });

  it('undefined -> "--"', () => {
    expect(formatMatchTime(undefined as unknown as string)).toBe('--');
  });
});

/* -------------------------------------------------------------------------- */
/*  resolveMatchDisplayStatus                                                 */
/* -------------------------------------------------------------------------- */

describe('resolveMatchDisplayStatus', () => {
  const cases: Array<[Partial<PredictionMatch>, 'completed' | 'in_progress' | 'closed' | 'open']> = [
    // 已完赛
    [{ status: 'finished',   isClosed: true  }, 'completed'],
    [{ status: 'finished',   isClosed: false }, 'completed'],
    [{ status: 'completed',  isClosed: true  }, 'completed'],
    [{ status: 'completed',  isClosed: false }, 'completed'],
    // 比赛中
    [{ status: 'ongoing',    isClosed: true  }, 'in_progress'],
    [{ status: 'ongoing',    isClosed: false }, 'in_progress'],
    [{ status: 'in_progress',isClosed: true  }, 'in_progress'],
    [{ status: 'in_progress',isClosed: false }, 'in_progress'],
    // 已截止（未开始但 isClosed）
    [{ status: 'scheduled',  isClosed: true  }, 'closed'],
    [{ status: 'anything',   isClosed: true  }, 'closed'],
    // 开放助威
    [{ status: 'scheduled',  isClosed: false }, 'open'],
    [{ status: 'anything',   isClosed: false }, 'open'],
  ];

  it.each(cases)('status=%s isClosed=%s -> %s', (partial, expected) => {
    const m = makeMatch(partial);
    expect(resolveMatchDisplayStatus(m)).toBe(expected);
  });
});

/* -------------------------------------------------------------------------- */
/*  getMatchStatusLabel                                                       */
/* -------------------------------------------------------------------------- */

describe('getMatchStatusLabel', () => {
  it.each([
    ['completed',   '已完赛'],
    ['in_progress', '比赛中'],
    ['closed',      '助威已截止'],
    ['open',        '开放助威中'],
  ] as const)('%s -> %s', (display, expected) => {
    expect(getMatchStatusLabel(display)).toBe(expected);
  });
});

/* -------------------------------------------------------------------------- */
/*  getChoiceLabels                                                           */
/* -------------------------------------------------------------------------- */

describe('getChoiceLabels', () => {
  it('正常比赛 -> 简称 + 带球队名', () => {
    const m = makeMatch();
    const labels = getChoiceLabels(m);
    expect(labels.homeWin).toBe('主胜');
    expect(labels.draw).toBe('平局');
    expect(labels.awayWin).toBe('客胜');
    expect(labels.fullHome).toBe('工学院 胜');
    expect(labels.fullAway).toBe('商学院 胜');
  });

  it('homeTeam 为空 -> 降级为"主队"', () => {
    const m = makeMatch({ homeTeam: undefined as unknown as PredictionMatch['homeTeam'] });
    const labels = getChoiceLabels(m);
    expect(labels.fullHome).toBe('主队 胜');
  });

  it('awayTeam 为空 -> 降级为"客队"', () => {
    const m = makeMatch({ awayTeam: undefined as unknown as PredictionMatch['awayTeam'] });
    const labels = getChoiceLabels(m);
    expect(labels.fullAway).toBe('客队 胜');
  });
});

/* -------------------------------------------------------------------------- */
/*  getUserChoiceText                                                         */
/* -------------------------------------------------------------------------- */

describe('getUserChoiceText', () => {
  it('HOME_WIN -> "工学院 胜"', () => {
    expect(getUserChoiceText('HOME_WIN', makeMatch())).toBe('工学院 胜');
  });

  it('DRAW -> "打平"', () => {
    expect(getUserChoiceText('DRAW', makeMatch())).toBe('打平');
  });

  it('AWAY_WIN -> "商学院 胜"', () => {
    expect(getUserChoiceText('AWAY_WIN', makeMatch())).toBe('商学院 胜');
  });

  it('undefined -> ""', () => {
    expect(getUserChoiceText(undefined, makeMatch())).toBe('');
  });
});

/* -------------------------------------------------------------------------- */
/*  getPointsBadge                                                            */
/* -------------------------------------------------------------------------- */

describe('getPointsBadge', () => {
  it.each([
    ['CORRECT', '猜中 +3分', 'success'],
    ['WRONG',   '猜错 +0分', 'wrong'],
    ['PENDING', '待结算',     'pending'],
    ['VOID',    '比赛作废',   'void'],
  ] as const)('%s -> "%s" + %s', (status, label, variant) => {
    expect(getPointsBadge(status)).toEqual({ label, variant });
  });

  it('undefined -> null', () => {
    expect(getPointsBadge(undefined)).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*  getUserPredictionSummary                                                  */
/* -------------------------------------------------------------------------- */

describe('getUserPredictionSummary', () => {
  it('无用户预测 -> null', () => {
    expect(getUserPredictionSummary(makeMatch({ userPrediction: null }))).toBeNull();
  });

  it('CORRECT -> choiceText + 猜中徽章', () => {
    const m = makeMatch({
      userPrediction: {
        id: 'p1', choice: 'HOME_WIN', status: 'CORRECT',
        awardedPoints: 3, submittedAt: '2026-09-01T00:00:00Z',
      },
    });
    const summary = getUserPredictionSummary(m);
    expect(summary).not.toBeNull();
    expect(summary!.choiceText).toBe('工学院 胜');
    expect(summary!.points).toEqual({ label: '猜中 +3分', variant: 'success' });
  });

  it('PENDING -> choiceText + 待结算', () => {
    const m = makeMatch({
      userPrediction: {
        id: 'p1', choice: 'DRAW', status: 'PENDING',
        awardedPoints: 0, submittedAt: '2026-09-01T00:00:00Z',
      },
    });
    const summary = getUserPredictionSummary(m);
    expect(summary!.choiceText).toBe('打平');
    expect(summary!.points).toEqual({ label: '待结算', variant: 'pending' });
  });

  it('VOID -> 比赛作废', () => {
    const m = makeMatch({
      userPrediction: {
        id: 'p1', choice: 'AWAY_WIN', status: 'VOID',
        awardedPoints: 0, submittedAt: '2026-09-01T00:00:00Z',
      },
    });
    const summary = getUserPredictionSummary(m);
    expect(summary!.choiceText).toBe('商学院 胜');
    expect(summary!.points).toEqual({ label: '比赛作废', variant: 'void' });
  });
});

/* -------------------------------------------------------------------------- */
/*  toSeasonOptions                                                           */
/* -------------------------------------------------------------------------- */

describe('toSeasonOptions', () => {
  it('Season[] -> 精简选项', () => {
    const seasons = [
      makeSeason('s1', 'active', '2026春季'),
      makeSeason('s2', 'archived', '2025秋季'),
    ];
    const options = toSeasonOptions(seasons);
    expect(options).toEqual([
      { id: 's1', name: '2026春季', active: true },
      { id: 's2', name: '2025秋季', active: false },
    ]);
  });

  it('空数组 -> 空数组', () => {
    expect(toSeasonOptions([])).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/*  getDefaultSeasonId                                                         */
/* -------------------------------------------------------------------------- */

describe('getDefaultSeasonId', () => {
  it('仅 1 个 active -> 返回该 ID', () => {
    const seasons = [makeSeason('s1', 'active'), makeSeason('s2', 'archived')];
    expect(getDefaultSeasonId(seasons)).toBe('s1');
  });

  it('多个 active -> 取第一个', () => {
    const seasons = [makeSeason('s1', 'active'), makeSeason('s2', 'active')];
    expect(getDefaultSeasonId(seasons)).toBe('s1');
  });

  it('全部 inactive -> 返回 ""', () => {
    const seasons = [makeSeason('s1', 'archived'), makeSeason('s2', 'archived')];
    expect(getDefaultSeasonId(seasons)).toBe('');
  });

  it('空数组 -> 返回 ""', () => {
    expect(getDefaultSeasonId([])).toBe('');
  });
});
