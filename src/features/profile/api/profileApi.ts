import { UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const profileApi = {
  fetch: (): Promise<UserProfile> =>
    fetch(`${API_BASE}/me`, { credentials: 'include' }).then((r) => r.json()),

  update: (patch: Partial<UserProfile>): Promise<UserProfile> =>
    fetch(`${API_BASE}/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(patch),
    }).then((r) => r.json()),
};
