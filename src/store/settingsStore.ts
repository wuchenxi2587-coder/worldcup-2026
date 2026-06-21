import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';

const defaultSettings: AppSettings = {
  theme: 'light',
  language: 'zh',
  scoring: {
    exactScore: 5,
    correctGoalDiff: 3,
    correctResult: 1,
  },
};

export const useSettingsStore = create<{
  settings: AppSettings;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  setScoring: (scoring: AppSettings['scoring']) => void;
  reset: () => void;
}>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set((s) => ({ settings: { ...s.settings, theme } }));
      },
      setLanguage: (language) =>
        set((s) => ({ settings: { ...s.settings, language } })),
      setScoring: (scoring) =>
        set((s) => ({
          settings: { ...s.settings, scoring },
        })),
      reset: () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        set({ settings: defaultSettings });
      },
    }),
    { name: 'wc2026-settings' }
  )
);
