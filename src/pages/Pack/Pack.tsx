import React, { useState } from 'react';

export default function Pack() {
  const [items, setItems] = useState([
    { id: 1, name: 'Birth Certificate', category: 'ID & Documents', uploaded: true },
    { id: 2, name: 'Social Security Card', category: 'ID & Documents', uploaded: true },
    { id: 3, name: 'Driver\'s License', category: 'ID & Documents', uploaded: false },
    { id: 4, name: 'Employment Verification', category: 'Job Documents', uploaded: true },
    { id: 5, name: 'Medical Records', category: 'Health Documents', uploaded: false },
    { id: 6, name: 'References', category: 'Job Documents', uploaded: true },
  ]);

  const categories = [...new Set(items.map(i => i.category))];
  const progress = Math.round((items.filter(i => i.uploaded).length / items.length) * 100);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px', background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Your Pack
      </h1>

      <p style={{ color: '#a7b0bc', marginBottom: '32px', fontSize: '14px' }}>
        Organize and store important documents in one secure place.
      </p>

      {/* Progress */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(42, 47, 54, 0.8)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontWeight: '600' }}>Documents Complete</span>
          <span style={{ color: '#d4af37', fontWeight: '700' }}>{progress}%</span>
        </div>
        <div style={{
          background: 'rgba(42, 47, 54, 0.4)',
          borderRadius: '8px',
          height: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #d4af37, #f0d66d)',
            width: `${progress}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Documents by Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {categories.map((category, cidx) => (
          <div key={cidx} style={{
            background: 'rgba(26, 30, 36, 0.8)',
            border: '1px solid rgba(42, 47, 54, 0.8)',
            borderRadius: '12px',
            padding: '24px',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#d4af37' }}>
              {category}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.filter(i => i.category === category).map((item, iidx) => (
                <div key={iidx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(13, 15, 18, 0.6)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(13, 15, 18, 0.8)';
                  e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(13, 15, 18, 0.6)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}>
                  <div style={{
                    fontSize: '20px',
                    minWidth: '24px'
                  }}>
                    {item.uploaded ? '✅' : '❌'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#a7b0bc' }}>
                      {item.uploaded ? 'Uploaded' : 'Not uploaded'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Button */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button style={{
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
          color: '#0a1a2f',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '700',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'all 0.2s'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.3)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          + Add New Document
        </button>
      </div>
    </div>
  );
}
