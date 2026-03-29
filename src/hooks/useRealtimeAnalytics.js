import { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useRealtimeAnalytics(contractorEmail) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await base44.functions.invoke('getContractorAnalytics', {
        contractorEmail
      });
      setAnalytics(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contractorEmail]);

  useEffect(() => {
    if (contractorEmail) {
      fetchAnalytics();
      // Poll every 30 seconds for real-time updates
      const interval = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(interval);
    }
  }, [contractorEmail, fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}