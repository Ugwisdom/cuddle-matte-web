import { useEffect, useState, useCallback } from 'react';

interface UseRefreshDataOptions {
  enabled?: boolean;
  interval?: number;
}

export function useRefreshData<T>(
  fetchFn: () => Promise<T>,
  deps?: React.DependencyList,
  options?: UseRefreshDataOptions
) {
  const { enabled = true, interval = 0 } = options || {};

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, enabled]);

  useEffect(() => {
    refresh();
    
    if (interval > 0) {
      const timer = setInterval(refresh, interval);
      return () => clearInterval(timer);
    }
  }, [refresh, interval, ...(deps || [])]);

  return { data, loading, error, refresh };
}
