// ============ 2026 FIFA World Cup Type Definitions ============
// All simulation / placeholder data is explicitly marked as such.

export type Confederation = 'UEFA' | 'CONMEBOL' | 'AFC' | 'CAF' | 'CONCACAF' | 'OFC';
export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface Team {
  id: string;            // "ARG"
  name: string;          // "Argentina"
  nameZh: string;        // "阿根廷"
  group: string;         // "J"
  confederation: Confederation;
  fifaRank: number;
  flag: string;          // emoji
  stats: TeamStats;
}

export interface TeamStats {
  attack: number;        // 0-100
  defense: number;
  possession: number;
  setPiece: number;
  mentality: number;
}

export interface Match {
  id: string;
  stage: MatchStage;
  group?: string;
  date: string;          // ISO
  city: string;
  stadium: string;
  home: string;          // teamId
  away: string;
  status: MatchStatus;
  score?: { home: number; away: number };
  stats?: MatchStats;
  knockoutSlot?: string; // e.g. "W49" for bracket positioning
}

export interface MatchStats {
  possession: [number, number];
  shots: [number, number];
  shotsOnTarget: [number, number];
  corners: [number, number];
  passAccuracy: [number, number];
}

export interface Prediction {
  userId: string;
  matchId: string;
  predHome: number;
  predAway: number;
  pointsEarned?: number;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  championPick?: string;     // teamId
  darkHorsePick?: string;    // teamId
  goldenBootPick?: string;   // playerId
  bestThirdPick?: string;    // teamId
  createdAt: number;
}

export interface City {
  name: string;
  country: 'USA' | 'MEX' | 'CAN';
  lat: number;
  lng: number;
}

export interface Player {
  id: string;
  name: string;
  nameZh: string;
  teamId: string;
  number: number;
  position: Position;
  age: number;
  club: string;
  goals: number;
  assists: number;
  isStarter: boolean;
}

export interface Lineup {
  matchId: string;
  teamId: string;
  formation: string;    // "4-3-3"
  starters: string[];   // 11 playerIds in formation order
  bench: string[];
}

export interface GroupStanding {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export interface AnalysisResult {
  winProb: number;
  drawProb: number;
  loseProb: number;
  scenarios: ScenarioResult[];
}

export interface ScenarioResult {
  result: 'win' | 'draw' | 'loss';
  advanceProb: number;   // probability of advancing (either top-2 or best third)
  topTwoProb: number;
  bestThirdProb: number;
  eliminatedProb: number;
  description: string;
}

export interface KnockoutPath {
  seed: 1 | 2 | 3;
  rounds: KnockoutRound[];
  championshipProb: number;
}

export interface KnockoutRound {
  stage: MatchStage;
  opponentId: string | null;
  opponentName: string | null;
  winProb: number;
}

// Historical data
export interface HistoricalData {
  year: number;
  teams: number;
  matches: number;
  prizeMoney: number;     // in USD
  totalGoals: number;
}

// Settings
export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'zh' | 'en';
  scoring: {
    exactScore: number;      // default 5
    correctGoalDiff: number; // default 3
    correctResult: number;   // default 1
  };
}
