import { create } from 'zustand';
import type { Team, Match, City, Player, Lineup } from '../types';
import { getTeams, getMatches, getCities, getPlayers, getLineups } from '../api';

interface DataState {
  teams: Team[];
  matches: Match[];
  cities: City[];
  players: Player[];
  lineups: Lineup[];
  loading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  teams: [],
  matches: [],
  cities: [],
  players: [],
  lineups: [],
  loading: false,
  error: null,

  loadAll: async () => {
    if (get().teams.length > 0) return;

    set({ loading: true, error: null });
    try {
      const [teams, matches, cities, players, lineups] = await Promise.all([
        getTeams(), getMatches(), getCities(), getPlayers(), getLineups(),
      ]);

      set({ teams, matches, cities, players, lineups, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
