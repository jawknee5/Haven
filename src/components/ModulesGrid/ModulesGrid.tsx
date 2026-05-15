import './ModulesGrid.css';

interface Module {
  icon: string;
  title: string;
  desc: string;
}

interface Props {
  modules: Module[];
}

export default function ModulesGrid({ modules }: Props) {
  return (
    <div className="modules-section">
      <h2 className="modules-header">Genesis Modules</h2>
      <div className="modules-grid">
        {modules.map((m, i) => (
          <div key={i} className="module-card">
            <div className="module-icon">{m.icon}</div>
            <div className="module-title">{m.title}</div>
            <div className="module-desc">{m.desc}</div>
            <button className="open-btn">Open</button>
          </div>
        ))}
      </div>
    </div>
  );
}
