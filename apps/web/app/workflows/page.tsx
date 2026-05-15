"use client";

import { useEffect, useState } from "react";

export default function WorkflowsPage() {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/workflows")
      .then(r => r.json())
      .then(setSteps);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Workflows</h1>

      {steps.map((s, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <strong>Step {i + 1}</strong>
          <div>{s.description}</div>
        </div>
      ))}
    </div>
  );
}
