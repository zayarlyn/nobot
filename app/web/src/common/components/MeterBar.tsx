interface MeterBarProps {
  value: number; // 0–100
  variant?: 'good' | 'warn' | 'bad';
}

function autoVariant(value: number): 'good' | 'warn' | 'bad' {
  if (value > 60) return 'good';
  if (value > 30) return 'warn';
  return 'bad';
}

export default function MeterBar({ value, variant }: MeterBarProps) {
  const cls = variant ?? autoVariant(value);
  return (
    <div className="meter-track">
      <div className={`meter-fill ${cls}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
