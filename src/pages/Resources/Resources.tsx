import React from 'react';

export default function Resources() {
  const categories = [
    {
      name: 'Food & Nutrition',
      icon: '🥫',
      resources: [
        { name: 'San Jose Food Bank', status: 'Open', distance: '0.5 mi' },
        { name: 'Community Meals Program', status: 'Open', distance: '1.2 mi' },
        { name: 'Nutrition Workshops', status: 'Tomorrow', distance: '2.1 mi' },
      ]
    },
    {
      name: 'Health & Wellness',
      icon: '⚕️',
      resources: [
        { name: 'Valley Medical Center', status: '24/7', distance: '2.1 mi' },
        { name: 'Mental Health Clinic', status: 'By Appointment', distance: '1.8 mi' },
        { name: 'Free Health Screenings', status: 'Saturdays', distance: '3.2 mi' },
      ]
    },
    {
      name: 'Housing & Support',
      icon: '🏠',
      resources: [
        { name: 'Emergency Shelter', status: '24/7', distance: '1.2 mi' },
        { name: 'Transitional Housing', status: 'Available', distance: '3.5 mi' },
        { name: 'Housing Assistance Program', status: 'Mon-Fri', distance: '2.0 mi' },
      ]
    },
    {
      name: 'Jobs & Training',
      icon: '💼',
      resources: [
        { name: 'Tech Career Academy', status: 'Enrolling', distance: '0.5 mi' },
        { name: 'Job Placement Services', status: 'Mon-Fri', distance: '1.5 mi' },
        { name: 'Resume Workshops', status: 'Weekly', distance: '2.3 mi' },
      ]
    },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Resources
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {categories.map((category, idx) => (
          <div key={idx} style={{
            background: 'linear-gradient(135deg, rgba(26, 30, 36, 0.8), rgba(20, 23, 28, 0.9))',
            border: '1px solid rgba(42, 47, 54, 0.8)',
            borderRadius: '12px',
            padding: '24px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '32px' }}>{category.icon}</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{category.name}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.resources.map((resource, ridx) => (
                <div key={ridx} style={{
                  padding: '12px',
                  background: 'rgba(13, 15, 18, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(42, 47, 54, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                  e.currentTarget.style.background = 'rgba(13, 15, 18, 0.8)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(42, 47, 54, 0.4)';
                  e.currentTarget.style.background = 'rgba(13, 15, 18, 0.6)';
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{resource.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#a7b0bc' }}>
                    <span>{resource.status}</span>
                    <span>{resource.distance}</span>
                  </div>
                </div>
              ))}
            </div>

            <button style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px',
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
            }}>
              View All
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
