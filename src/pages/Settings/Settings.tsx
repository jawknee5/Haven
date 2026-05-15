import React, { useState } from 'react';
import { useAuthStore } from '../../stores/index';
import { useIsMobile } from '../../hooks/useMediaQuery';

/**
 * Settings Page
 * User preferences, theme, notifications, privacy
 */

export default function Settings() {
  const isMobile = useIsMobile();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'notifications' | 'privacy'>('account');
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    emailNotifications: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
    pushNotifications: JSON.parse(localStorage.getItem('pushNotifications') || 'true'),
    dataCollection: JSON.parse(localStorage.getItem('dataCollection') || 'true'),
    twoFactor: JSON.parse(localStorage.getItem('twoFactorEnabled') || 'false'),
    language: localStorage.getItem('language') || 'en'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value as string);
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      padding: isMobile ? '16px' : '32px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '32px',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0d66d 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Settings
        </h1>
        <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Manage your preferences and account</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#86EFAC',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ✓ Settings saved successfully
        </div>
      )}

      <div style({ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '200px 1fr', gap: '24px' }}>
        {/* Sidebar Navigation */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: '8px',
          overflow: 'auto'
        }}>
          {[
            { id: 'account', label: '👤 Account', icon: '👤' },
            { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
            { id: 'notifications', label: '🔔 Notifications', icon: '🔔' },
            { id: 'privacy', label: '🔒 Privacy', icon: '🔒' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 16px',
                background: activeTab === tab.id ? 'rgba(212, 175, 55, 0.2)' : 'rgba(26, 30, 36, 0.8)',
                border: '1px solid ' + (activeTab === tab.id ? 'rgba(212, 175, 55, 0.5)' : 'rgba(42, 47, 54, 0.8)'),
                color: activeTab === tab.id ? '#FFD700' : '#A0A0A0',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'left'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(26, 30, 36, 0.8)',
          border: '1px solid rgba(42, 47, 54, 0.8)',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '24px'
        }}>
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Account</h2>

              <SettingGroup label="Email" value={user?.email || 'N/A'} editable={false} />
              <SettingGroup label="Name" value={user?.name || 'N/A'} editable={false} />

              <SettingToggle
                label="Two-Factor Authentication"
                description="Add an extra layer of security"
                value={settings.twoFactor}
                onChange={(v) => handleChange('twoFactor', v)}
              />

              <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '16px', marginTop: '16px' }}>
                <button style={{
                  padding: '10px 20px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FCA5A5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}>
                  🔓 Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Preferences</h2>

              <div>
                <label style={{ fontSize: '12px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(13, 15, 18, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="dark">Dark (Current)</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(13, 15, 18, 0.8)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Notifications</h2>

              <SettingToggle
                label="Email Notifications"
                description="Receive email updates about your cases"
                value={settings.emailNotifications}
                onChange={(v) => handleChange('emailNotifications', v)}
              />

              <SettingToggle
                label="Push Notifications"
                description="Receive browser push notifications"
                value={settings.pushNotifications}
                onChange={(v) => handleChange('pushNotifications', v)}
              />
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div style({ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Privacy</h2>

              <SettingToggle
                label="Data Collection"
                description="Allow analytics and usage tracking (helps us improve)"
                value={settings.dataCollection}
                onChange={(v) => handleChange('dataCollection', v)}
              />

              <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '16px', marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#A0A0A0', marginBottom: '12px' }}>
                  🔐 Your data is encrypted and never shared with third parties.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFF44F 50%, #FFD700 100%)',
            color: '#0a0e27',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}

function SettingGroup({ label, value, editable }: { label: string; value: string; editable: boolean }) {
  return (
    <div>
      <label style={{ fontSize: '12px', color: '#A0A0A0', fontWeight: '700', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        disabled={!editable}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: 'rgba(13, 15, 18, 0.8)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          boxSizing: 'border-box',
          opacity: editable ? 1 : 0.6,
          cursor: editable ? 'text' : 'not-allowed'
        }}
      />
    </div>
  );
}

function SettingToggle({
  label,
  description,
  value,
  onChange
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#A0A0A0' }}>{description}</div>
      </div>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          cursor: 'pointer',
          width: '20px',
          height: '20px',
          accentColor: '#FFD700'
        }}
      />
    </div>
  );
}
