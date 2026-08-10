export interface Season {
  id: string;
  name: string;
  status: string;
  type?: string;
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface CupStandings {
  type: 'CUP';
  groups: Record<string, StandingRow[]>;
}

export interface SeasonStats {
  scorers?: Array<{ playerId?: string; playerName: string; jerseyNumber: string; teamName: string; teamLogo: string; goals: number; penaltyGoals?: number }>;
  assists?: Array<{ playerId?: string; playerName: string; jerseyNumber: string; teamName: string; teamLogo: string; assists: number }>;
  cards?: unknown[];
}
