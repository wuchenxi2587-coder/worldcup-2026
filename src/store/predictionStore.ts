import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prediction, UserProfile } from '../types';

export const usePredictionStore = create<{
  predictions: Prediction[];
  users: UserProfile[];
  activeUserId: string | null;
  // User management
  addUser: (nickname: string) => string;
  setActiveUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<UserProfile>) => void;
  // Predictions
  addPrediction: (pred: Omit<Prediction, 'timestamp'>) => void;
  updatePrediction: (matchId: string, predHome: number, predAway: number) => void;
  getPredictionForMatch: (userId: string, matchId: string) => Prediction | undefined;
  getUserPredictions: (userId: string) => Prediction[];
  getUserScore: (userId: string) => number;
  getLeaderboard: () => { userId: string; nickname: string; score: number; correct: number; total: number }[];
  clearAll: () => void;
}>()(
  persist(
    (set, get) => ({
      predictions: [],
      users: [],
      activeUserId: null,

      addUser: (nickname) => {
        const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const user: UserProfile = {
          id,
          nickname,
          createdAt: Date.now(),
        };
        set((s) => ({
          users: [...s.users, user],
          activeUserId: id,
        }));
        return id;
      },

      setActiveUser: (userId) => set({ activeUserId: userId }),

      removeUser: (userId) => {
        set((s) => ({
          users: s.users.filter((u) => u.id !== userId),
          predictions: s.predictions.filter((p) => p.userId !== userId),
          activeUserId: s.activeUserId === userId ? null : s.activeUserId,
        }));
      },

      updateUser: (userId, updates) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
        }));
      },

      addPrediction: (pred) => {
        set((s) => {
          const existing = s.predictions.findIndex(
            (p) => p.userId === pred.userId && p.matchId === pred.matchId
          );
          if (existing >= 0) {
            const copy = [...s.predictions];
            copy[existing] = { ...pred, timestamp: Date.now() };
            return { predictions: copy };
          }
          return {
            predictions: [...s.predictions, { ...pred, timestamp: Date.now() }],
          };
        });
      },

      updatePrediction: (matchId, predHome, predAway) => {
        const { activeUserId } = get();
        if (!activeUserId) return;
        get().addPrediction({ userId: activeUserId, matchId, predHome, predAway });
      },

      getPredictionForMatch: (userId, matchId) => {
        return get().predictions.find((p) => p.userId === userId && p.matchId === matchId);
      },

      getUserPredictions: (userId) => {
        return get().predictions.filter((p) => p.userId === userId);
      },

      getUserScore: (userId) => {
        // This would need match results to calculate — actual calc in pages
        return get().predictions
          .filter((p) => p.userId === userId)
          .reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
      },

      getLeaderboard: () => {
        const { users, predictions } = get();
        return users.map((u) => {
          const userPreds = predictions.filter((p) => p.userId === u.id);
          const scored = userPreds.filter((p) => p.pointsEarned !== undefined);
          return {
            userId: u.id,
            nickname: u.nickname,
            score: scored.reduce((s, p) => s + (p.pointsEarned || 0), 0),
            correct: scored.filter((p) => (p.pointsEarned || 0) > 0).length,
            total: userPreds.length,
          };
        }).sort((a, b) => b.score - a.score);
      },

      clearAll: () => set({ predictions: [], users: [], activeUserId: null }),
    }),
    { name: 'wc2026-predictions' }
  )
);
