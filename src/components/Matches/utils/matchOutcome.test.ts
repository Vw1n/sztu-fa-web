import { describe, expect, it } from 'vitest';
import type { Match, MatchEvent } from '../../../types';
import {
  getEventSortKey,
  getPenaltyScore,
  getWinnerTeamId,
  isHistoricalSeasonTeamIdMatch,
  isShootoutEvent,
} from './matchOutcome';

const createMatch = (overrides: Partial<Match> = {}): Match =>
  ({
    homeTeamId: 'home-team',
    awayTeamId: 'away-team',
    homeScore: 1,
    awayScore: 1,
    homePenaltyScore: null,
    awayPenaltyScore: null,
    events: [],
    ...overrides,
  }) as Match;

const createEvent = (overrides: Partial<MatchEvent>): MatchEvent =>
  ({
    eventType: 'goal',
    eventTime: '1',
    teamType: 'home',
    ...overrides,
  }) as MatchEvent;

describe('比赛结果与点球大战计算', () => {
  it('只把点球大战进球和罚失识别为点球大战事件', () => {
    expect(isShootoutEvent(createEvent({ eventType: 'penalty_shootout_goal' }))).toBe(true);
    expect(isShootoutEvent(createEvent({ eventType: 'penalty_shootout_miss' }))).toBe(true);
    expect(isShootoutEvent(createEvent({ eventType: 'penalty' }))).toBe(false);
  });

  it('优先使用服务端返回的点球比分', () => {
    const match = createMatch({
      homePenaltyScore: 5,
      awayPenaltyScore: 4,
      events: [createEvent({ eventType: 'penalty_shootout_goal', teamType: 'away' })],
    });

    expect(getPenaltyScore(match)).toEqual({ home: 5, away: 4 });
  });

  it('缺少汇总比分时根据点球事件计算比分', () => {
    const match = createMatch({
      events: [
        createEvent({ eventType: 'penalty_shootout_goal', teamType: 'home' }),
        createEvent({ eventType: 'penalty_shootout_miss', teamType: 'away' }),
        createEvent({ eventType: 'penalty_shootout_goal', teamType: 'home' }),
        createEvent({ eventType: 'penalty_shootout_goal', teamType: 'away' }),
      ],
    });

    expect(getPenaltyScore(match)).toEqual({ home: 2, away: 1 });
  });

  it('常规比分平局时根据点球比分判定胜者', () => {
    const match = createMatch({ homePenaltyScore: 4, awayPenaltyScore: 3 });
    expect(getWinnerTeamId(match)).toBe('home-team');
  });

  it('比分和点球比分都相同时不返回胜者', () => {
    const match = createMatch({ homePenaltyScore: 4, awayPenaltyScore: 4 });
    expect(getWinnerTeamId(match)).toBeNull();
  });

  it('补时时间按分钟后的小数排序，点球大战事件排在常规事件之后', () => {
    expect(getEventSortKey(createEvent({ eventTime: "90+3'" }))).toBe(90.03);
    expect(
      getEventSortKey(
        createEvent({
          eventType: 'penalty_shootout_goal',
          eventTime: undefined,
          shootoutOrder: 2,
        }),
      ),
    ).toBe(10002);
  });

  it('中场事件排在40和41分钟之间，非数字事件时间返回40.5', () => {
    expect(getEventSortKey(createEvent({ eventTime: 'HT' }))).toBe(40.5);
    expect(getEventSortKey(createEvent({ eventTime: '中场' }))).toBe(40.5);
    expect(getEventSortKey(createEvent({ eventTime: '40+3' }))).toBe(40.03);
    expect(getEventSortKey(createEvent({ eventTime: '41' }))).toBe(41);
    // 验证排序顺序：40 → 40+3(40.03) → HT(40.5) → 41
    const keys = [40, 40.03, 40.5, 41];
    expect(keys.slice().sort((a, b) => a - b)).toEqual([40, 40.03, 40.5, 41]);
  });
});

describe('isHistoricalSeasonTeamIdMatch 历史 ID 匹配验证', () => {
  it('正确判断全等、基础ID↔赛季ID、双赛季ID不符及边界空值', () => {
    // 1. 全等
    expect(isHistoricalSeasonTeamIdMatch('team-a', 'team-a')).toBe(true);
    expect(isHistoricalSeasonTeamIdMatch('team-a_season_123', 'team-a_season_123')).toBe(true);

    // 2. 基础 ID ↔ 赛季 ID
    expect(isHistoricalSeasonTeamIdMatch('team-a', 'team-a_season_2025')).toBe(true);
    expect(isHistoricalSeasonTeamIdMatch('team-a_season_2025', 'team-a')).toBe(true);

    // 3. 两个均带赛季后缀但完整 ID 不全等：必须判定为不匹配 (false)
    expect(isHistoricalSeasonTeamIdMatch('team-a_season_2025', 'team-a_season_2026')).toBe(false);

    // 4. 不同基础 ID
    expect(isHistoricalSeasonTeamIdMatch('team-a', 'team-b')).toBe(false);
    expect(isHistoricalSeasonTeamIdMatch('team-a_season_2025', 'team-b')).toBe(false);

    // 5. 空值 / null / undefined
    expect(isHistoricalSeasonTeamIdMatch(null, 'team-a')).toBe(false);
    expect(isHistoricalSeasonTeamIdMatch('team-a', '')).toBe(false);
    expect(isHistoricalSeasonTeamIdMatch(undefined, undefined)).toBe(false);
  });
});

describe('getWinnerTeamId 胜者解析多级优先级验证', () => {
  it('优先级1：常规比分胜者高于冲突的旧 winnerTeamId', () => {
    const match = createMatch({
      homeTeamId: 'team-home_season_2025',
      awayTeamId: 'team-away_season_2025',
      homeScore: 2,
      awayScore: 0,
      winnerTeamId: 'team-away', // 错误的旧 winnerTeamId
    });
    // 常规比分胜者 (homeTeamId) 覆盖 low-level winnerTeamId
    expect(getWinnerTeamId(match)).toBe('team-home_season_2025');
  });

  it('优先级2：常规平局且存在结构化点球比分时，点球胜者决胜', () => {
    const match = createMatch({
      homeTeamId: 'team-home_season_2025',
      awayTeamId: 'team-away_season_2025',
      homeScore: 1,
      awayScore: 1,
      homePenaltyScore: 4,
      awayPenaltyScore: 3,
      winnerTeamId: 'team-away',
    });
    expect(getWinnerTeamId(match)).toBe('team-home_season_2025');
  });

  it('优先级3：常规平局且无结构化点球比分时，由点球事件决胜', () => {
    const match = createMatch({
      homeTeamId: 'team-home_season_2025',
      awayTeamId: 'team-away_season_2025',
      homeScore: 0,
      awayScore: 0,
      homePenaltyScore: null,
      awayPenaltyScore: null,
      events: [
        createEvent({ eventType: 'penalty_shootout_goal', teamType: 'away' }),
        createEvent({ eventType: 'penalty_shootout_miss', teamType: 'home' }),
      ],
    });
    expect(getWinnerTeamId(match)).toBe('team-away_season_2025');
  });

  it('优先级4：1~3层无法决胜时，通过历史 ID 映射匹配 homeTeamId 或 awayTeamId', () => {
    const match = createMatch({
      homeTeamId: 'team-home_season_2025',
      awayTeamId: 'team-away_season_2025',
      homeScore: 0,
      awayScore: 0,
      homePenaltyScore: null,
      awayPenaltyScore: null,
      winnerTeamId: 'team-home', // 无后缀基础 ID 映射到 homeTeamId
    });
    expect(getWinnerTeamId(match)).toBe('team-home_season_2025');
  });

  it('优先级5：winnerTeamId 不属于任何参赛队或归一化冲突时返回 null', () => {
    const match = createMatch({
      homeTeamId: 'team-home_season_2025',
      awayTeamId: 'team-away_season_2025',
      homeScore: 0,
      awayScore: 0,
      winnerTeamId: 'some-random-team-id',
    });
    expect(getWinnerTeamId(match)).toBeNull();
  });
});
