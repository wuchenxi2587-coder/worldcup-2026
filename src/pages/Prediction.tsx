import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { usePredictionStore } from '../store/predictionStore';
import { useSettingsStore } from '../store/settingsStore';
import TeamBadge from '../components/Common/TeamBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { zh, en } from '../i18n';

export default function Prediction() {
  const { matches, teams } = useDataStore();
  const { users, activeUserId, addUser, setActiveUser, predictions, addPrediction, getLeaderboard } = usePredictionStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;

  const [newNickname, setNewNickname] = useState('');
  const [viewMode, setViewMode] = useState<'predict' | 'leaderboard' | 'history'>('predict');
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [predHome, setPredHome] = useState(0);
  const [predAway, setPredAway] = useState(0);

  const teamMap = useMemo(() => {
    const m: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [teams]);

  const activeUser = users.find(u => u.id === activeUserId);
  const groupMatches = useMemo(() => matches.filter(m => m.stage === 'group' && m.status !== 'finished'), [matches]);
  const userPredictions = useMemo(() => activeUserId ? predictions.filter(p => p.userId === activeUserId) : [], [predictions, activeUserId]);
  const leaderboard = useMemo(() => getLeaderboard(), [getLeaderboard]);

  const scoreHistory = useMemo(() => {
    if (!activeUserId) return [];
    const up = predictions.filter(p => p.userId === activeUserId && p.pointsEarned !== undefined).sort((a, b) => a.timestamp - b.timestamp);
    let cum = 0;
    return up.map((p, i) => { cum += (p.pointsEarned || 0); return { game: i + 1, points: cum }; });
  }, [predictions, activeUserId]);

  const handlePredict = (matchId: string) => {
    if (!activeUserId || predHome < 0 || predAway < 0) return;
    addPrediction({ userId: activeUserId, matchId, predHome, predAway });
    setSelectedMatch(null); setPredHome(0); setPredAway(0);
  };

  const totalPreds = userPredictions.length;
  const correctPreds = userPredictions.filter(p => (p.pointsEarned || 0) > 0).length;
  const accuracy = totalPreds > 0 ? Math.round((correctPreds / totalPreds) * 100) : 0;

  // ---- User Management ----
  if (!activeUserId) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--accent-gold)' }}>{t.pred_title}</h1>
        <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm text-[var(--text-secondary)]">{t.pred_join_desc}</p>
          {users.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)]">{t.pred_existing}</p>
              {users.map(u => (
                <button key={u.id} onClick={() => setActiveUser(u.id)} className="block w-full text-left px-3 py-2 rounded text-sm hover:bg-[var(--bg-hover)]">{u.nickname}</button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={newNickname} onChange={e => setNewNickname(e.target.value)} placeholder={t.pred_nickname}
              className="flex-1 px-3 py-2 rounded-md border text-sm" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
            <button onClick={() => newNickname.trim() && addUser(newNickname.trim())} disabled={!newNickname.trim()}
              className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50" style={{ backgroundColor: 'var(--accent-gold)', color: '#000' }}>{t.pred_join_btn}</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Predict View ----
  if (viewMode === 'predict') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.pred_title}</h1>
            <p className="text-sm text-[var(--text-muted)]">{t.pred_playing_as} <span className="font-semibold text-[var(--text-primary)]">{activeUser?.nickname}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('leaderboard')} className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-card)' }}>{t.pred_leaderboard}</button>
            <button onClick={() => setViewMode('history')} className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-card)' }}>{t.pred_my_stats}</button>
            <button onClick={() => setActiveUser('')} className="px-3 py-1.5 rounded text-xs text-[var(--accent-red)]" style={{ backgroundColor: 'var(--bg-card)' }}>{t.pred_switch}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groupMatches.slice(0, 24).map(m => {
            const ep = predictions.find(p => p.userId === activeUserId && p.matchId === m.id);
            const home = teamMap[m.home], away = teamMap[m.away];
            return (
              <div key={m.id} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="text-xs text-[var(--text-muted)] mb-2">{t.fix_group} {m.group} · {new Date(m.date).toLocaleDateString('zh-CN')}</div>
                <div className="flex items-center justify-between mb-3">
                  <TeamBadge team={home} size="sm" /><span className="text-xs text-[var(--text-muted)]">VS</span><TeamBadge team={away} size="sm" />
                </div>
                {selectedMatch === m.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={20} value={predHome} onChange={e => setPredHome(parseInt(e.target.value)||0)}
                        className="w-14 px-2 py-1 rounded border text-center text-sm tabular-nums" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      <span className="text-xs text-[var(--text-muted)]">-</span>
                      <input type="number" min={0} max={20} value={predAway} onChange={e => setPredAway(parseInt(e.target.value)||0)}
                        className="w-14 px-2 py-1 rounded border text-center text-sm tabular-nums" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      <button onClick={() => handlePredict(m.id)} className="ml-auto px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--accent-gold)', color: '#000' }}>{t.pred_save}</button>
                    </div>
                    <button onClick={() => setSelectedMatch(null)} className="text-xs text-[var(--text-muted)]">{t.pred_cancel}</button>
                  </div>
                ) : (
                  <button onClick={() => { setSelectedMatch(m.id); setPredHome(ep?.predHome||0); setPredAway(ep?.predAway||0); }}
                    className="w-full py-1.5 rounded text-xs font-medium transition-colors"
                    style={{ backgroundColor: ep ? 'color-mix(in srgb, var(--accent-green) 15%, transparent)' : 'var(--bg-hover)', color: ep ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                    {ep ? `✓ ${ep.predHome} - ${ep.predAway}（${t.pred_edit}）` : t.pred_predict_score}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Leaderboard ----
  if (viewMode === 'leaderboard') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.pred_leaderboard_title}</h1>
          <button onClick={() => setViewMode('predict')} className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-card)' }}>{t.pred_back_predict}</button>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">{t.pred_no_data}</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((e, i) => (
              <div key={e.userId} className="flex items-center gap-4 p-4 rounded-lg border"
                style={{ backgroundColor: i===0 ? 'color-mix(in srgb, var(--accent-gold) 10%, var(--bg-card))' : 'var(--bg-card)', borderColor: i===0 ? 'var(--accent-gold)' : 'var(--border-color)' }}>
                <div className="text-2xl font-bold tabular-nums w-8 text-center" style={{ color: i===0?'var(--accent-gold)':'var(--text-muted)' }}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </div>
                <div className="flex-1"><div className="font-semibold">{e.nickname}</div><div className="text-xs text-[var(--text-muted)]">{e.correct}/{e.total} 正确</div></div>
                <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--accent-gold)' }}>{e.score} {t.pred_pts}</div>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-2">{t.pred_scoring_rules}</h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1">
            <li>{t.pred_exact}：<strong style={{ color: 'var(--accent-gold)' }}>+{settings.scoring.exactScore} {t.pred_pts}</strong></li>
            <li>{t.pred_diff}：<strong style={{ color: 'var(--accent-gold)' }}>+{settings.scoring.correctGoalDiff} {t.pred_pts}</strong></li>
            <li>{t.pred_result}：<strong style={{ color: 'var(--accent-gold)' }}>+{settings.scoring.correctResult} {t.pred_pt}</strong></li>
            <li>{t.pred_wrong}：0 {t.pred_pt}</li>
          </ul>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">{t.pred_scoring_note}</p>
        </div>
      </div>
    );
  }

  // ---- History ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.pred_my_stats_title} — {activeUser?.nickname}</h1>
        <button onClick={() => setViewMode('predict')} className="px-3 py-1.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-card)' }}>{t.pred_back_predict}</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{l:t.pred_total_preds,v:totalPreds},{l:t.pred_correct,v:correctPreds,c:'var(--accent-green)'},{l:t.pred_accuracy,v:`${accuracy}%`},{l:t.pred_total_points,v:predictions.filter(p=>p.userId===activeUserId).reduce((s,p)=>s+(p.pointsEarned||0),0),c:'var(--accent-gold)'}].map(({l,v,c}) => (
          <div key={l} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="text-xs text-[var(--text-muted)]">{l}</div>
            <div className="text-2xl font-bold tabular-nums" style={{ color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {scoreHistory.length > 1 && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-sm font-bold mb-4">{t.pred_points_chart}</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={scoreHistory}>
                <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
                <XAxis dataKey="game" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', fontSize: 12 }} />
                <Line type="monotone" dataKey="points" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="rounded-lg border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>{t.pred_all_preds}</h3>
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {userPredictions.map(p => { const match = matches.find(m=>m.id===p.matchId); if(!match) return null;
            return (
              <div key={p.matchId} className="flex items-center justify-between p-3 text-sm">
                <div className="flex items-center gap-2">
                  {teamMap[match.home]&&<TeamBadge team={teamMap[match.home]} size="sm" />}
                  <span className="text-xs tabular-nums">{p.predHome}-{p.predAway}</span>
                  {teamMap[match.away]&&<TeamBadge team={teamMap[match.away]} size="sm" />}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{match.status==='finished'?`${p.pointsEarned||0} ${t.pred_pts}`:t.pred_pending}</div>
              </div>
            );
          })}
          {userPredictions.length===0 && <p className="p-4 text-sm text-[var(--text-muted)]">{t.pred_no_preds}</p>}
        </div>
      </div>
    </div>
  );
}
