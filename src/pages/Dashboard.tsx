import { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';
import FixtureCard from '../components/Common/FixtureCard';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { teams, matches } = useDataStore();

  const stats = useMemo(() => {
    const groupMatches = matches.filter(m => m.stage === 'group');
    return {
      teams: 48,
      matches: matches.length,
      groupMatches: groupMatches.length,
      cities: 16,
    };
  }, [matches]);

  const teamMap = useMemo(() => {
    const m: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [teams]);

  const radarData = useMemo(() => {
    const fra = teams.find(t => t.id === 'FRA');
    const arg = teams.find(t => t.id === 'ARG');
    if (!fra || !arg) return [];
    return ['进攻','防守','控球','定位球','心理'].map((label, i) => {
      const keys = ['attack','defense','possession','setPiece','mentality'] as const;
      return { stat: label, '法国': fra.stats[keys[i]], '阿根廷': arg.stats[keys[i]], fullMark: 100 };
    });
  }, [teams]);

  const daysUntil = useMemo(() => {
    const diff = new Date('2026-06-11').getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);

  // Next 8 upcoming matches
  const upcoming = useMemo(
    () => matches.filter(m => m.status === 'scheduled').slice(0, 8),
    [matches]
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Countdown Hero */}
      <div className="bg-white rounded-lg p-5 mb-4 text-center" style={{ border: '1px solid var(--border-color)' }}>
        <div className="text-[13px] text-[var(--text-muted)] mb-2">距 2026 世界杯开幕</div>
        <div className="text-5xl font-extrabold tabular-nums mb-1" style={{ color: 'var(--accent)' }}>{daysUntil}</div>
        <div className="text-sm text-[var(--text-muted)]">天</div>
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          2026年6月11日 · 美国/墨西哥/加拿大联合主办 · 48支球队 · 104场比赛
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { v: stats.teams, l: '参赛球队' },
          { v: stats.matches, l: '总场次' },
          { v: stats.groupMatches, l: '小组赛场次' },
          { v: stats.cities, l: '主办城市' },
        ].map(({v,l}) => (
          <div key={l} className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid var(--border-color)' }}>
            <div className="text-2xl font-extrabold tabular-nums" style={{ color: 'var(--accent)' }}>{v}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      {/* Featured: France vs Argentina */}
      <div className="bg-white rounded-lg p-4 mb-4" style={{ border: '1px solid var(--border-color)' }}>
        <div className="text-sm font-bold mb-3" style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 8 }}>
          焦点对决 · 法国 vs 阿根廷
        </div>
        <div className="h-56">
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#eee" />
              <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12, fill: '#666' }} />
              <Radar name="法国" dataKey="法国" stroke="#1D7EF5" fill="#1D7EF5" fillOpacity={0.15} />
              <Radar name="阿根廷" dataKey="阿根廷" stroke="#C41230" fill="#C41230" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-2 text-xs text-[var(--text-muted)]">
          <span>🔵 法国 (FIFA #1)</span>
          <span>🔴 阿根廷 (FIFA #4)</span>
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <div className="px-4 py-2.5 text-sm font-bold" style={{ borderBottom: '1px solid var(--border-color)' }}>
          即将进行 · 小组赛第一轮
        </div>
        {upcoming.map(m => (
          <FixtureCard key={m.id} match={m} homeTeam={teamMap[m.home]} awayTeam={teamMap[m.away]} compact />
        ))}
      </div>
    </div>
  );
}
