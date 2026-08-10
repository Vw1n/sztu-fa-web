import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeagueStandings } from './LeagueStandings';
import type { CupStandings, LeagueStandings as LeagueStandingsType, StandingRow } from '../../../types';
import type { UserProfile } from '../../../api/auth';
import type { AuthContextType } from '../../../contexts/AuthContext.types';

vi.mock('../../../contexts', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'admin', username: 'admin', role: 'super_admin' },
    isAuthenticated: true,
  }),
}));

import { useAuth } from '../../../contexts';

const createAuthContext = (user: UserProfile): AuthContextType => ({
  user,
  token: 'test-token',
  isAuthenticated: true,
  loading: false,
  login: async () => ({ user, token: 'test-token' }),
  register: async () => ({ user, token: 'test-token' }),
  logout: () => undefined,
  refreshUser: async () => undefined,
});

describe('LeagueStandings Component', () => {
  const mockRows: StandingRow[] = [
    {
      teamId: 'team-1',
      teamName: '冠军球队',
      teamLogo: 'logo1.png',
      played: 3,
      won: 3,
      drawn: 0,
      lost: 0,
      goalsFor: 9,
      goalsAgainst: 1,
      goalDifference: 8,
      points: 9,
    },
    {
      teamId: 'team-2',
      teamName: '亚军球队',
      teamLogo: 'logo2.png',
      played: 3,
      won: 2,
      drawn: 0,
      lost: 1,
      goalsFor: 5,
      goalsAgainst: 3,
      goalDifference: 2,
      points: 6,
    },
  ];

  it('renders legacy StandingRow[] array format correctly without champion card', () => {
    render(<LeagueStandings standings={mockRows} statsLoading={false} />);

    expect(screen.getByText('冠军球队')).toBeInTheDocument();
    expect(screen.getByText('亚军球队')).toBeInTheDocument();
    expect(screen.queryByText('联赛冠军')).not.toBeInTheDocument();
  });

  it('renders LeagueStandings object format with champion card when league is finished', () => {
    const standingsObj: LeagueStandingsType = {
      type: 'LEAGUE',
      rows: mockRows,
      isFinished: true,
      champion: mockRows[0],
      championSource: 'AUTO',
      championResolved: true,
    };

    render(<LeagueStandings standings={standingsObj} statsLoading={false} />);

    expect(screen.getByText('联赛冠军')).toBeInTheDocument();
    expect(screen.getAllByText('冠军球队').length).toBeGreaterThan(0);
  });

  it('renders MANUAL champion tag when championSource is MANUAL', () => {
    const standingsObj: LeagueStandingsType = {
      type: 'LEAGUE',
      rows: mockRows,
      isFinished: true,
      champion: mockRows[0],
      championSource: 'MANUAL',
      championResolved: true,
    };

    render(<LeagueStandings seasonId="s-1" standings={standingsObj} statsLoading={false} />);

    expect(screen.getByText('(手动指定)')).toBeInTheDocument();
  });

  it('renders unresolved tie warning alert when isFinished=true and championResolved=false', () => {
    const standingsObj: LeagueStandingsType = {
      type: 'LEAGUE',
      rows: mockRows,
      isFinished: true,
      champion: null,
      championSource: null,
      championResolved: false,
    };

    render(<LeagueStandings seasonId="s-1" standings={standingsObj} statsLoading={false} />);

    expect(screen.getByText(/前列球队成绩完全并列/)).toBeInTheDocument();
  });

  it('renders admin champion management button for super_admin and hides it for regular user', () => {
    const standingsObj: LeagueStandingsType = {
      type: 'LEAGUE',
      rows: mockRows,
      isFinished: false,
      champion: null,
    };

    vi.mocked(useAuth).mockReturnValue(
      createAuthContext({ id: 'admin', username: 'admin', role: 'super_admin' }),
    );

    const { rerender } = render(<LeagueStandings seasonId="s-1" standings={standingsObj} statsLoading={false} />);
    expect(screen.getByText('⚙️ 管理冠军')).toBeInTheDocument();

    vi.mocked(useAuth).mockReturnValue(
      createAuthContext({ id: 'user1', username: 'user1', role: 'user' }),
    );

    rerender(<LeagueStandings seasonId="s-1" standings={standingsObj} statsLoading={false} />);
    expect(screen.queryByText('⚙️ 管理冠军')).not.toBeInTheDocument();
  });

  it('renders CupStandings group format correctly', () => {
    const cupObj: CupStandings = {
      type: 'CUP',
      groups: {
        A: mockRows,
      },
    };

    render(<LeagueStandings standings={cupObj} statsLoading={false} />);

    expect(screen.getByText('A 组')).toBeInTheDocument();
    expect(screen.getByText('冠军球队')).toBeInTheDocument();
  });
});
