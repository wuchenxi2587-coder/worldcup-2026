interface Props {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export default function KpiCard({ value, label, prefix, suffix }: Props) {
  return (
    <div
      className="card-lift p-4 rounded-lg border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums tracking-tight animate-count-up">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
    </div>
  );
}
