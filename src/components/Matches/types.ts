export type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';
export type StatusFilter = 'all' | 'scheduled' | 'in_progress' | 'completed';
export type MatchTab = 'matches' | 'standings' | 'bracket' | 'scorers' | 'assists';

export type { StandingRow } from '../../types';

export interface ScorerRow {
  playerId?: string;
  playerName: string;
  jerseyNumber: string;
  teamName: string;
  teamLogo: string;
  goals: number;
}

export interface AssistRow {
  playerId?: string;
  playerName: string;
  jerseyNumber: string;
  teamName: string;
  teamLogo: string;
  assists: number;
}
