import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useSettingsStore } from '../store/settingsStore';
import TeamBadge from '../components/Common/TeamBadge';
import { zh, en } from '../i18n';
import type { GroupStanding } from '../types';

const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function Standings() {
  const { matches, teams } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;
  const [activeGroup, setActiveGroup] = useState('A');
  const [showBestThirds, setShowBestThirds] = useState(false);

  const teamMap = useMemo(() => {
    const m: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [teams]);

  const groupStandings = useMemo(() => {
    const groups: Record<string, GroupStanding[]> = {};
    for (const g of GROUPS) {
      const groupMatches = matches.filter(m => m.group === g && m.status === 'finished' && m.score);
      const standings: Record<string, GroupStanding> = {};
      const groupTeams = teams.filter(t => t.group === g);
      for (const t of groupTeams) {
        standings[t.id] = { teamId: t.id, group: g, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDiff: 0, points: 0 };
      }
      for (const m of groupMatches) {
        const h = standings[m.home], a = standings[m.away];
        if (!h || !a || !m.score) continue;
        h.played++; a.played++; h.goalsFor += m.score.home; h.goalsAgainst += m.score.away;
        a.goalsFor += m.score.away; a.goalsAgainst += m.score.home;
        if (m.score.home > m.score.away) { h.won++; h.points += 3; a.lost++; }
        else if (m.score.home < m.score.away) { a.won++; a.points += 3; h.lost++; }
        else { h.drawn++; a.drawn++; h.points++; a.points++; }
      }
      for (const s of Object.values(standings)) { s.goalDiff = s.goalsFor - s.goalsAgainst; }
      groups[g] = Object.values(standings).sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    }
    return groups;
  }, [matches, teams]);

  const bestThirds = useMemo(() => {
    const thirds = GROUPS.map(g => (groupStandings[g] || [])[2]).filter(Boolean);
    return thirds.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
  }, [groupStandings]);

  if (showBestThirds) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.std_best_third_title}</h1>
          <button onClick={() => setShowBestThirds(false)} className="px-3 py-1.5 rounded-md text-xs" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>{t.std_back_groups}</button>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.std_best_third_desc}</p>
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--bg-hover)' }}>
              <tr>
                <th className="p-3 text-left text-xs text-[var(--text-muted)]">{t.std_rank}</th>
                <th className="p-3 text-left text-xs text-[var(--text-muted)]">{t.std_team}</th>
                <th className="p-3 text-left text-xs text-[var(--text-muted)]">{t.std_group}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_p}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_w}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_d}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_l}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_gf}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_ga}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_gd}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_pts}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_status}</th>
              </tr>
            </thead>
            <tbody>
              {bestThirds.map((s, i) => (
                <tr key={s.teamId} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="p-3 font-bold">{i + 1}</td>
                  <td className="p-3"><TeamBadge team={teamMap[s.teamId]} size="sm" /></td>
                  <td className="p-3 text-xs">{s.group}</td>
                  <td className="p-3 text-center tabular-nums">{s.played}</td>
                  <td className="p-3 text-center tabular-nums">{s.won}</td>
                  <td className="p-3 text-center tabular-nums">{s.drawn}</td>
                  <td className="p-3 text-center tabular-nums">{s.lost}</td>
                  <td className="p-3 text-center tabular-nums">{s.goalsFor}</td>
                  <td className="p-3 text-center tabular-nums">{s.goalsAgainst}</td>
                  <td className="p-3 text-center tabular-nums">{s.goalDiff}</td>
                  <td className="p-3 text-center font-bold tabular-nums">{s.points}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: i < 8 ? 'color-mix(in srgb, var(--accent-green) 20%, transparent)' : 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
                        color: i < 8 ? 'var(--accent-green)' : 'var(--text-muted)',
                      }}
                    >{i < 8 ? t.std_advances : t.std_eliminated}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.std_title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.std_subtitle}</p>
        </div>
        <button onClick={() => setShowBestThirds(true)} className="px-3 py-1.5 rounded-md text-xs font-medium"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent-gold) 15%, transparent)', color: 'var(--accent-gold)' }}
        >{t.std_best_third}</button>
      </div>

      <div className="flex flex-wrap gap-1">
        {GROUPS.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className="px-3 py-2 rounded-md text-sm font-mono font-bold transition-colors min-w-[48px]"
            style={{ backgroundColor: activeGroup === g ? 'var(--accent-gold)' : 'var(--bg-card)', color: activeGroup === g ? '#000' : 'var(--text-secondary)' }}
          >{g}</button>
        ))}
      </div>

      {activeGroup && groupStandings[activeGroup] && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: 'var(--bg-hover)' }}>
              <tr>
                <th className="p-3 text-left text-xs text-[var(--text-muted)] w-8">#</th>
                <th className="p-3 text-left text-xs text-[var(--text-muted)]">{t.std_team}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_p}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_w}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_d}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_l}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_gf}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_ga}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_gd}</th>
                <th className="p-3 text-center text-xs text-[var(--text-muted)]">{t.std_pts}</th>
              </tr>
            </thead>
            <tbody>
              {groupStandings[activeGroup].map((s, i) => {
                const team = teamMap[s.teamId];
                let barColor = 'var(--text-muted)';
                if (i === 0 || i === 1) barColor = 'var(--accent-green)';
                else if (i === 2) barColor = 'var(--accent-gold)';
                return (
                  <tr key={s.teamId} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="p-3"><div className="w-1 h-8 rounded-r" style={{ backgroundColor: barColor }} /></td>
                    <td className="p-3">{team ? <TeamBadge team={team} size="sm" /> : s.teamId}</td>
                    <td className="p-3 text-center tabular-nums">{s.played}</td>
                    <td className="p-3 text-center tabular-nums">{s.won}</td>
                    <td className="p-3 text-center tabular-nums">{s.drawn}</td>
                    <td className="p-3 text-center tabular-nums">{s.lost}</td>
                    <td className="p-3 text-center tabular-nums">{s.goalsFor}</td>
                    <td className="p-3 text-center tabular-nums">{s.goalsAgainst}</td>
                    <td className="p-3 text-center tabular-nums font-semibold" style={{ color: s.goalDiff > 0 ? 'var(--accent-green)' : s.goalDiff < 0 ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                      {s.goalDiff > 0 ? '+' : ''}{s.goalDiff}
                    </td>
                    <td className="p-3 text-center font-bold tabular-nums">{s.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
