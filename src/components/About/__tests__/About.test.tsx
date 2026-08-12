import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import About from '../About';
import * as api from '../../../api';

vi.mock('../../../api', () => ({
  fetchPublicSummary: vi.fn(),
}));

describe('About Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading placeholder initially and updates on success', async () => {
    vi.mocked(api.fetchPublicSummary).mockResolvedValue({
      matchCount: 42,
      playerCount: 150,
      teamCount: 16,
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
    vi.mocked(api.fetchPublicSummary).mockRejectedValue(new Error('Network error'));

    render(<About />);

    await waitFor(() => {
      const failedElements = screen.getAllByText('暂时无法获取');
      expect(failedElements.length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
