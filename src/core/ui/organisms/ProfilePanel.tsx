import { useState } from 'react';
import { Avatar } from '../atoms/Avatar';
import { Toggle } from '../atoms/Toggle';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  streakDays?: number;
  notificationsEnabled?: boolean;
  offlineModeEnabled?: boolean;
}

interface ProfilePanelProps {
  profile: UserProfile | null;
  loading?: boolean;
  onUpdateProfile?: (patch: Partial<UserProfile>) => Promise<void>;
}

export function ProfilePanel({ profile, loading, onUpdateProfile }: ProfilePanelProps) {
  const [notifications, setNotifications] = useState(profile?.notificationsEnabled ?? true);
  const [offlineMode, setOfflineMode] = useState(profile?.offlineModeEnabled ?? false);

  if (loading || !profile) {
    return <div className="glass-card p-6 text-center text-haven-textMuted">Loading profile...</div>;
  }

  const handleNotificationsChange = (val: boolean) => {
    setNotifications(val);
    onUpdateProfile?.({ notificationsEnabled: val });
  };

  const handleOfflineChange = (val: boolean) => {
    setOfflineMode(val);
    onUpdateProfile?.({ offlineModeEnabled: val });
  };

  return (
    <div className="space-y-4">
      {/* User Card */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-4">
          <Avatar initials={profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-haven-textPrimary">{profile.name}</h2>
            <p className="text-sm text-haven-textMuted">{profile.role}</p>
            {profile.streakDays && <Badge variant="streak">{profile.streakDays} day streak</Badge>}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-haven-textPrimary uppercase tracking-wider">Preferences</h3>
        <Toggle label="Notifications" checked={notifications} onChange={(e) => handleNotificationsChange(e.target.checked)} />
        <Toggle label="Offline Mode" checked={offlineMode} onChange={(e) => handleOfflineChange(e.target.checked)} />
      </div>

      {/* Actions */}
      <div className="glass-card p-4 space-y-3">
        <Button variant="secondary" fullWidth>
          Manage Offline Data
        </Button>
        <Button variant="ghost" fullWidth className="text-haven-error">
          Sign Out
        </Button>
      </div>

      {/* Version */}
      <p className="text-center text-[10px] text-haven-textMuted">HAVEN v2.4.1</p>
    </div>
  );
}
