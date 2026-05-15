import './TaskPreview.css';

interface Task {
  icon: string;
  title: string;
  date: string;
}

interface Props {
  tasks: Task[];
}

export default function TaskPreview({ tasks }: Props) {
  return (
    <div className="task-preview">
      <div className="task-cards">
        {tasks.map((task, i) => (
          <div key={i} className="task-card">
            <div className="task-icon">{task.icon}</div>
            <div className="task-title">{task.title}</div>
            <div className="task-date">{task.date}</div>
          </div>
        ))}
      </div>
      <button className="view-all">View All Tasks →</button>
    </div>
  );
}
