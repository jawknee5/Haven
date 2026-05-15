import { create } from 'zustand';
import { UserProfile } from '../types';
import { profileApi } from '../api/profileApi';

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  update: (patch: Partial<UserProfile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const profile = await profileApi.fetch();
      set({ profile, loading: false });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load profile', loading: false });
    }
  },

  async update(patch) {
    const prev = get().profile;
    if (!prev) return;
    const optimistic = { ...prev, ...patch };
    set({ profile: optimistic });
    try {
      const updated = await profileApi.update(patch);
      set({ profile: updated });
    } catch (e) {
      set({ profile: prev });
      throw e;
    }
  },
}));
