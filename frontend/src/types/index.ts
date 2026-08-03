export type Role = 'Batsman' | 'Bowler' | 'All Rounder' | 'Wicket Keeper';
export type BattingStyle = 'Right Hand' | 'Left Hand';
export type BowlingStyle = 'Medium Pace' | 'Fast' | 'Spin' | 'Slow';
export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'PENDING' | 'MAYBE';
export type MatchStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  avatarUrl?: string;
  isCaptain: boolean;
  battingStyle: BattingStyle;
  bowlingStyle: BowlingStyle;
}

export interface Player extends User {
  matches: number;
  runs: number;
  wickets: number;
  availability: number;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  pitchType: string;
  parking: boolean;
  averageCost: string;
  mapsUrl: string;
  imageUrl: string;
  favorite: boolean;
}

export interface Match {
  id: string;
  opponent: string;
  opponentLogo?: string;
  date: string;
  time: string;
  venue?: Venue;
  status: MatchStatus;
  isHome: boolean;
  result?: 'WON' | 'LOST' | 'TIE' | 'ABANDONED';
  score?: string;
  mom?: string;
  captainNote?: string;
  groundImage?: string;
}

export interface AvailabilityEntry {
  matchId: string;
  playerId: string;
  playerName: string;
  status: AvailabilityStatus;
  respondedAt?: string;
}

export interface Announcement {
  id: string;
  author: string;
  authorRole: string;
  message: string;
  createdAt: string;
  pinned?: boolean;
}

export interface AttendanceRecord {
  playerId: string;
  playerName: string;
  played: number;
  total: number;
}