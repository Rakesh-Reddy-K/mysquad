import axios from 'axios';
import type {
  Announcement,
  AttendanceRecord,
  AvailabilityEntry,
  AvailabilityStatus,
  Match,
  Player,
  Venue,
} from '@/types';

/* ------------------------------------------------------------------ */
/* HTTP client                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

const http = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('mysquad_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const detail =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.response?.data ??
      error?.message ??
      'Something went wrong';
    const message =
      typeof detail === 'string' ? detail : JSON.stringify(detail);
    if (status === 401 || status === 403) {
      localStorage.removeItem('mysquad_token');
      // Redirect to login when the token is missing, expired, or invalid
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  },
);

/* ------------------------------------------------------------------ */
/* Shape adapters                                                      */
/* ------------------------------------------------------------------ */

function mapResult(result?: string | null): Match['result'] {
  if (!result) return undefined;
  const valid: Match['result'][] = ['WON', 'LOST', 'TIE', 'ABANDONED'];
  return valid.includes(result as Match['result']) ? (result as Match['result']) : undefined;
}

function mapMatch(m: Record<string, any>): Match {
  const { result, ...rest } = m;
  return { ...rest, result: mapResult(result) } as Match;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

interface AuthResponse {
  token: string;
  id: string;
  name: string;
  phone: string;
  role: string;
  isCaptain: boolean;
}

export async function login(
  phone: string,
  password: string,
): Promise<{ token: string; user: Player }> {
  const { data } = await http.post<AuthResponse>('/auth/login', { phone, password });
  localStorage.setItem('mysquad_token', data.token);
  const user = await getCurrentUser();
  return { token: data.token, user };
}

export interface RegisterInput {
  name: string;
  phone: string;
  password: string;
}

export async function register(input: RegisterInput): Promise<{ token: string; user: Player }> {
  const { data } = await http.post<AuthResponse>('/auth/register', input);
  localStorage.setItem('mysquad_token', data.token);
  const user = await getCurrentUser();
  return { token: data.token, user };
}

export async function logout(): Promise<void> {
  localStorage.removeItem('mysquad_token');
}

export async function getCurrentUser(): Promise<Player> {
  const { data } = await http.get('/me');
  return data as Player;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await http.put('/me/password', { currentPassword, newPassword });
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export async function getDashboardData() {
  const { data } = await http.get('/dashboard');
  return {
    upcomingMatch: data.upcomingMatch ? mapMatch(data.upcomingMatch) : undefined,
    availability: data.availability,
    recentAnnouncement: data.recentAnnouncement,
    weather: data.weather,
  };
}

/* ------------------------------------------------------------------ */
/* Matches                                                             */
/* ------------------------------------------------------------------ */

export async function getMatches(): Promise<Match[]> {
  const { data } = await http.get('/matches');
  return (data as Record<string, any>[]).map(mapMatch);
}

export async function getMatchById(id: string): Promise<Match> {
  const { data } = await http.get(`/matches/${id}`);
  return mapMatch(data);
}

export interface CreateMatchInput {
  opponent: string;
  date: string;
  time: string;
  venueId?: number;
  captainNote?: string;
}

export async function createMatch(input: CreateMatchInput): Promise<Match> {
  const { data } = await http.post('/matches', input);
  return mapMatch(data);
}

export interface UpdateMatchInput {
  opponent?: string;
  date?: string;
  time?: string;
  venueId?: number;
  captainNote?: string;
  status?: string;
}

export async function updateMatch(id: string, input: UpdateMatchInput): Promise<Match> {
  const { data } = await http.put(`/matches/${id}`, input);
  return mapMatch(data);
}

export interface UpdateResultInput {
  result: string;
  score?: string;
  mom?: string;
}

export async function updateMatchResult(id: string, input: UpdateResultInput): Promise<Match> {
  const { data } = await http.patch(`/matches/${id}/result`, input);
  return mapMatch(data);
}

export async function deleteMatch(id: string): Promise<void> {
  await http.delete(`/matches/${id}`);
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export async function getAvailability(matchId: string): Promise<AvailabilityEntry[]> {
  const { data } = await http.get(`/availability/match/${matchId}`);
  return data as AvailabilityEntry[];
}

export async function setMyAvailability(
  matchId: string,
  status: AvailabilityStatus,
): Promise<AvailabilityEntry> {
  const { data } = await http.post('/availability', { matchId: Number(matchId), status });
  return data as AvailabilityEntry;
}

/* ------------------------------------------------------------------ */
/* Venues                                                              */
/* ------------------------------------------------------------------ */

export async function getVenues(): Promise<Venue[]> {
  const { data } = await http.get('/venues');
  return data as Venue[];
}

export interface CreateVenueInput {
  name: string;
  location: string;
  mapsUrl?: string;
  imageUrl?: string;
  pitchType?: string;
  parking?: boolean;
}

export async function createVenue(input: CreateVenueInput): Promise<Venue> {
  const { data } = await http.post('/venues', input);
  return data as Venue;
}

export async function toggleVenueFavorite(id: string): Promise<Venue> {
  const { data } = await http.patch(`/venues/${id}/favorite`);
  return data as Venue;
}

export async function updateVenue(id: string, input: Partial<CreateVenueInput>): Promise<Venue> {
  const { data } = await http.put(`/venues/${id}`, input);
  return data as Venue;
}

export async function deleteVenue(id: string): Promise<void> {
  await http.delete(`/venues/${id}`);
}

/* ------------------------------------------------------------------ */
/* Announcements                                                       */
/* ------------------------------------------------------------------ */

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data } = await http.get('/announcements');
  return data as Announcement[];
}

export async function createAnnouncement(message: string): Promise<Announcement> {
  const { data } = await http.post('/announcements', { message });
  return data as Announcement;
}

export async function updateAnnouncement(id: string, message: string): Promise<Announcement> {
  const { data } = await http.put(`/announcements/${id}`, { message });
  return data as Announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await http.delete(`/announcements/${id}`);
}

/* ------------------------------------------------------------------ */
/* Players / Team                                                      */
/* ------------------------------------------------------------------ */

export async function getPlayers(): Promise<Player[]> {
  const { data } = await http.get('/players');
  return data as Player[];
}

export interface CreatePlayerInput {
  name: string;
  phone?: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  jerseyNumber?: number;
}

export interface CreatePlayerResponse {
  player: Player;
  defaultPassword?: string | null;
}

export async function createPlayer(input: CreatePlayerInput): Promise<CreatePlayerResponse> {
  const { data } = await http.post('/players', input);
  return data as CreatePlayerResponse;
}

export async function updatePlayer(id: string, input: Partial<CreatePlayerInput>): Promise<Player> {
  const { data } = await http.put(`/players/${id}`, input);
  return data as Player;
}

export async function deletePlayer(id: string): Promise<void> {
  await http.delete(`/players/${id}`);
}

export async function getPlayerById(id: string): Promise<Player> {
  const players = await getPlayers();
  const player = players.find((p) => p.id === id);
  if (player) return player;
  const me = await getCurrentUser();
  return String(me.id) === id ? me : Promise.reject(new Error('Player not found'));
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const { data } = await http.get('/attendance');
  return data as AttendanceRecord[];
}
