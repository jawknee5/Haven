export type UserRole = 'individual' | 'caseworker' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  zip: string | null;
  housingStatus: string | null;
  employmentStatus: string | null;
  assistanceCategories: string[];
  notificationsEnabled: boolean;
  offlineModeEnabled: boolean;
  streakDays: number;
  xp: number;
  level: number;
}
