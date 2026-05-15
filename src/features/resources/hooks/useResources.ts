import { useEffect } from 'react';
import { useResourcesStore } from '../store/useResourcesStore';

export function useResources(params?: { category?: string; q?: string }) {
  const { resources, loading, error, load } = useResourcesStore();

  useEffect(() => {
    load(params);
  }, [params?.category, params?.q, load]);

  return { resources, loading, error };
}
