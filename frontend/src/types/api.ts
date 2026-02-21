export interface User {
  id: string;
  pseudo: string;
  email: string;
  score: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Flag {
  id: string;
  name: string;
  description: string;
  points: number;
  repoUrl: string;
  validated: boolean;
  validatedAt: string | null;
}

export interface SubmitFlagResponse {
  message: string;
  flagId: string;
  flagName: string;
  pointsEarned: number;
  validatedAt: string;
}

export interface RankingEntry {
  rank: number;
  id: string;
  pseudo: string;
  score: number;
  flagsValidated: {
    flagId: string;
    name: string;
    points: number;
    validatedAt: string;
  }[];
}

export interface RankingSnapshot {
  rank: number;
  userId: string;
  score: number;
}

export interface HistoryEvent {
  date: string;
  userId: string;
  pseudo: string;
  flagId: string;
  flagName: string;
  pointsEarned: number;
  rankingSnapshot: RankingSnapshot[];
}

export interface HistoryResponse {
  timeline: HistoryEvent[];
}
