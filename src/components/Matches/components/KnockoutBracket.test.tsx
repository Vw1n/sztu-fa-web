import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { KnockoutBracket } from './KnockoutBracket';
import type { Match, Team } from '../../../types';

/* -------------------------------------------------------------------------- */
/*  Fixture 工具                                                              */
/* -------------------------------------------------------------------------- */

function stubTeam(
  id: string,
  name: string,
  logo = '',
): Team {
  return {
    id,
    teamName: name,
    teamDoctor: '',
    headCoach: '',
    teamLeader: '',
    coachPhone: '',
    leaderPhone: '',
    homeJerseyColor: '',
    awayJerseyColor: '',
    teamLogo: logo,
    homeJersey: '',
    awayJersey: '',
    createdAt: '',
    updatedAt: '',
  };
}

function makeMatch(
  id: string,
  overrides: Partial<Match>,
): Match {
  return {
    id,
    homeTeamId: id + '-h',
    awayTeamId: id + '-a',
    homeTeam: stubTeam(id + '-h', '主队' + id),
    awayTeam: stubTeam(id + '-a', '客队' + id),
    homeScore: 0,
    awayScore: 0,
    matchDate: '2026-09-01T10:00:00Z',
    location: '体育场',
    status: 'scheduled',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/*  测试数据：8 队 bracket（4 QF + 2 SF + Final + 3RD）                        */
/* -------------------------------------------------------------------------- */

function make8TeamBracket(): Match[] {
  const matches: Match[] = [
    ...[1, 2, 3, 4].map((i) =>
      makeMatch(`qf${i}`, {
        knockoutRound: 'QF',
        knockoutMatchIndex: i,
        homeTeam: stubTeam(`qf${i}-h`, `QF${i}主队`),
        awayTeam: stubTeam(`qf${i}-a`, `QF${i}客队`),
      }),
    ),
    makeMatch('sf1', {
      knockoutRound: 'SF',
      knockoutMatchIndex: 1,
      homeTeam: stubTeam('sf1-h', 'SF1主队'),
      awayTeam: stubTeam('sf1-a', 'SF1客队'),
    }),
    makeMatch('sf2', {
      knockoutRound: 'SF',
      knockoutMatchIndex: 2,
      homeTeam: stubTeam('sf2-h', 'SF2主队'),
      awayTeam: stubTeam('sf2-a', 'SF2客队'),
    }),
    makeMatch('final', {
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'completed',
      homeScore: 2,
      awayScore: 1,
      homeTeam: stubTeam('final-h', '冠军队', 'logo.png'),
      awayTeam: stubTeam('final-a', '亚军队'),
    }),
    makeMatch('3rd', {
      knockoutRound: '3RD',
      status: 'completed',
      homeScore: 1,
      awayScore: 0,
      homeTeam: stubTeam('3rd-h', '季军队'),
      awayTeam: stubTeam('3rd-a', '殿军队'),
    }),
  ];
  return matches;
}

/* -------------------------------------------------------------------------- */
/*  测试数据：16 队 bracket（8 R16 + 4 QF + 2 SF + Final）                     */
/* -------------------------------------------------------------------------- */

function make16TeamBracket(): Match[] {
  const r16 = Array.from({ length: 8 }, (_, i) =>
    makeMatch(`r16${i + 1}`, {
      knockoutRound: 'R16',
      knockoutMatchIndex: i + 1,
    }),
  );
  return [...r16, ...make8TeamBracket()];
}

/* -------------------------------------------------------------------------- */
/*  测试数据：仅 SF + Final + 3RD（无 QF）                                     */
/* -------------------------------------------------------------------------- */

function makeNoQFBracket(): Match[] {
  return [
    makeMatch('sf1', {
      knockoutRound: 'SF',
      knockoutMatchIndex: 1,
    }),
    makeMatch('sf2', {
      knockoutRound: 'SF',
      knockoutMatchIndex: 2,
    }),
    makeMatch('final', {
      knockoutRound: 'F',
      knockoutMatchIndex: 1,
      status: 'completed',
      homeScore: 3,
      awayScore: 2,
      homeTeam: stubTeam('final-h', '决赛主队'),
      awayTeam: stubTeam('final-a', '决赛客队'),
    }),
    makeMatch('3rd', {
      knockoutRound: '34名',
    }),
  ];
}

/* -------------------------------------------------------------------------- */
/*  测试                                                                      */
/* -------------------------------------------------------------------------- */

describe('KnockoutBracket 渲染快照', () => {
  it('loading=true -> 渲染 LoadingSpinner + 指定文案', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={[]}
        bracketLoading={true}
        onMatchClick={vi.fn()}
      />,
    );
    expect(screen.getByText('正在加载对阵图...')).toBeInTheDocument();
    expect(container.querySelector('.loadingContainer')).toBeInTheDocument();
    // 确认未渲染对阵图结构
    expect(container.querySelector('.bracketWrapper')).not.toBeInTheDocument();
  });

  it('空数据 -> 桌面 + 移动布局均渲染，所有槽位为"待定"占位卡', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={[]}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    // 桌面布局存在
    expect(container.querySelector('.bracketDesktop')).toBeInTheDocument();
    // 移动布局存在（空数据 hasQF=false → 使用 bracketTreeNoQFMobile）
    expect(
      container.querySelector('.bracketTreeMobile, .bracketTreeNoQFMobile'),
    ).toBeInTheDocument();
    // 占位卡包含"待定"文字
    const placeholders = screen.getAllByText('待定');
    expect(placeholders.length).toBeGreaterThanOrEqual(4);
  });

  it('8 队 bracket（有 QF）-> 桌面横向布局快照', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={make8TeamBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const desktop = container.querySelector('.bracketDesktop');
    expect(desktop).toBeInTheDocument();
    // 有 QF 时应使用横向布局（bracketContainer），而非竖向（bracketTreeNoQF）
    expect(desktop?.matches('.bracketContainer')).toBe(true);
    expect(desktop?.matches('.bracketTreeNoQF')).toBe(false);
    // 冠军卡片应渲染（决赛已完赛）
    expect(desktop?.querySelector('.championCard')).toBeInTheDocument();
    // "冠军队"出现在比赛卡和冠军卡中
    expect(screen.getAllByText('冠军队').length).toBeGreaterThanOrEqual(1);
    // 三四名区域
    expect(desktop?.querySelector('.thirdPlaceSection')).toBeInTheDocument();
  });

  it('16 队 bracket（有 R16 + QF）-> 桌面横向布局包含 R16 列', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={make16TeamBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const desktop = container.querySelector('.bracketDesktop');
    expect(desktop).toBeInTheDocument();
    // 有 R16 时应渲染 1/8 决赛列
    const r16Columns = desktop?.querySelectorAll('.r16-left-column, .r16-right-column');
    expect(r16Columns?.length).toBe(2);
    // 列头包含 "1/8 决赛"
    const r16Headers = screen.getAllByText('1/8 决赛');
    expect(r16Headers.length).toBeGreaterThanOrEqual(2);
  });

  it('无 QF bracket -> 桌面竖向布局快照', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={makeNoQFBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const desktop = container.querySelector('.bracketDesktop');
    expect(desktop).toBeInTheDocument();
    // 无 QF 时应使用竖向布局（元素自身即是 bracketTreeNoQF）
    expect(desktop?.matches('.bracketTreeNoQF')).toBe(true);
    expect(desktop?.matches('.bracketContainer')).toBe(false);
    // 冠军卡片应渲染
    expect(desktop?.querySelector('.championCard')).toBeInTheDocument();
    // 半决赛标题
    expect(screen.getAllByText('半决赛').length).toBeGreaterThanOrEqual(2);
  });

  it('点击比赛卡片触发 onMatchClick', () => {
    const onMatchClick = vi.fn();
    const matches = make8TeamBracket();
    render(
      <KnockoutBracket
        bracketMatches={matches}
        bracketLoading={false}
        onMatchClick={onMatchClick}
      />,
    );
    // 通过文字定位 QF1 主队名（桌面+移动都渲染，取第一个即桌面卡片）
    const teamEls = screen.getAllByText('QF1主队');
    expect(teamEls.length).toBeGreaterThanOrEqual(1);
    const card = teamEls[0].closest('.bracketMatchCard') as HTMLElement;
    expect(card).toBeTruthy();
    // 确认不是空占位卡
    expect(card.classList.contains('emptyCard')).toBe(false);
    fireEvent.click(card);
    expect(onMatchClick).toHaveBeenCalledTimes(1);
    // 传入的参数应是 Match 对象（含 id / homeTeamId 等字段）
    const clickedMatch = onMatchClick.mock.calls[0][0];
    expect(clickedMatch).toBeDefined();
    expect(clickedMatch).toHaveProperty('homeTeamId');
    expect(clickedMatch.id).toBe('qf1');
  });

  /* ------------------------------------------------------------------ */
  /*  内联快照：锁定关键 DOM 结构（防止拆分后布局回归）                      */
  /* ------------------------------------------------------------------ */

  it('8 队 bracket 桌面布局关键结构内联快照', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={make8TeamBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const desktop = container.querySelector('.bracketDesktop')!;
    // 锁定桌面端核心 class 结构（不锁定文字内容，避免脆弱）
    const keyClasses = Array.from(desktop.querySelectorAll('[class*="bracketColumn"], [class*="championCard"], [class*="thirdPlaceSection"]'))
      .map((el) => el.className)
      .filter(Boolean)
      .sort();
    expect(keyClasses).toMatchInlineSnapshot(`
      [
        "bracketColumn f-center-column centerColumn",
        "bracketColumn qf-left-column",
        "bracketColumn qf-right-column",
        "bracketColumn sf-left-column",
        "bracketColumn sf-right-column",
        "championCard",
        "thirdPlaceSection",
      ]
    `);
  });

  it('无 QF bracket 桌面布局关键结构内联快照', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={makeNoQFBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const desktop = container.querySelector('.bracketDesktop')!;
    const keyClasses = Array.from(desktop.querySelectorAll('[class*="noQf"], [class*="championCard"], [class*="thirdPlaceSection"]'))
      .map((el) => el.className)
      .filter(Boolean)
      .sort();
    expect(keyClasses).toMatchInlineSnapshot(`
      [
        "championCard",
        "noQfCell",
        "noQfCell noQfChampion",
        "noQfCell noQfFinal",
        "noQfCell noQfSemi",
        "noQfCell noQfSemi",
        "noQfCell noQfThird",
        "noQfConnector",
        "noQfSemis",
        "noQfStage noQfSemiStage",
        "noQfStage noQfSemiStage",
        "thirdPlaceSection noQfThirdSection",
      ]
    `);
  });

  it('8 队 bracket 移动布局关键结构内联快照', () => {
    const { container } = render(
      <KnockoutBracket
        bracketMatches={make8TeamBracket()}
        bracketLoading={false}
        onMatchClick={vi.fn()}
      />,
    );
    const mobile = container.querySelector('.bracketTreeMobile')!;
    expect(mobile).toBeInTheDocument();
    // 移动端有 treeRound 容器和 treePair/treeSingle
    const treeRounds = mobile.querySelectorAll('.treeRound');
    expect(treeRounds.length).toBeGreaterThanOrEqual(4);
    // 冠军卡片在移动端也存在
    expect(mobile.querySelector('.championCard')).toBeInTheDocument();
  });
});
