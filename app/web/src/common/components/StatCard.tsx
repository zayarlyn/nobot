interface StatCardProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

export default function StatCard({ label, value, valueClassName = '' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${valueClassName}`}>{value}</div>
    </div>
  );
}
