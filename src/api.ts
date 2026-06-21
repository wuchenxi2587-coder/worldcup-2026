// Data API — fetches from public/data/ at runtime so data can be updated independently
// To update data: replace files in public/data/ and redeploy (or hot-swap on server)
import type { Team, Match, City, Player, Lineup } from './types';

const BASE = '/data';

async function fetchJSON<T>(filename: string): Promise<T> {
  const res = await fetch(`${BASE}/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
  return res.json();
}

export async function getTeams(): Promise<Team[]> {
  return fetchJSON<Team[]>('teams.json');
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeams();
  return teams.find(t => t.id === id);
}

export async function getMatches(): Promise<Match[]> {
  return fetchJSON<Match[]>('matches.json');
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const matches = await getMatches();
  return matches.find(m => m.id === id);
}

export async function getCities(): Promise<City[]> {
  return fetchJSON<City[]>('cities.json');
}

export async function getPlayers(): Promise<Player[]> {
  return fetchJSON<Player[]>('players.json');
}

export async function getPlayersByTeam(teamId: string): Promise<Player[]> {
  const players = await getPlayers();
  return players.filter(p => p.teamId === teamId);
}

export async function getLineups(): Promise<Lineup[]> {
  return fetchJSON<Lineup[]>('lineups.json');
}

export async function getLineupByMatch(matchId: string): Promise<Lineup[]> {
  const lineups = await getLineups();
  return lineups.filter(l => l.matchId === matchId);
}
