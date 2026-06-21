import { Link } from 'react-router-dom';
import type { Match, Team } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';

interface Props { match: Match; homeTeam?: Team; awayTeam?: Team; compact?: boolean; }

export default function FixtureCard({ match, homeTeam, awayTeam, compact = false }: Props) {
  const { settings } = useSettingsStore();
  const lang = settings.language;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const date = new Date(match.date);

  const displayName = (team?: Team) => lang === 'zh' ? (team?.nameZh || team?.name || '待定') : (team?.name || 'TBD');
  const flag = (team?: Team) => team?.flag || '❓';

  if (compact) {
    return (
      <Link to={`/match/${match.id}`}
        className="card-hover block px-3 py-2 bg-white rounded no-underline"
        style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 text-[13px]">
            <span>{flag(homeTeam)}</span>
            <span className="truncate font-medium">{displayName(homeTeam)}</span>
          </div>
          <div className="text-center min-w-[60px]">
            {isFinished && match.score ? (
              <span className="text-base font-bold tabular-nums">{match.score.home}-{match.score.away}</span>
            ) : isLive && match.score ? (
              <span className="text-base font-bold tabular-nums" style={{ color: 'var(--live-red)' }}>{match.score.home}-{match.score.away}</span>
            ) : (
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : undefined, { month: 'numeric', day: 'numeric' })}
              </span>
            )}
          </div>
          <div className="flex-1 flex items-center justify-end gap-1.5 text-[13px]">
            <span className="truncate font-medium">{displayName(awayTeam)}</span>
            <span>{flag(awayTeam)}</span>
          </div>
        </div>
      </Link>
    );
  }

  const stageLabel = lang === 'zh'
    ? { group: '小组赛', r32: '32强', r16: '16强', qf: '1/4决赛', sf: '半决赛', final: '决赛', third: '三四名' }[match.stage] || match.stage
    : match.stage;

  return (
    <Link to={`/match/${match.id}`}
      className="card-hover block rounded-lg bg-white overflow-hidden no-underline"
      style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
      
      {/* Header: stage + date */}
      <div className="flex items-center justify-between px-3 py-1.5 text-[11px]" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-hover)' }}>
        <span>{stageLabel}{match.group ? ` ${match.group}组` : ''}</span>
        <span>{date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : undefined, { month: 'long', day: 'numeric' })} {date.toLocaleTimeString(lang === 'zh' ? 'zh-CN' : undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Main body */}
      <div className="px-4 py-3">
        <div className="flex items-center">
          {/* Home */}
          <div className="flex-1 text-center">
            <div className="text-2xl mb-1">{flag(homeTeam)}</div>
            <div className="text-[13px] font-medium leading-tight">{displayName(homeTeam)}</div>
          </div>

          {/* Score */}
          <div className="px-4 text-center min-w-[80px]">
            {isLive && (
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="live-dot inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--live-red)' }} />
                <span className="text-[10px] font-bold" style={{ color: 'var(--live-red)' }}>直播中</span>
              </div>
            )}
            {isFinished && match.score ? (
              <div className="text-2xl font-extrabold tabular-nums tracking-tight">{match.score.home}-{match.score.away}</div>
            ) : isLive && match.score ? (
              <div className="text-2xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--live-red)' }}>{match.score.home}-{match.score.away}</div>
            ) : (
              <div className="text-lg font-bold text-[var(--text-muted)]">VS</div>
            )}
            {isFinished && <span className="text-[10px] text-[var(--text-muted)]">已结束</span>}
          </div>

          {/* Away */}
          <div className="flex-1 text-center">
            <div className="text-2xl mb-1">{flag(awayTeam)}</div>
            <div className="text-[13px] font-medium leading-tight">{displayName(awayTeam)}</div>
          </div>
        </div>
      </div>

      {/* Footer: venue */}
      <div className="px-3 py-1.5 text-[11px] border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
        {match.stadium} · {match.city}
      </div>
    </Link>
  );
}
