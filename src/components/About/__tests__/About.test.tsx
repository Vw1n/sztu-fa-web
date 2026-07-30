import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import About from '../About';
import * as api from '../../../api';

vi.mock('../../../api', () => ({
  fetchMatches: vi.fn(),
  fetchPlayers: vi.fn(),
}));

describe('About Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading placeholder initially and updates on success', async () => {
    vi.mocked(api.fetchMatches).mockResolvedValue({
      data: [],
      total: 42,
      page: 1,
      limit: 1,
      stats: { total: 42, completed: 30, scheduled: 10, ongoing: 2 },
    });
    vi.mocked(api.fetchPlayers).mockResolvedValue({
      data: [],
      total: 150,
      page: 1,
      limit: 1,
    });

    render(<About />);

    // Initially displays '--' or year '2017'
    expect(screen.getByText('2017')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('displays "暂时无法获取" when API fails, never zero values', async () => {
    vi.mocked(api.fetchMatches).mockRejectedValue(new Error('Network error'));
    vi.mocked(api.fetchPlayers).mockRejectedValue(new Error('Network error'));

    render(<About />);

    await waitFor(() => {
      const failedElements = screen.getAllByText('暂时无法获取');
      expect(failedElements.length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
