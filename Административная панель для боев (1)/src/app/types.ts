export type CharacterTier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Character {
  id: string;
  name: string;
  tier: CharacterTier;
  rating: number;
  imageUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  wins: number;
  losses: number;
  wins1v1: number;
  losses1v1: number;
  wins2v2: number;
  losses2v2: number;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  players: Player[];
  name?: string;
}

export type MatchFormat = '1v1' | '2v2';
export type MatchStatus = 'pending' | 'in_progress' | 'completed';

export interface Match {
  id: string;
  format: MatchFormat;
  status: MatchStatus;
  team1: Team;
  team2: Team;
  winner?: Team;
  characterSelections?: {
    playerId: string;
    characterId: string;
  }[];
  date: Date;
  ratingChanges?: {
    playerId: string;
    change: number;
  }[];
}

export interface Tournament {
  id: string;
  name: string;
  format: MatchFormat;
  status: 'created' | 'in_progress' | 'completed';
  participants: Team[];
  matches: Match[];
  winner?: Team;
  currentRound: number;
  totalRounds: number;
  createdAt: Date;
}
