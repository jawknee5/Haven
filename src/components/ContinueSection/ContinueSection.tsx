import './ContinueSection.css';

interface ContinueItem {
  title: string;
  time: string;
}

interface Props {
  items: ContinueItem[];
}

export default function ContinueSection({ items }: Props) {
  return (
    <div className="continue-section">
      <h2 className="continue-header">Continue Where You Left Off</h2>
      <div className="continue-scroll">
        {items.map((item, i) => (
          <div key={i} className="continue-card">
            <div className="continue-title">{item.title}</div>
            <div className="continue-time">{item.time}</div>
            <button className="resume-btn">Resume</button>
          </div>
        ))}
      </div>
    </div>
  );
}
