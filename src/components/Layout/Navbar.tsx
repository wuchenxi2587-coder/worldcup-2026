import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { zh, en } from '../../i18n';

export default function Navbar() {
  const location = useLocation();
  const { settings, setTheme } = useSettingsStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = settings.language === 'zh' ? zh : en;

  const navItems = [
    { path: '/', label: t.nav_dashboard },
    { path: '/fixtures', label: t.nav_fixtures },
    { path: '/standings', label: t.nav_standings },
    { path: '/bracket', label: t.nav_bracket },
    { path: '/prediction', label: t.nav_prediction },
    { path: '/analytics', label: t.nav_analytics },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline" style={{ color: '#fff' }}>
            <span className="text-lg">⚽</span>
            <span className="text-base font-bold tracking-tight">2026 世界杯</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className="px-3 h-12 flex items-center text-[13px] transition-colors no-underline"
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
                    backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'transparent',
                    borderBottom: isActive ? '2px solid #fff' : '2px solid transparent',
                  }}>
                  {item.label}
                </Link>
              );
            })}
            <Link to="/settings"
              className="ml-3 px-2 h-12 flex items-center text-[13px] no-underline"
              style={{ color: 'rgba(255,255,255,0.6)' }}>
              ⚙
            </Link>
            <button onClick={() => setTheme(settings.theme === 'dark' ? 'light' : 'dark')}
              className="px-2 h-12 flex items-center text-[13px]"
              style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label={t.toggle_theme}>
              {settings.theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--accent-hover)' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm no-underline"
                style={{ color: '#fff', backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'transparent' }}>
                {item.label}
              </Link>
            );
          })}
          <Link to="/settings" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 text-sm no-underline" style={{ color: 'rgba(255,255,255,0.7)' }}>
            ⚙ {t.nav_settings}
          </Link>
        </div>
      )}
    </nav>
  );
}
