import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PredictionNavTabs from './PredictionNavTabs';

describe('PredictionNavTabs Component', () => {
  it('正确渲染三个子页面 Tab 选项且高亮当前激活项', () => {
    render(
      <MemoryRouter initialEntries={['/leaderboard']}>
        <PredictionNavTabs />
      </MemoryRouter>
    );

    const lobbyLink = screen.getByText('竞猜大厅').closest('a');
    const rankLink = screen.getByText('排行榜').closest('a');
    const myLink = screen.getByText('我的竞猜').closest('a');

    expect(lobbyLink).toHaveAttribute('href', '/predictions');
    expect(rankLink).toHaveAttribute('href', '/leaderboard');
    expect(myLink).toHaveAttribute('href', '/my-predictions');

    expect(rankLink).toHaveClass('active');
    expect(lobbyLink).not.toHaveClass('active');
    expect(myLink).not.toHaveClass('active');
  });

  it('显式传入 activeTab 时正确高亮对应选项', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PredictionNavTabs activeTab="my-predictions" />
      </MemoryRouter>
    );

    const myLink = screen.getByText('我的竞猜').closest('a');
    expect(myLink).toHaveClass('active');
  });
});
