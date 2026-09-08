import { describe, it, expect } from 'vitest';
import type { Match } from '../../../types';
import { buildBracketModel, normalizeBracketRound } from './bracket-model';

/* ---------------------------- 最小 Match fixture --------------------------- */

function stubTeam(partial: { id: string; teamName: string; teamLogo?: string | null }): Match['homeTeam'] {
  const teamLogo =
    partial.teamLogo === undefined ? '' : partial.teamLogo === null ? '' : partial.teamLogo;
  return {
    id: partial.id,
    teamName: partial.teamName,
    teamDoctor: '',
    headCoach: '',
    teamLeader: '',
    coachPhone: '',
    leaderPhone: '',
    homeJerseyColor: '',
    awayJerseyColor: '',
    teamLogo,
    homeJersey: '',
    awayJersey: '',
    createdAt: '',
    updatedAt: '',
  };
}

function makeMatch(
  overrides: Partial<Match> & Pick<Match, 'id'>,
): Match {
  const baseHomeId = overrides.id + '-home';
  const baseAwayId = overrides.id + '-away';
  return {
    homeTeamId: baseHomeId,
    awayTeamId: baseAwayId,
    homeTeam: stubTeam({ id: baseHomeId, teamName: '主队' }),
    awayTeam: stubTeam({ id: baseAwayId, teamName: '客队' }),
    homeScore: 0,
    awayScore: 0,
    matchDate: '2026-09-01T10:00:00Z',
    location: '',
    status: 'scheduled',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  } as Match;
}

/* ------------------------------ normalizeBracketRound ---------------------- */

describe('normalizeBracketRound', () => {
  const cases: Array<[Partial<Match>, import('./bracket.types').BracketRoundKey | null]> = [
    [{ knockoutRound: 'QF' }, 'QF'],
    [{ knockoutRound: 'qf' }, 'QF'],
    [{ knockoutRound: 'quarter_finals' }, 'QF'],
    [{ knockoutRound: '1/4' }, 'QF'],
    [{ knockoutRound: '8强' }, 'QF'],
    [{ knockoutRound: 'R16' }, 'R16'],
    [{ knockoutRound: 'round_of_16' }, 'R16'],
    [{ knockoutRound: '1/8' }, 'R16'],
    [{ knockoutRound: 'SF' }, 'SF'],
    [{ knockoutRound: 'semi_finals' }, 'SF'],
    [{ knockoutRound: 'semifinals' }, 'SF'],
    [{ knockoutRound: '1/2' }, 'SF'],
    [{ knockoutRound: 'F' }, 'F'],
    [{ knockoutRound: 'FINAL' }, 'F'],
    [{ knockoutRound: '决赛' }, 'F'],
    [{ knockoutRound: '3RD' }, '3RD'],
    [{ knockoutRound: '3RD_PLACE' }, '3RD'],
    [{ knockoutRound: 'THIRD_PLACE' }, '3RD'],
    [{ knockoutRound: '34' }, '3RD'],
    [{ knockoutRound: '34名' }, '3RD'],
    [{ matchName: '三四名决赛' }, '3RD'],
    [{ matchName: '季军争夺战' }, '3RD'],
    [{ matchName: '3/4名' }, '3RD'],
    [{ knockoutRound: 'UNKNOWN_ROUND', matchName: '' }, null],
  ];

  it.each(cases)('matches %o -> %s', (partial, expected) => {
    const m = makeMatch({ id: 'n', ...(partial as Partial<Match>) });
    expect(normalizeBracketRound(m)).toBe(expected);
  });
});

/* -------------------------------- buildBracketModel ------------------------ */

describe('buildBracketModel', () => {
  it('空数组 -> 所有槽位为 null，布尔标记全为 false', () => {
    const model = buildBracketModel([]);
    expect(model.roundOf16).toHaveLength(8);
    expect(model.quarterFinals).toHaveLength(4);
    expect(model.semiFinals).toHaveLength(2);
    expect(model.final).toBeNull();
    expect(model.thirdPlace).toBeNull();
    expect(model.hasRoundOf16).toBe(false);
    expect(model.hasQuarterFinals).toBe(false);
    expect(model.champion).toBeNull();
    expect(model.roundOf16.every((s) => s.match === null)).toBe(true);
  });

  it('8 队 / 4 QF + 2 SF + Final + 3RD 正常归组', () => {
    const matches: Match[] = [
      ...[1, 2, 3, 4].map((i) =>
        makeMatch({ id: `qf${i}`, knockoutRound: 'QF', knockoutMatchIndex: i }),
      ),
      ...[1, 2].map((i) =>
        makeMatch({ id: `sf${i}`, knockoutRound: 'SF', knockoutMatchIndex: i }),
      ),
      makeMatch({ id: 'final', knockoutRound: 'F', knockoutMatchIndex: 1 }),
      makeMatch({ id: '3rd', knockoutRound: '3RD_PLACE' }),
    ];
    const model = buildBracketModel(matches);
    expect(model.hasQuarterFinals).toBe(true);
    expect(model.hasRoundOf16).toBe(false);
    expect(model.quarterFinals.map((s) => s.match?.id)).toEqual([
      'qf1', 'qf2', 'qf3', 'qf4',
    ]);
    expect(model.semiFinals.map((s) => s.match?.id)).toEqual(['sf1', 'sf2']);
    expect(model.final?.match?.id).toBe('final');
    expect(model.thirdPlace?.match?.id).toBe('3rd');
    expect(model.champion).toBeNull(); // 未结束
  });

  it('16 队 / 8 R16 + 4 QF -> hasRoundOf16 + hasQuarterFinals 均 true', () => {
    const matches: Match[] = [
      ...Array.from({ length: 8 }, (_, i) =>
        makeMatch({ id: `r16${i + 1}`, knockoutRound: 'R16', knockoutMatchIndex: i + 1 }),
      ),
      ...[1, 2, 3, 4].map((i) =>
        makeMatch({ id: `qf${i}`, knockoutRound: 'QF', knockoutMatchIndex: i }),
      ),
    ];
    const model = buildBracketModel(matches);
    expect(model.hasRoundOf16).toBe(true);
    expect(model.hasQuarterFinals).toBe(true);
    expect(model.roundOf16.map((s) => s.match?.id)).toEqual([
      'r161', 'r162', 'r163', 'r164', 'r165', 'r166', 'r167', 'r168',
    ]);
  });

  it('无 QF 仅 SF + Final + 3RD 的情况（hasQuarterFinals=false）', () => {
    const matches: Match[] = [
      makeMatch({ id: 'sf1', knockoutRound: 'SF', knockoutMatchIndex: 1 }),
      makeMatch({ id: 'sf2', knockoutRound: 'SF', knockoutMatchIndex: 2 }),
      makeMatch({ id: 'final', knockoutRound: 'F', knockoutMatchIndex: 1 }),
      makeMatch({ id: '3rd', knockoutRound: '34' }),
    ];
    const model = buildBracketModel(matches);
    expect(model.hasQuarterFinals).toBe(false);
    expect(model.hasRoundOf16).toBe(false);
    expect(model.semiFinals.map((s) => s.match?.id)).toEqual(['sf1', 'sf2']);
    expect(model.final?.match?.id).toBe('final');
    expect(model.thirdPlace?.match?.id).toBe('3rd');
  });

  it('决赛完成且主队胜 -> champion=主队', () => {
    const m = makeMatch({
      id: 'final1',
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'completed',
      homeScore: 2,
      awayScore: 1,
      homeTeam: stubTeam({ id: 'h', teamName: '冠军队', teamLogo: 'logo.png' }),
      awayTeam: stubTeam({ id: 'a', teamName: '亚军队' }),
    });
    const model = buildBracketModel([m]);
    expect(model.final?.match?.id).toBe('final1');
    expect(model.champion).toEqual({ teamName: '冠军队', teamLogo: 'logo.png' });
  });

  it('决赛客队胜 -> champion=客队', () => {
    const m = makeMatch({
      id: 'f',
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'completed',
      homeScore: 0,
      awayScore: 3,
      homeTeam: stubTeam({ id: 'h', teamName: '主队' }),
      awayTeam: stubTeam({ id: 'a', teamName: '客队' }),
    });
    const model = buildBracketModel([m]);
    expect(model.champion?.teamName).toBe('客队');
  });

  it('点球决胜 -> 用点球比分胜者作为 champion', () => {
    const m = makeMatch({
      id: 'f-pen',
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'completed',
      homeScore: 1,
      awayScore: 1,
      homePenaltyScore: 5,
      awayPenaltyScore: 4,
      homeTeam: stubTeam({ id: 'h', teamName: '点球主队' }),
      awayTeam: stubTeam({ id: 'a', teamName: '点球客队' }),
    });
    const model = buildBracketModel([m]);
    expect(model.champion?.teamName).toBe('点球主队');
  });

  it('未完赛决赛 -> champion=null', () => {
    const m = makeMatch({
      id: 'f-sched',
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'scheduled',
      homeScore: 0,
      awayScore: 0,
    });
    const model = buildBracketModel([m]);
    expect(model.champion).toBeNull();
  });

  it('缺失比赛（slot 缺项）-> 对应 slot.match=null，不影响其他轮次', () => {
    const matches: Match[] = [
      makeMatch({ id: 'sf1', knockoutRound: 'SF', knockoutMatchIndex: 1 }),
      // 缺少 sf2
      makeMatch({ id: 'final', knockoutRound: 'F', knockoutMatchIndex: 1 }),
    ];
    const model = buildBracketModel(matches);
    expect(model.semiFinals[0].match?.id).toBe('sf1');
    expect(model.semiFinals[1].match).toBeNull();
    expect(model.final?.match?.id).toBe('final');
  });

  it('乱序输入不影响 index 匹配', () => {
    const matches: Match[] = [
      makeMatch({ id: 'qf3', knockoutRound: 'QF', knockoutMatchIndex: 3 }),
      makeMatch({ id: 'qf1', knockoutRound: 'QF', knockoutMatchIndex: 1 }),
      makeMatch({ id: 'qf4', knockoutRound: 'QF', knockoutMatchIndex: 4 }),
      makeMatch({ id: 'qf2', knockoutRound: 'QF', knockoutMatchIndex: 2 }),
    ];
    const model = buildBracketModel(matches);
    expect(model.quarterFinals.map((s) => s.match?.id)).toEqual([
      'qf1', 'qf2', 'qf3', 'qf4',
    ]);
  });

  it('三四名多种命名兼容（3RD / THIRD_PLACE / 34名 / matchName）', () => {
    const variants = [
      { knockoutRound: '3RD', matchName: undefined },
      { knockoutRound: 'THIRD_PLACE', matchName: undefined },
      { knockoutRound: '34名', matchName: undefined },
      { knockoutRound: '', matchName: '赛季三四名决赛' },
    ];
    variants.forEach((v, i) => {
      const m = makeMatch({ id: `3rd-${i}`, ...(v as Partial<Match>) });
      const model = buildBracketModel([m]);
      expect(model.thirdPlace?.match?.id).toBe(`3rd-${i}`);
    });
  });

  it('knockoutMatchIndex 缺失但 index=1 时也能匹配（兼容旧数据）', () => {
    const m = makeMatch({
      id: 'qf-noindex',
      knockoutRound: 'QF',
      knockoutMatchIndex: undefined as unknown as number,
    });
    const model = buildBracketModel([m]);
    expect(model.quarterFinals[0].match?.id).toBe('qf-noindex');
  });

  it('输入非数组（null/undefined）安全处理为空', () => {
    expect(() => buildBracketModel(null as unknown as Match[])).not.toThrow();
    expect(() =>
      buildBracketModel(undefined as unknown as Match[]),
    ).not.toThrow();
    const model = buildBracketModel(null as unknown as Match[]);
    expect(model.hasRoundOf16).toBe(false);
    expect(model.hasQuarterFinals).toBe(false);
  });
});
