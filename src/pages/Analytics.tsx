import { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';
import { useSettingsStore } from '../store/settingsStore';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Treemap } from 'recharts';
import { zh, en } from '../i18n';

export default function Analytics() {
  const { teams, matches } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;

  const topTeams = useMemo(() => teams.filter(t => ['FRA','ARG','BRA','ESP','ENG','GER','POR','NED'].includes(t.id)), [teams]);

  const radarData = useMemo(() => {
    const dims = ['attack','defense','possession','setPiece','mentality'] as const;
    const labels = ['进攻','防守','控球','定位球','心理'];
    return dims.map((d, i) => {
      const entry: Record<string, unknown> = { stat: labels[i] };
      topTeams.forEach(t => { entry[t.id] = t.stats[d]; });
      return entry;
    });
  }, [topTeams]);

  const strengthData = useMemo(() =>
    topTeams.map(t => ({ name: t.id, '综合': Math.round((t.stats.attack + t.stats.defense + t.stats.possession + t.stats.setPiece + t.stats.mentality) / 5) })).sort((a, b) => b['综合'] - a['综合'])
  , [topTeams]);

  const goalsByGroup = useMemo(() => {
    return ['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => {
      const gm = matches.filter(m => m.group === g && m.status === 'finished' && m.score);
      return { group: `${g}组`, goals: gm.reduce((s, m) => s + (m.score?.home || 0) + (m.score?.away || 0), 0) };
    });
  }, [matches]);

  const historyData = [
    { year: 1982, teams: 24, prize: 2.2 }, { year: 1986, teams: 24, prize: 2.8 }, { year: 1990, teams: 24, prize: 3.5 },
    { year: 1994, teams: 24, prize: 4.0 }, { year: 1998, teams: 32, prize: 5.0 }, { year: 2002, teams: 32, prize: 8.0 },
    { year: 2006, teams: 32, prize: 14.0 }, { year: 2010, teams: 32, prize: 20.0 }, { year: 2014, teams: 32, prize: 25.0 },
    { year: 2018, teams: 32, prize: 30.0 }, { year: 2022, teams: 32, prize: 42.0 }, { year: 2026, teams: 48, prize: 50.0 },
  ];

  const confData = useMemo(() => {
    const counts: Record<string, number> = {};
    teams.forEach(t => { counts[t.confederation] = (counts[t.confederation] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: t.confederations[name as keyof typeof t.confederations] || name, value }));
  }, [teams, t]);

  const COLORS = ['#F5A623', '#00B4D8', '#E63946', '#2EC4B6', '#6C63FF', '#FF6B6B'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.ana_title}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{t.ana_subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_power_radar}</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
                {topTeams.map((team, i) => (
                  <Radar key={team.id} name={team.nameZh || team.name} dataKey={team.id} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.1} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_overall_rating}</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={strengthData} layout="vertical">
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={40} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
                <Bar dataKey="综合" fill="#F5A623" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_goals_by_group}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={goalsByGroup}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis dataKey="group" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
                <Bar dataKey="goals" fill="#00B4D8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_prize_evolution}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={historyData}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} formatter={(v: number) => `$${v}M`} />
                <Line type="monotone" dataKey="prize" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 4, fill: '#F5A623' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_teams_by_conf}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <Treemap data={confData} dataKey="value" nameKey="name" stroke="var(--bg-card)" fill="#00B4D8">
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.ana_tournament_size}</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={historyData}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 50]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
                <Line type="stepAfter" dataKey="teams" stroke="#2EC4B6" strokeWidth={2.5} dot={{ r: 5, fill: '#2EC4B6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold mb-4">{t.ana_host_cities}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
          {['纽约 / 新泽西 🇺🇸','洛杉矶 🇺🇸','达拉斯 🇺🇸','堪萨斯城 🇺🇸','休斯顿 🇺🇸','亚特兰大 🇺🇸','费城 🇺🇸','西雅图 🇺🇸','旧金山 🇺🇸','波士顿 🇺🇸','迈阿密 🇺🇸','墨西哥城 🇲🇽','蒙特雷 🇲🇽','瓜达拉哈拉 🇲🇽','多伦多 🇨🇦','温哥华 🇨🇦'].map(c => (
            <div key={c} className="px-3 py-2 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}>{c}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
