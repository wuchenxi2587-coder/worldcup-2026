import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDataStore } from './store/dataStore';
import { useSettingsStore } from './store/settingsStore';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import Fixtures from './pages/Fixtures';
import Standings from './pages/Standings';
import Bracket from './pages/Bracket';
import Prediction from './pages/Prediction';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import MatchDetail from './pages/MatchDetail';
import { zh, en } from './i18n';

export default function App() {
  const { loadAll, loading, error } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--accent-red)] mb-2">{t.error_load}</h1>
          <p className="text-[var(--text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-3 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/bracket" element={<Bracket />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        )}
      </main>
      <footer className="text-center py-4 text-xs text-[var(--text-muted)] border-t" style={{ borderColor: 'var(--border-color)' }}>
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}
