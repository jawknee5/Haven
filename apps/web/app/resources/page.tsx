"use client";

import { useEffect, useState } from "react";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/resources")
      .then(r => r.json())
      .then(setResources);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Resources</h1>

      {resources.map((r, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <strong>{r.name}</strong>
          <div>{r.description}</div>
        </div>
      ))}
    </div>
  );
}
