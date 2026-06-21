import type { Team } from '../../types';

interface Props {
  team?: Team;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  lang?: 'zh' | 'en';
}

export default function TeamBadge({ team, size = 'md', showName = true, lang = 'zh' }: Props) {
  const sizes = { sm: 'text-xs gap-1', md: 'text-sm gap-1.5', lg: 'text-base gap-2' };
  const flagSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

  if (!team) {
    return (
      <div className={`flex items-center ${sizes[size]} text-[var(--text-muted)]`}>
        <span>❓</span>
        {showName && <span>{lang === 'zh' ? '待定' : 'TBD'}</span>}
      </div>
    );
  }

  const displayName = lang === 'zh' ? (team.nameZh || team.name) : team.name;

  return (
    <div className={`flex items-center ${sizes[size]} font-medium`}>
      <span className={flagSizes[size]}>{team.flag}</span>
      {showName && <span className="tabular-nums">{displayName}</span>}
    </div>
  );
}
