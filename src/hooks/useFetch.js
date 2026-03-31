// Performance-optimized data fetching hook with caching, error handling, and retry logic

import { useState, useEffect, useCallback, useRef } from 'react';

const cache = new Map();

export const useFetch = (key, fetchFn, options = {}) => {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    enabled = true
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const attemptRef = useRef(0);
  const cacheTimerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    while (attemptRef.current < retries) {
      try {
        const result = await fetchFn();
        
        // Cache result
        cache.set(key, { data: result, timestamp: Date.now() });
        
        // Clear old cache after cacheTime
        if (cacheTimerRef.current) clearTimeout(cacheTimerRef.current);
        cacheTimerRef.current = setTimeout(() => {
          cache.delete(key);
        }, cacheTime);

        setData(result);
        setLoading(false);
        attemptRef.current = 0;
        return;
      } catch (err) {
        attemptRef.current++;
        if (attemptRef.current >= retries) {
          setError(err);
          setLoading(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * attemptRef.current));
      }
    }
  }, [key, fetchFn, cacheTime, retries, retryDelay, enabled]);

  useEffect(() => {
    fetchData();
    return () => {
      if (cacheTimerRef.current) clearTimeout(cacheTimerRef.current);
    };
  }, [key, enabled]);

  const refetch = useCallback(() => {
    cache.delete(key);
    attemptRef.current = 0;
    fetchData();
  }, [key, fetchData]);

  return { data, loading, error, refetch };
};