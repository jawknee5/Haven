import React, { useState } from 'react';
import { useAuthStore } from '../../stores/index';
import { apiClient } from '../../lib/api';

export default function Profile() {
  const { user, logout } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  });

  if (!user) {
    return (
      <div style={{ padding: '32px', color: '#fff' }}>
        Not logged in.
      </div>
    );
  }

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const roleLabel =
    user.role === 'caseworker' ? 'Caseworker' :
    user.role === 'admin'      ? 'Admin'       : 'Resident';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const updated = await apiClient.patch<typeof user>('/api/users/me', {
        name: form.name,
        phone: form.phone,
      });
      // Persist updated user into auth store + localStorage
      const merged = { ...user, ...updated };
      localStorage.setItem('auth_user', JSON.stringify(merged));
      useAuthStore.setState({ user: merged });
      setEditMode(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name ?? '', phone: user.phone ?? '' });
    setSaveError('');
    setEditMode(false);
  };

  const card: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgba(26,30,36,0.8), rgba(20,23,28,0.9))',
    border: '1px solid rgba(42,47,54,0.8)',
    borderRadius: '12px',
    padding: '32px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(13,15,18,0.6)',
    border: '1px solid rgba(42,47,54,0.4)',
    borderRadius: '6px',
    color: editMode ? '#fff' : '#a7b0bc',
    fontSize: '14px',
    cursor: editMode ? 'text' : 'default',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    color: '#a7b0bc',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{
        fontSize: '32px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg,#d4af37 0%,#f0d66d 50%,#d4af37 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Profile
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        {/* Identity card */}
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👤</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{user.name}</h2>
          <p style={{ color: '#a7b0bc', marginBottom: '16px', fontSize: '14px' }}>{user.email}</p>
          <p style={{ color: '#a7b0bc', marginBottom: '24px', fontSize: '13px' }}>Joined {joinDate}</p>

          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '6px',
            color: '#d4af37',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            {roleLabel}
          </div>

          {!editMode && (
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(212,175,55,0.1)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#d4af37',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Contact / edit card */}
        <div style={card}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#d4af37' }}>
            Contact Information
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={editMode ? form.name : user.name}
                  disabled={!editMode}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ ...inputStyle, color: '#a7b0bc', cursor: 'default' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  value={editMode ? form.phone : (user.phone ?? '')}
                  disabled={!editMode}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {saveError && (
              <p style={{ color: '#f87171', fontSize: '13px', marginTop: '12px' }}>{saveError}</p>
            )}

            {editMode && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(212,175,55,0.15)',
                    border: '1px solid rgba(212,175,55,0.5)',
                    color: '#d4af37',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a7b0bc',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Account Settings */}
      <div style={card}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#d4af37' }}>
          Account Settings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🔒', label: 'Change Password' },
            { icon: '🔔', label: 'Notification Preferences' },
            { icon: '⚙️', label: 'Privacy Settings' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              style={{
                padding: '12px 16px',
                background: 'rgba(13,15,18,0.6)',
                border: '1px solid rgba(42,47,54,0.4)',
                color: '#fff',
                borderRadius: '6px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {icon} {label}
            </button>
          ))}

          <button
            onClick={logout}
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ff6b6b',
              borderRadius: '6px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
