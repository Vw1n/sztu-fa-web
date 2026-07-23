import type { Team } from './team';
import type { Player } from './player';

export interface Goal {
  id: string;
  matchId: string;
  playerId?: string | null;
  playerName: string;
  jerseyNumber: string;
  goalTime: string;
  teamType: 'home' | 'away';
  createdAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  eventTime: string;
  eventType: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card' | 'yellow_to_red' | 'substitution' | 'penalty_shootout_goal' | 'penalty_shootout_miss' | 'penalty_miss';
  phase?: 'REGULAR' | 'EXTRA_TIME' | 'SHOOTOUT';
  shootoutRound?: number;
  shootoutOrder?: number;
  playerId?: string | null;
  playerName?: string | null;
  jerseyNumber?: string | null;
  subPlayerId?: string | null;
  subPlayerName?: string | null;
  subJerseyNumber?: string | null;
  assistPlayerId?: string | null;
  assistPlayerName?: string | null;
  assistJerseyNumber?: string | null;
  description: string;
  teamType: 'home' | 'away';
  createdAt: string;
}

export interface MatchLineup {
  id?: string;
  playerId: string;
  teamType: 'home' | 'away';
  lineupType: 'starting' | 'substitute';
  player?: Pick<Player, 'id' | 'name' | 'jerseyNumber' | 'photo'>;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  winnerTeamId?: string | null;
  decidedBy?: 'REGULAR' | 'EXTRA_TIME' | 'PENALTIES' | null;
  matchDate: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  goals?: Goal[];
  events?: MatchEvent[];
  mvpPlayerId?: string | null;
  mvpPlayerName?: string | null;
  seasonId?: string | null;
  lineups?: MatchLineup[];
  stage?: string;
  groupName?: string;
  knockoutRound?: string;
  knockoutMatchIndex?: number;
  createdAt: string;
  updatedAt: string;
}
