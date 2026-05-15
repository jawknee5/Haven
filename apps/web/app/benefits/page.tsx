"use client";

import { useEffect, useState } from "react";

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/benefits")
      .then(r => r.json())
      .then(setBenefits);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Benefits</h1>

      {benefits.map((b, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <strong>{b.name}</strong>
          <div>{b.description}</div>
        </div>
      ))}
    </div>
  );
}
