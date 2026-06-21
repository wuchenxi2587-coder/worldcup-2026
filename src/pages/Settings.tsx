import { useSettingsStore } from '../store/settingsStore';
import { usePredictionStore } from '../store/predictionStore';
import { zh, en } from '../i18n';

export default function Settings() {
  const { settings, setTheme, setLanguage, setScoring, reset } = useSettingsStore();
  const clearAll = usePredictionStore(s => s.clearAll);
  const t = settings.language === 'zh' ? zh : en;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div><h1 className="text-2xl font-bold" style={{ color: 'var(--accent-gold)' }}>{t.set_title}</h1></div>

      <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold">{t.set_appearance}</h3>
        <div className="flex gap-3">
          <button onClick={() => setTheme('dark')} className="flex-1 p-3 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: settings.theme === 'dark' ? 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' : 'var(--bg-hover)', borderColor: settings.theme === 'dark' ? 'var(--accent-gold)' : 'var(--border-color)' }}>
            <span className="text-lg">🌙</span><div className="text-sm mt-1 font-medium">{t.set_dark}</div>
          </button>
          <button onClick={() => setTheme('light')} className="flex-1 p-3 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: settings.theme === 'light' ? 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' : 'var(--bg-hover)', borderColor: settings.theme === 'light' ? 'var(--accent-gold)' : 'var(--border-color)' }}>
            <span className="text-lg">☀️</span><div className="text-sm mt-1 font-medium">{t.set_light}</div>
          </button>
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold">{t.set_language}</h3>
        <div className="flex gap-3">
          <button onClick={() => setLanguage('zh')} className="flex-1 p-3 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: settings.language === 'zh' ? 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' : 'var(--bg-hover)', borderColor: settings.language === 'zh' ? 'var(--accent-gold)' : 'var(--border-color)' }}>
            <span className="text-lg">🇨🇳</span><div className="text-sm mt-1 font-medium">中文</div>
          </button>
          <button onClick={() => setLanguage('en')} className="flex-1 p-3 rounded-lg border text-center transition-colors"
            style={{ backgroundColor: settings.language === 'en' ? 'color-mix(in srgb, var(--accent-gold) 15%, transparent)' : 'var(--bg-hover)', borderColor: settings.language === 'en' ? 'var(--accent-gold)' : 'var(--border-color)' }}>
            <span className="text-lg">🇺🇸</span><div className="text-sm mt-1 font-medium">English</div>
          </button>
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-bold">{t.set_scoring}</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm"><span>{t.set_exact_score}</span>
            <input type="number" min={1} max={20} value={settings.scoring.exactScore} onChange={e => setScoring({ ...settings.scoring, exactScore: parseInt(e.target.value) || 5 })}
              className="w-16 px-2 py-1 rounded border text-center text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </label>
          <label className="flex items-center justify-between text-sm"><span>{t.set_goal_diff}</span>
            <input type="number" min={1} max={20} value={settings.scoring.correctGoalDiff} onChange={e => setScoring({ ...settings.scoring, correctGoalDiff: parseInt(e.target.value) || 3 })}
              className="w-16 px-2 py-1 rounded border text-center text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </label>
          <label className="flex items-center justify-between text-sm"><span>{t.set_correct_result}</span>
            <input type="number" min={1} max={20} value={settings.scoring.correctResult} onChange={e => setScoring({ ...settings.scoring, correctResult: parseInt(e.target.value) || 1 })}
              className="w-16 px-2 py-1 rounded border text-center text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
          </label>
        </div>
      </div>

      <div className="rounded-lg border p-6 space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--accent-red)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--accent-red)' }}>{t.set_danger}</h3>
        <button onClick={() => { if (window.confirm('确认清除所有竞猜数据？此操作不可撤销。')) clearAll(); }}
          className="px-4 py-2 rounded-md text-sm font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-red) 20%, transparent)', color: 'var(--accent-red)' }}>
          {t.set_clear_data}
        </button>
        <button onClick={() => { if (window.confirm('确认重置所有设置？')) reset(); }}
          className="ml-3 px-4 py-2 rounded-md text-sm text-[var(--text-muted)]" style={{ backgroundColor: 'var(--bg-hover)' }}>
          {t.set_reset}
        </button>
      </div>
    </div>
  );
}
