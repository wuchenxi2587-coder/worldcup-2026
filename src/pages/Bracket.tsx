import { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useSettingsStore } from '../store/settingsStore';
import TeamBadge from '../components/Common/TeamBadge';
import { zh, en } from '../i18n';

type BracketSlot = { id: string; label: string; teamId: string | null; nextSlotId: string | null; x: number; y: number; stage: string };

export default function Bracket() {
  const { teams } = useDataStore();
  const { settings } = useSettingsStore();
  const t = settings.language === 'zh' ? zh : en;
  const [zoom, setZoom] = useState(1);

  const teamMap = useMemo(() => {
    const m: Record<string, typeof teams[0]> = {};
    teams.forEach(t => { m[t.id] = t; });
    return m;
  }, [teams]);

  const slots = useMemo((): BracketSlot[] => {
    const r: BracketSlot[] = [];
    for (let i = 0; i < 16; i++) {
      r.push({ id: `r32_h${i}`, label: `R32-${i+1}H`, teamId: null, nextSlotId: `r16_${Math.floor(i/2)}`, x: 0, y: i*1.5, stage: 'r32' });
      r.push({ id: `r32_a${i}`, label: `R32-${i+1}A`, teamId: null, nextSlotId: `r16_${Math.floor(i/2)}`, x: 0, y: i*1.5+0.7, stage: 'r32' });
    }
    for (let i = 0; i < 8; i++) r.push({ id: `r16_${i}`, label: `R16-${i+1}`, teamId: null, nextSlotId: `qf_${Math.floor(i/2)}`, x: 1, y: i*3+0.35, stage: 'r16' });
    for (let i = 0; i < 4; i++) r.push({ id: `qf_${i}`, label: `QF-${i+1}`, teamId: null, nextSlotId: `sf_${Math.floor(i/2)}`, x: 2, y: i*6+0.35, stage: 'qf' });
    for (let i = 0; i < 2; i++) r.push({ id: `sf_${i}`, label: i===0?'半决赛 1':'半决赛 2', teamId: null, nextSlotId: 'final', x: 3, y: i*12+0.35, stage: 'sf' });
    r.push({ id: 'final', label: '🏆 决赛', teamId: null, nextSlotId: null, x: 4, y: 6, stage: 'final' });
    return r;
  }, []);

  const stageLabels = [t.bkt_r32, t.bkt_r16, t.bkt_qf, t.bkt_sf, t.bkt_final];
  const cellW = 180, cellH = 28;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.bkt_title}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t.bkt_subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-card)' }}>−</button>
          <span className="px-2 py-1 text-xs text-[var(--text-muted)]">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-card)' }}>+</button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        <div className="flex gap-0" style={{ minWidth: 900 }}>
          {[0,1,2,3,4].map(si => {
            const ss = slots.filter(s => s.x === si);
            return (
              <div key={si} className="flex-shrink-0">
                <div className="text-xs font-bold uppercase tracking-wider mb-2 px-2" style={{ color: 'var(--accent-cyan)' }}>{stageLabels[si]}</div>
                <div className="flex flex-col justify-around" style={{ minHeight: si===4?150:500 }}>
                  {ss.map(slot => {
                    const team = slot.teamId ? teamMap[slot.teamId] : null;
                    return (
                      <div key={slot.id} className="mx-1 rounded border px-2 py-1 flex items-center gap-2"
                        style={{ width: cellW, height: cellH, backgroundColor: team ? 'var(--bg-card)' : 'var(--bg-hover)', borderColor: 'var(--border-color)', opacity: team ? 1 : 0.5 }}>
                        {team ? <TeamBadge team={team} size="sm" /> : <span className="text-xs text-[var(--text-muted)]">{t.bkt_tbd}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] italic">{t.bkt_disclaimer}</p>
    </div>
  );
}
