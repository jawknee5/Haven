import './DashboardCards.css';

interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  stats: Stat[];
}

export default function DashboardCards({ stats }: Props) {
  return (
    <div className="dashboard-grid">
      {stats.map((s, i) => (
        <div key={i} className="dash-card">
          <div className="dash-number">{s.value}</div>
          <div className="dash-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
