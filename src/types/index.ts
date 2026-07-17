export interface Team {
  id: string;
  teamName: string;
  teamDoctor: string;
  headCoach: string;
  teamLeader: string;
  coachPhone: string;
  leaderPhone: string;
  homeJerseyColor: string;
  awayJerseyColor: string;
  teamLogo: string;
  homeJersey: string;
  awayJersey: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
  groupTeams?: { seasonId: string; groupName: string }[];
}

export interface Player {
  id: string;
  name: string;
  studentId: string;
  jerseyNumber: string;
  photo: string;
  teamId: string;
  status?: string;
  yellowCards?: number;
  redCards?: number;
  team?: Team;
  createdAt: string;
  updatedAt: string;
}

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

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  goals?: Goal[];
  events?: MatchEvent[];
  mvpPlayerId?: string | null;
  mvpPlayerName?: string | null;
  seasonId?: string | null;
  lineups?: any[];
  stage?: string;
  groupName?: string;
  knockoutRound?: string;
  knockoutMatchIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  stats?: {
    total: number;
    completed: number;
    scheduled: number;
    ongoing: number;
  };
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface News {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage?: string | null;
  wechatUrl: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  name: string;
  status: string;
}
