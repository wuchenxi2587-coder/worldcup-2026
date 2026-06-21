import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useSettingsStore } from '../store/settingsStore';
import FixtureCard from '../components/Common/FixtureCard';
import { zh, en } from '../i18n';

const STAGE_KEYS = ['all', 'group', 'r32', 'r16', 'qf', 'sf', 'final'] as const;
const GROUPS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

export default function Fixtures() {
  const { matches, teams } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;
  const [stageFilter, setStageFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('');
  const [teamSearch, setTeamSearch] = useState('');

  const stageLabels: Record<string, string> = {
    all: t.fix_all, group: t.fix_group_stage, r32: t.fix_r32,
    r16: t.fix_r16, qf: t.fix_qf, sf: t.fix_sf, final: t.fix_final,
  };

  const teamMap = useMemo(() => {
    const m: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [teams]);

  const filtered = useMemo(() => {
    let result = matches;
    if (stageFilter !== 'all') result = result.filter(m => m.stage === stageFilter);
    if (groupFilter) result = result.filter(m => m.group === groupFilter);
    if (teamSearch) {
      const q = teamSearch.toUpperCase();
      result = result.filter(m => m.home.includes(q) || m.away.includes(q) ||
        (teamMap[m.home]?.name.toUpperCase().includes(q)) ||
        (teamMap[m.away]?.name.toUpperCase().includes(q))
      );
    }
    return result;
  }, [matches, stageFilter, groupFilter, teamSearch, teamMap]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.fix_title}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.fix_subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STAGE_KEYS.map(s => (
          <button key={s} onClick={() => setStageFilter(s)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              backgroundColor: stageFilter === s ? 'var(--accent-gold)' : 'var(--bg-card)',
              color: stageFilter === s ? '#000' : 'var(--text-secondary)',
            }}
          >{stageLabels[s]}</button>
        ))}
      </div>

      {(stageFilter === 'all' || stageFilter === 'group') && (
        <div className="flex flex-wrap gap-1">
          <button onClick={() => setGroupFilter('')}
            className="px-2 py-1 rounded text-xs"
            style={{
              backgroundColor: groupFilter === '' ? 'var(--accent-cyan)' : 'var(--bg-card)',
              color: groupFilter === '' ? '#000' : 'var(--text-secondary)',
            }}
          >{t.fix_all_groups}</button>
          {GROUPS.map(g => (
            <button key={g} onClick={() => setGroupFilter(g)}
              className="px-2 py-1 rounded text-xs font-mono"
              style={{
                backgroundColor: groupFilter === g ? 'var(--accent-cyan)' : 'var(--bg-card)',
                color: groupFilter === g ? '#000' : 'var(--text-secondary)',
              }}
            >{t.fix_group} {g}</button>
          ))}
        </div>
      )}

      <input type="text" placeholder={t.fix_search} value={teamSearch} onChange={e => setTeamSearch(e.target.value)}
        className="w-full max-w-xs px-3 py-2 rounded-md border text-sm"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      />

      <p className="text-xs text-[var(--text-muted)]">{filtered.length} {t.fix_found}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(m => (
          <FixtureCard key={m.id} match={m} homeTeam={teamMap[m.home]} awayTeam={teamMap[m.away]} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)]">{t.fix_no_match}</div>
        )}
      </div>
    </div>
  );
}
