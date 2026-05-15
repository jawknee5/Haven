import { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';

export function useProfile() {
  const { profile, loading, error, load, update } = useProfileStore();

  useEffect(() => {
    if (!profile && !loading && !error) {
      load();
    }
  }, [profile, loading, error, load]);

  return { profile, loading, error, updateProfile: update };
}
