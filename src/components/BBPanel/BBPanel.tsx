import { useState } from 'react';
import './BBPanel.css';

export default function BBPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`bb-panel ${open ? 'open' : ''}`}>
      <div className="bb-header" onClick={() => setOpen(!open)}>
        🤖 BB — How can I help you build today?
      </div>

      {open && (
        <div className="bb-body">
          <button onClick={() => console.log('Generate workflow')}>Generate workflow</button>
          <button onClick={() => console.log('Debug logs')}>Debug logs</button>
          <button onClick={() => console.log('Create module')}>Create module</button>
          <button onClick={() => console.log('Summarize activity')}>Summarize activity</button>
          <input type="text" placeholder="Ask BB anything…" />
        </div>
      )}
    </div>
  );
}
