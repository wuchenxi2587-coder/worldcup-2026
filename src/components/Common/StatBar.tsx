interface Props {
  label: string;
  home: number;
  away: number;
  maxValue?: number;
  unit?: string;
}

export default function StatBar({ label, home, away, maxValue = 100, unit = '%' }: Props) {
  const homePct = (home / maxValue) * 100;
  const awayPct = (away / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-[var(--text-secondary)]">
        <span className="font-semibold tabular-nums">{home}{unit}</span>
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{away}{unit}</span>
      </div>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-l-full transition-all duration-500"
          style={{ width: `${homePct}%`, backgroundColor: 'var(--accent-cyan)' }}
        />
        <div
          className="h-full rounded-r-full transition-all duration-500"
          style={{ width: `${awayPct}%`, backgroundColor: 'var(--accent-red)' }}
        />
      </div>
    </div>
  );
}
