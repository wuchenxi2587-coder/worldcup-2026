import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useSettingsStore } from '../store/settingsStore';
import TeamBadge from '../components/Common/TeamBadge';
import StatBar from '../components/Common/StatBar';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip } from 'recharts';
import { zh, en } from '../i18n';
import type { Team, Match, Player, Lineup } from '../types';

// ═══════════════════════════════════════════
// Module 1: What-if Scenario
// ═══════════════════════════════════════════
function WhatIfAnalysis({ match, teams, allMatches, t }: { match: Match; teams: Team[]; allMatches: Match[]; t: typeof zh | typeof en }) {
  if (match.stage !== 'group' || !match.group) return null;

  const teamMap = useMemo(() => { const m: Record<string, Team> = {}; teams.forEach(t => { m[t.id] = t; }); return m; }, [teams]);
  const [selectedTeam, setSelectedTeam] = useState(match.home);

  const analysis = useMemo(() => {
    const group = match.group!;
    const groupTeams = teams.filter(t => t.group === group);
    const groupMatches = allMatches.filter(m => m.group === group);
    const finishedMatches = groupMatches.filter(m => m.status === 'finished' && m.score);
    const standings: Record<string, { pts: number; gf: number; ga: number }> = {};
    groupTeams.forEach(t => { standings[t.id] = { pts: 0, gf: 0, ga: 0 }; });
    finishedMatches.forEach(m => {
      if (!m.score) return;
      standings[m.home].gf += m.score.home; standings[m.home].ga += m.score.away;
      standings[m.away].gf += m.score.away; standings[m.away].ga += m.score.home;
      if (m.score.home > m.score.away) standings[m.home].pts += 3;
      else if (m.score.home < m.score.away) standings[m.away].pts += 3;
      else { standings[m.home].pts++; standings[m.away].pts++; }
    });

    const targetIsHome = selectedTeam === match.home;
    const home = teamMap[match.home];
    const away = teamMap[match.away];
    if (!home || !away) return null;
    const homeStrength = (home.stats.attack + home.stats.defense) / 2;
    const awayStrength = (away.stats.attack + away.stats.defense) / 2;
    const totalStr = homeStrength + awayStrength || 1;

    return (['win', 'draw', 'loss'] as const).map(outcome => {
      let advanceProb: number, topTwoProb: number, bestThirdProb: number, eliminatedProb: number, description: string;

      if (targetIsHome) {
        if (outcome === 'win') {
          advanceProb = 85 + Math.round((homeStrength / totalStr) * 15); topTwoProb = 80; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '胜利几乎确保出线，很可能以前两名直接晋级。';
        } else if (outcome === 'draw') {
          advanceProb = 45 + Math.round((homeStrength / totalStr) * 15); topTwoProb = 35; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '平局使出线形势不明朗，需要其他比赛结果有利。';
        } else {
          advanceProb = 12 + Math.round((homeStrength / totalStr) * 10); topTwoProb = 5; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '失利使出线难度大增，需其他场次结果完美配合。';
        }
      } else {
        if (outcome === 'win') {
          advanceProb = 80 + Math.round((awayStrength / totalStr) * 15); topTwoProb = 75; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '客场取胜将极大提升出线希望。';
        } else if (outcome === 'draw') {
          advanceProb = 50 + Math.round((awayStrength / totalStr) * 10); topTwoProb = 38; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '客场平局是不错的结果，仍有望争夺出线席位。';
        } else {
          advanceProb = 15 + Math.round((awayStrength / totalStr) * 10); topTwoProb = 8; bestThirdProb = advanceProb - topTwoProb;
          eliminatedProb = 100 - advanceProb; description = '失利将是重大打击，出线概率急剧下降。';
        }
      }

      return {
        result: outcome,
        advanceProb: Math.min(100, Math.max(0, advanceProb)),
        topTwoProb: Math.min(advanceProb, Math.max(0, topTwoProb)),
        bestThirdProb: Math.min(advanceProb - topTwoProb, Math.max(0, bestThirdProb)),
        eliminatedProb: Math.min(100, Math.max(0, eliminatedProb)),
        description,
      };
    });
  }, [match, teams, allMatches, selectedTeam, teamMap]);

  if (!analysis) return null;

  const barData = analysis.map(a => ({ name: a.result === 'win' ? '若胜' : a.result === 'draw' ? '若平' : '若负', advance: a.advanceProb, eliminated: a.eliminatedProb }));

  const winColors: Record<string, string> = { win: 'var(--accent-green)', draw: 'var(--accent-gold)', loss: 'var(--accent-red)' };
  const winEmoji: Record<string, string> = { win: '🟢', draw: '🟡', loss: '🔴' };
  const winLabels: Record<string, string> = { win: t.mod1_win, draw: t.mod1_draw, loss: t.mod1_loss };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{t.mod1_title}</h3>
        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
          className="px-2 py-1 rounded border text-xs" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          <option value={match.home}>{teamMap[match.home]?.nameZh || teamMap[match.home]?.name}</option>
          <option value={match.away}>{teamMap[match.away]?.nameZh || teamMap[match.away]?.name}</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {analysis.map(a => (
          <div key={a.result} className="rounded-lg p-3 text-center"
            style={{ backgroundColor: `color-mix(in srgb, ${winColors[a.result]} 15%, transparent)` }}>
            <div className="text-xs text-[var(--text-muted)] mb-1">{winEmoji[a.result]} {winLabels[a.result]}</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: winColors[a.result] }}>{a.advanceProb}%</div>
            <div className="text-[10px] text-[var(--text-muted)]">{t.mod1_advance_prob}</div>
          </div>
        ))}
      </div>

      {analysis.map(a => (
        <p key={a.result} className="text-xs text-[var(--text-secondary)]">
          <strong>{winLabels[a.result]}：</strong> {a.description}
        </p>
      ))}

      <div className="h-40">
        <ResponsiveContainer>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={40} />
            <ReTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', fontSize: 12 }} />
            <Bar dataKey="advance" fill="var(--accent-green)" stackId="a" radius={[0, 4, 4, 0]} name={t.mod1_advance} />
            <Bar dataKey="eliminated" fill="var(--text-muted)" stackId="a" opacity={0.3} name={t.mod1_eliminated} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] italic">{t.mod1_disclaimer}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// Module 2: Knockout Path
// ═══════════════════════════════════════════
interface KnockoutRound { stage: string; opponentId: string | null; opponentName: string | null; winProb: number; }

function KnockoutPathProjection({ match, teams, t }: { match: Match; teams: Team[]; t: typeof zh | typeof en }) {
  if (match.stage !== 'group') return null;

  const teamMap = useMemo(() => { const m: Record<string, Team> = {}; teams.forEach(t => { m[t.id] = t; }); return m; }, [teams]);
  const [selectedTeam, setSelectedTeam] = useState(match.home);

  const paths = useMemo(() => {
    const allTeams = teams.filter(t => t.id !== selectedTeam);
    const pickOpponent = (pool: Team[], bias: 'top'|'mid'|'low') => {
      const sorted = [...pool].sort((a,b) => (b.stats.attack+b.stats.defense)-(a.stats.attack+a.stats.defense));
      return bias==='top'?sorted[0]:bias==='mid'?sorted[Math.floor(sorted.length/2)]:sorted[sorted.length-1]||pool[0];
    };
    const calcWinProb = (a: Team, b: Team) => {
      const as = (a.stats.attack+a.stats.defense+a.stats.mentality)/3;
      const bs = (b.stats.attack+b.stats.defense+b.stats.mentality)/3;
      return Math.round((as/(as+bs))*100);
    };
    const selected = teamMap[selectedTeam];
    if (!selected) return null;

    // Path 1
    const o1 = [pickOpponent(allTeams,'low'),pickOpponent(allTeams,'mid'),pickOpponent(allTeams,'mid'),pickOpponent(allTeams,'top'),pickOpponent(allTeams,'top')];
    const p1: KnockoutRound[] = o1.map((opp, i) => ({
      stage: ['r32','r16','qf','sf','final'][i], opponentId: opp.id, opponentName: opp.nameZh || opp.name,
      winProb: calcWinProb(selected, opp),
    }));
    // Path 2
    const o2 = [pickOpponent(allTeams,'mid'),pickOpponent(allTeams,'top'),pickOpponent(allTeams,'top'),pickOpponent(allTeams,'top'),pickOpponent(allTeams,'top')];
    const p2: KnockoutRound[] = o2.map((opp, i) => ({
      stage: ['r32','r16','qf','sf','final'][i], opponentId: opp.id, opponentName: opp.nameZh || opp.name,
      winProb: calcWinProb(selected, opp),
    }));
    return {
      seed1: { rounds: p1, championshipProb: Math.round(p1.reduce((p,r) => p*(r.winProb/100), 100)) },
      seed2: { rounds: p2, championshipProb: Math.round(p2.reduce((p,r) => p*(r.winProb/100), 100)) },
    };
  }, [match, teams, selectedTeam, teamMap]);

  if (!paths) return null;

  const stn: Record<string, string> = { r32: t.mod2_r32, r16: t.mod2_r16, qf: t.mod2_qf, sf: t.mod2_sf, final: t.mod2_final };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">{t.mod2_title}</h3>
        <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
          className="px-2 py-1 rounded border text-xs" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
          <option value={match.home}>{teamMap[match.home]?.nameZh || teamMap[match.home]?.name}</option>
          <option value={match.away}>{teamMap[match.away]?.nameZh || teamMap[match.away]?.name}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[paths.seed1, paths.seed2].map((path, pi) => (
          <div key={pi} className="rounded-lg border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <div className="text-xs font-semibold mb-3" style={{ color: pi===0?'var(--accent-green)':'var(--accent-cyan)' }}>
              {pi===0 ? t.mod2_seed1 : t.mod2_seed2}
            </div>
            <div className="space-y-2">
              {path.rounds.map(r => (
                <div key={r.stage} className="flex items-center gap-2 text-xs">
                  <span className="tabular-nums text-[var(--text-muted)] w-20">{stn[r.stage]}</span>
                  <span className="text-[var(--text-muted)]">{t.mod2_vs}</span>
                  {r.opponentId ? <div className="flex items-center gap-1"><span>{teamMap[r.opponentId]?.flag}</span><span>{r.opponentName}</span></div> : <span className="text-[var(--text-muted)]">{t.bkt_tbd}</span>}
                  <span className="ml-auto tabular-nums font-semibold" style={{ color: r.winProb>60?'var(--accent-green)':r.winProb>40?'var(--accent-gold)':'var(--accent-red)' }}>{r.winProb}%</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
                <strong style={{ color: 'var(--accent-gold)' }}>{t.mod2_championship}：{path.championshipProb}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[var(--text-muted)] italic">{t.mod2_disclaimer}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// Module 3: Head-to-Head
// ═══════════════════════════════════════════
function HeadToHead({ match, teams, players, lineups, t }: { match: Match; teams: Team[]; players: Player[]; lineups: Lineup[]; t: typeof zh | typeof en }) {
  const teamMap = useMemo(() => { const m: Record<string, Team> = {}; teams.forEach(t => { m[t.id] = t; }); return m; }, [teams]);
  const home = teamMap[match.home]; const away = teamMap[match.away];
  if (!home || !away) return null;

  const dims = ['attack','defense','possession','setPiece','mentality'] as const;
  const labels = ['进攻','防守','控球','定位球','心理'];
  const radarData = dims.map((d,i) => ({ stat: labels[i], [home.id]: home.stats[d], [away.id]: away.stats[d], fullMark: 100 }));

  const matchLineups = lineups.filter(l => l.matchId === match.id);
  const homeLineup = matchLineups.find(l => l.teamId === match.home);
  const awayLineup = matchLineups.find(l => l.teamId === match.away);
  const homePlayers = homeLineup ? homeLineup.starters.map(id => players.find(p=>p.id===id)).filter(Boolean) as Player[] : [];
  const awayPlayers = awayLineup ? awayLineup.starters.map(id => players.find(p=>p.id===id)).filter(Boolean) as Player[] : [];

  const fieldWidth = 300, fieldHeight = 480, halfField = fieldHeight / 2;
  const getPositions = (formation: string, isHome: boolean) => {
    const yBase = isHome ? halfField - 120 : halfField + 120;
    const dir = isHome ? -1 : 1;
    const pos: {x:number;y:number}[] = [{ x: fieldWidth/2, y: isHome?30:fieldHeight-30 }];
    for (let i=0;i<4;i++) pos.push({ x: 40 + i*(fieldWidth-80)/3, y: yBase + dir*60 });
    const mc = formation==='4-4-2'?4:3;
    for (let i=0;i<mc;i++) { const sp = (fieldWidth-40)/(mc+1); pos.push({ x: sp*(i+1), y: yBase+dir*20 }); }
    const fc = formation==='4-4-2'?2:3;
    for (let i=0;i<fc;i++) { const sp = (fieldWidth-60)/(fc+1); pos.push({ x: sp*(i+1)+10, y: yBase-dir*20 }); }
    return pos;
  };
  const homePositions = getPositions(homeLineup?.formation||'4-3-3', true);
  const awayPositions = getPositions(awayLineup?.formation||'4-4-2', false);

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold">{t.mod3_title}</h3>

      <div className="h-64">
        <ResponsiveContainer>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="stat" />
            <Radar name={home.nameZh || home.name} dataKey={home.id} stroke="#00B4D8" fill="#00B4D8" fillOpacity={0.3} />
            <Radar name={away.nameZh || away.name} dataKey={away.id} stroke="#F5A623" fill="#F5A623" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <div className="text-[var(--text-muted)] text-xs">{t.mod3_fifa_rank}</div><div className="font-bold">#{home.fifaRank}</div>
        </div>
        <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <div className="text-[var(--text-muted)] text-xs">{t.mod3_fifa_rank}</div><div className="font-bold">#{away.fifaRank}</div>
        </div>
        <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <div className="text-[var(--text-muted)] text-xs">{t.mod3_overall}</div><div className="font-bold">{Math.round((home.stats.attack+home.stats.defense+home.stats.possession+home.stats.setPiece+home.stats.mentality)/5)}</div>
        </div>
        <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-hover)' }}>
          <div className="text-[var(--text-muted)] text-xs">{t.mod3_overall}</div><div className="font-bold">{Math.round((away.stats.attack+away.stats.defense+away.stats.possession+away.stats.setPiece+away.stats.mentality)/5)}</div>
        </div>
      </div>

      {homePlayers.length>0||awayPlayers.length>0 ? (
        <div>
          <h4 className="text-xs font-semibold mb-2 text-[var(--text-muted)]">{t.mod3_formation}</h4>
          <div className="flex justify-center">
            <svg viewBox={`0 0 ${fieldWidth} ${fieldHeight}`} className="w-full max-w-xs" style={{ backgroundColor: '#1B5E20', borderRadius: 12 }}>
              <rect x="20" y="10" width={fieldWidth-40} height={fieldHeight-20} fill="none" stroke="#4CAF50" strokeWidth="2" rx="4" />
              <line x1="20" y1={halfField} x2={fieldWidth-20} y2={halfField} stroke="#4CAF50" strokeWidth="1.5" />
              <circle cx={fieldWidth/2} cy={halfField} r="30" fill="none" stroke="#4CAF50" strokeWidth="1.5" />
              <rect x={fieldWidth/2-50} y="25" width="100" height="40" fill="none" stroke="#4CAF50" strokeWidth="1.5" rx="3" />
              <rect x={fieldWidth/2-50} y={fieldHeight-65} width="100" height="40" fill="none" stroke="#4CAF50" strokeWidth="1.5" rx="3" />
              <rect x={fieldWidth/2-25} y="25" width="50" height="20" fill="none" stroke="#4CAF50" strokeWidth="1.5" rx="2" />
              <rect x={fieldWidth/2-25} y={fieldHeight-45} width="50" height="20" fill="none" stroke="#4CAF50" strokeWidth="1.5" rx="2" />
              {homePositions.map((pos,i) => {
                const p = homePlayers[i];
                return (<g key={`h${i}`}><circle cx={pos.x} cy={pos.y} r="10" fill={i===0?'#E63946':'#00B4D8'} stroke="white" strokeWidth="1" /><text x={pos.x} y={pos.y+1} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">{p?p.number:i+1}</text>{p&&<text x={pos.x} y={pos.y+16} textAnchor="middle" fill="white" fontSize="6">{p.nameZh.length>4?p.nameZh.slice(0,3)+'.':p.nameZh}</text>}</g>);
              })}
              {awayPositions.map((pos,i) => {
                const p = awayPlayers[i];
                return (<g key={`a${i}`}><circle cx={pos.x} cy={pos.y} r="10" fill={i===0?'#E63946':'#F5A623'} stroke="white" strokeWidth="1" /><text x={pos.x} y={pos.y+1} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">{p?p.number:i+1}</text>{p&&<text x={pos.x} y={pos.y-13} textAnchor="middle" fill="white" fontSize="6">{p.nameZh.length>4?p.nameZh.slice(0,3)+'.':p.nameZh}</text>}</g>);
              })}
              <text x={fieldWidth/2} y={20} textAnchor="middle" fill="#00B4D8" fontSize="8" fontWeight="bold">{homeLineup?.formation||'4-3-3'}</text>
              <text x={fieldWidth/2} y={fieldHeight-8} textAnchor="middle" fill="#F5A623" fontSize="8" fontWeight="bold">{awayLineup?.formation||'4-4-2'}</text>
            </svg>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--text-muted)] italic text-center py-4">{t.mod3_no_lineup}</p>
      )}
      <p className="text-[10px] text-[var(--text-muted)] italic">{t.mod3_disclaimer}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// MatchDetail Page
// ═══════════════════════════════════════════
export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const { matches, teams, players, lineups } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;

  const match = useMemo(() => matches.find(m => m.id === id), [matches, id]);
  const teamMap = useMemo(() => { const m: Record<string, Team> = {}; teams.forEach(t => { m[t.id] = t; }); return m; }, [teams]);

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-[var(--text-muted)]">{t.match_not_found}</h2>
        <Link to="/fixtures" className="text-sm" style={{ color: 'var(--accent-gold)' }}>{t.match_back}</Link>
      </div>
    );
  }

  const home = teamMap[match.home];
  const away = teamMap[match.away];
  const date = new Date(match.date);

  return (
    <div className="space-y-8">
      <Link to="/fixtures" className="text-xs hover:underline" style={{ color: 'var(--accent-gold)' }}>{t.match_back}</Link>

      <div className="rounded-xl border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="text-center mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--bg-hover)' }}>
            {match.stage === 'group' ? `${t.fix_group} ${match.group}` : match.stage.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
          <div className="text-center flex-1">{home && <TeamBadge team={home} size="lg" />}</div>
          <div className="text-center">
            {match.status === 'live' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold animate-pulse mb-2" style={{ color: 'var(--accent-red)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-red)' }} /> {t.fix_live}
              </span>
            )}
            <div className="text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tight">
              {match.score ? `${match.score.home} - ${match.score.away}` : 'VS'}
            </div>
            {match.status === 'finished' && <span className="text-xs text-[var(--text-muted)] mt-1 block">{t.fix_full_time}</span>}
          </div>
          <div className="text-center flex-1">{away && <TeamBadge team={away} size="lg" />}</div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-xs text-[var(--text-muted)]">
          <span>📅 {date.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>🕐 {date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>🏟 {match.stadium}</span>
          <span>📍 {match.city}</span>
        </div>
      </div>

      {match.stats && match.status === 'finished' && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.match_stats}</h3>
          <div className="space-y-3">
            <StatBar label={t.match_possession} home={match.stats.possession[0]} away={match.stats.possession[1]} />
            <StatBar label={t.match_shots} home={match.stats.shots[0]} away={match.stats.shots[1]} unit="" />
            <StatBar label={t.match_shots_on_target} home={match.stats.shotsOnTarget[0]} away={match.stats.shotsOnTarget[1]} unit="" />
            <StatBar label={t.match_corners} home={match.stats.corners[0]} away={match.stats.corners[1]} unit="" />
            <StatBar label={t.match_pass_accuracy} home={match.stats.passAccuracy[0]} away={match.stats.passAccuracy[1]} />
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4 space-y-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <WhatIfAnalysis match={match} teams={teams} allMatches={matches} t={t} />
        <hr style={{ borderColor: 'var(--border-color)' }} />
        <KnockoutPathProjection match={match} teams={teams} t={t} />
        <hr style={{ borderColor: 'var(--border-color)' }} />
        <HeadToHead match={match} teams={teams} players={players} lineups={lineups} t={t} />
      </div>
    </div>
  );
}
