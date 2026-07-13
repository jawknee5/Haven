import React from 'react';

export default function CurriculumPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{
        fontSize: '32px', marginBottom: '8px',
        background: 'linear-gradient(135deg,#d4af37 0%,#f0d66d 50%,#d4af37 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Onboarding Curriculum
      </h1>
      <p style={{ color: '#a0a0a0', marginBottom: '32px', fontSize: '14px' }}>
        Role-aware learning modules to get you up to speed with HAVEN.
      </p>
      <div style={{
        background: 'rgba(26,30,36,0.8)', border: '1px solid rgba(42,47,54,0.8)',
        borderRadius: '12px', padding: '32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <p style={{ color: '#a0a0a0' }}>
          Curriculum modules load from <code>/api/curriculum/modules</code>.<br />
          Ensure the backend <code>curriculum_router</code> is wired to see content here.
        </p>
      </div>
    </div>
  );
}
