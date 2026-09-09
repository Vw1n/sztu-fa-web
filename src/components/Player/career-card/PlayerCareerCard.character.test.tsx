import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PlayerCareerCard } from './PlayerCareerCard';
import type { CareerData } from '../../Matches/utils/matchData';

// ============================================================================
// fixture：模拟真实业务数据，结构严格对齐 CareerData 类型
// ============================================================================
const mockCareerData: CareerData = {
  jerseyNumber: '11',
  teamName: '校足球队A队',
  status: 'suspended', // 停赛状态，用于验证停赛标签
  photo: null, // 无头像，触发头像降级（显示球衣号渐变圆）
  summary: {
    totalMatches: 12,
    totalGoals: 5,
    totalAssists: 7, // 选7避免和赛季表格的进球数3重复
    totalYellow: 4,
    totalRed: 1,
  },
  seasons: [
    {
      seasonName: '2025赛季',
      matchesPlayed: 6,
      goals: 2,
      assists: 1,
      yellowCards: 2,
      redCards: 0,
    },
    {
      seasonName: '2024赛季',
      matchesPlayed: 6,
      goals: 3,
      assists: 2,
      yellowCards: 2,
      redCards: 1,
    },
  ],
};

// 有头像的数据，用于验证图片渲染分支
const mockCareerDataWithPhoto: CareerData = {
  ...mockCareerData,
  photo: 'https://example.com/avatar.jpg',
  status: 'active', // 非停赛，验证停赛标签不出现
};

const mockOnClose = vi.fn();

// ============================================================================
// Characterization Test Suite —— 重构前行为锁定基准
// 重构拆分后，所有用例必须依然全部通过，快照不得随意更新
// ============================================================================
describe('PlayerCareerCard ｜ 行为锁定测试（重构基准）', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. 显示控制：careerPlayerId 为 null 时不渲染任何内容
  // --------------------------------------------------------------------------
  test('careerPlayerId 为 null 时，组件返回 null，不渲染任何 DOM', () => {
    const { container } = render(
      <PlayerCareerCard
        careerPlayerId={null}
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  // --------------------------------------------------------------------------
  // 2. Loading 状态
  // --------------------------------------------------------------------------
  test('careerLoading 为 true 时，显示加载文案和 spinner', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={null}
        careerLoading={true}
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText('正在生成赛季球星卡...')).toBeInTheDocument();
    // spinner 元素存在
    expect(document.querySelector('.loadingSpinner')).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 3. 空数据状态（不 loading 且 careerData 为 null）
  // --------------------------------------------------------------------------
  test('careerData 为 null 且不 loading 时，显示"无法加载赛季数据"', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={null}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText('无法加载赛季数据')).toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 4. 完整渲染：头部信息（姓名、球队、停赛标签、球衣号降级头像）
  // --------------------------------------------------------------------------
  test('完整数据渲染：球员姓名、球队名称、停赛标签正确显示', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('校足球队A队')).toBeInTheDocument();
    expect(screen.getByText('🛑 停赛中')).toBeInTheDocument();
  });

  test('无 photo 时，头像区域显示球衣号（降级分支）', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData} // photo: null
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    // 降级头像显示球衣号 '11'
    expect(screen.getByText('11')).toBeInTheDocument();
    // 不应该有 img 标签
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });

  test('有 photo 时，渲染 img 标签且不显示停赛标签', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerDataWithPhoto}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', '张三');
    // status 为 active，停赛标签不应出现
    expect(screen.queryByText('🛑 停赛中')).not.toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 5. 统计面板：出场/进球/助攻/红黄牌
  // --------------------------------------------------------------------------
  test('统计面板显示正确的汇总数值（出场、进球、助攻、红黄牌）', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    // 标签文字
    expect(screen.getByText('出场数')).toBeInTheDocument();
    expect(screen.getByText('总进球')).toBeInTheDocument();
    expect(screen.getByText('总助攻')).toBeInTheDocument();
    expect(screen.getByText('红黄牌')).toBeInTheDocument();
    // 数值（注意：红黄牌是 🟨4 🟥1 连在一起，用正则匹配）
    expect(screen.getByText('12')).toBeInTheDocument(); // 出场
    expect(screen.getByText('5')).toBeInTheDocument(); // 进球
    expect(screen.getByText('7')).toBeInTheDocument(); // 助攻
    expect(screen.getByText(/🟨4/)).toBeInTheDocument(); // 黄牌
    expect(screen.getByText(/🟥1/)).toBeInTheDocument(); // 红牌
  });

  // --------------------------------------------------------------------------
  // 6. 赛季明细表格
  // --------------------------------------------------------------------------
  test('赛季表格渲染表头和所有赛季行，数据正确', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    // 表头
    expect(screen.getByText('赛季')).toBeInTheDocument();
    expect(screen.getByText('出场')).toBeInTheDocument();
    expect(screen.getByText('进球')).toBeInTheDocument();
    expect(screen.getByText('助攻')).toBeInTheDocument();
    expect(screen.getByText('黄牌/红牌')).toBeInTheDocument();
    // 标题
    expect(screen.getByText('📊 当前赛季数据')).toBeInTheDocument();
    // 两行赛季数据
    expect(screen.getByText('2025赛季')).toBeInTheDocument();
    expect(screen.getByText('2024赛季')).toBeInTheDocument();
    // 2025赛季：出场6 进球2 助攻1
    // 2024赛季：出场6 进球3 助攻2
    // 注意数值有重复（两个6），用 getAllByText 验证数量
    const sixes = screen.getAllByText('6');
    expect(sixes).toHaveLength(2); // 两个赛季各出场6次
  });

  test('赛季行顺序：2025赛季 在 2024赛季 之前（按数据原始顺序渲染）', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    const seasonCells = screen.getAllByText(/202[45]赛季/);
    expect(seasonCells[0]).toHaveTextContent('2025赛季');
    expect(seasonCells[1]).toHaveTextContent('2024赛季');
  });

  // --------------------------------------------------------------------------
  // 7. 关闭交互：关闭按钮 + 点击遮罩
  // --------------------------------------------------------------------------
  test('点击关闭按钮调用 onClose', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    const closeBtn = document.querySelector('.matchModalClose');
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('点击遮罩层（overlay）调用 onClose', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    const overlay = document.querySelector('.matchModalOverlay');
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('点击 modal 内部内容区域不触发 onClose（stopPropagation）', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    const modal = document.querySelector('.careerCardModal');
    expect(modal).toBeInTheDocument();
    fireEvent.click(modal!);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // 8. 渲染阶段不调用 onClose
  // --------------------------------------------------------------------------
  test('组件渲染时不会自动调用 onClose', () => {
    render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // 9. 快照：锁定完整 DOM 结构
  // --------------------------------------------------------------------------
  test('快照：完整数据渲染的 DOM 结构锁定为重构基准', () => {
    const { asFragment } = render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={mockCareerData}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('快照：loading 状态 DOM 结构', () => {
    const { asFragment } = render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={null}
        careerLoading={true}
        onClose={mockOnClose}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('快照：空数据状态 DOM 结构', () => {
    const { asFragment } = render(
      <PlayerCareerCard
        careerPlayerId="player-001"
        careerPlayerName="张三"
        careerData={null}
        careerLoading={false}
        onClose={mockOnClose}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
