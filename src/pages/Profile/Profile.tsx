import React, { useState } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: 'Demo User',
    email: 'demo@pathway.local',
    phone: '(408) 555-0123',
    location: 'San Jose, CA',
    joinDate: 'January 15, 2025',
    tier: 'Basic',
    avatar: '👤'
  });

  const [editMode, setEditMode] = useState(false);

  const achievements = [
    { title: 'First Steps', description: 'Completed your first assessment', icon: '🎯' },
    { title: 'Resource Explorer', description: 'Visited 5 resources', icon: '🗺️' },
    { title: 'Goal Setter', description: 'Created your first goal', icon: '🎪' },
    { title: 'Community Helper', description: 'Helped another member', icon: '🤝' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '32px', background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
        Profile
      </h1>

      {/* Profile Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        marginBottom: '32px'
      }}>
        {/* Profile Info */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 30, 36, 0.8), rgba(20, 23, 28, 0.9))',
          border: '1px solid rgba(42, 47, 54, 0.8)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>{profile.avatar}</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{profile.name}</h2>
          <p style={{ color: '#a7b0bc', marginBottom: '24px' }}>
            Joined {profile.joinDate}
          </p>

          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '6px',
            color: '#d4af37',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            {profile.tier} Member
          </div>

          <button style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#d4af37',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }} onClick={() => setEditMode(!editMode)} onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
          }}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Contact Info */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 30, 36, 0.8), rgba(20, 23, 28, 0.9))',
          border: '1px solid rgba(42, 47, 54, 0.8)',
          borderRadius: '12px',
          padding: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#d4af37' }}>
            Contact Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a7b0bc', marginBottom: '6px', textTransform: 'uppercase' }}>
                Email
              </label>
              <input type="email" value={profile.email} disabled={!editMode} style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(13, 15, 18, 0.6)',
                border: '1px solid rgba(42, 47, 54, 0.4)',
                borderRadius: '6px',
                color: '#fff',
                cursor: editMode ? 'text' : 'default'
              }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a7b0bc', marginBottom: '6px', textTransform: 'uppercase' }}>
                Phone
              </label>
              <input type="tel" value={profile.phone} disabled={!editMode} style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(13, 15, 18, 0.6)',
                border: '1px solid rgba(42, 47, 54, 0.4)',
                borderRadius: '6px',
                color: '#fff',
                cursor: editMode ? 'text' : 'default'
              }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#a7b0bc', marginBottom: '6px', textTransform: 'uppercase' }}>
                Location
              </label>
              <input type="text" value={profile.location} disabled={!editMode} style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(13, 15, 18, 0.6)',
                border: '1px solid rgba(42, 47, 54, 0.4)',
                borderRadius: '6px',
                color: '#fff',
                cursor: editMode ? 'text' : 'default'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Achievements</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {achievements.map((ach, idx) => (
          <div key={idx} style={{
            background: 'rgba(26, 30, 36, 0.8)',
            border: '1px solid rgba(42, 47, 54, 0.8)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{ach.icon}</div>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{ach.title}</h4>
            <p style={{ fontSize: '12px', color: '#a7b0bc' }}>{ach.description}</p>
          </div>
        ))}
      </div>

      {/* Account Settings */}
      <div style={{
        background: 'rgba(26, 30, 36, 0.8)',
        border: '1px solid rgba(42, 47, 54, 0.8)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#d4af37' }}>
          Account Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button style={{
            padding: '12px 16px',
            background: 'rgba(13, 15, 18, 0.6)',
            border: '1px solid rgba(42, 47, 54, 0.4)',
            color: '#fff',
            borderRadius: '6px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(42, 47, 54, 0.4)';
          }}>
            🔒 Change Password
          </button>

          <button style={{
            padding: '12px 16px',
            background: 'rgba(13, 15, 18, 0.6)',
            border: '1px solid rgba(42, 47, 54, 0.4)',
            color: '#fff',
            borderRadius: '6px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(42, 47, 54, 0.4)';
          }}>
            🔔 Notification Preferences
          </button>

          <button style={{
            padding: '12px 16px',
            background: 'rgba(13, 15, 18, 0.6)',
            border: '1px solid rgba(42, 47, 54, 0.4)',
            color: '#fff',
            borderRadius: '6px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(42, 47, 54, 0.4)';
          }}>
            ⚙️ Privacy Settings
          </button>

          <button style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ff6b6b',
            borderRadius: '6px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}>
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
