import { describe, expect, it } from 'vitest';
import type { Match, MatchEvent } from '../../../types';
import {
  getEventSortKey,
  getPenaltyScore,
  getWinnerTeamId,
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
});
