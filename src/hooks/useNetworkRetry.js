import { useRef, useCallback } from 'react';

export function useNetworkRetry(maxRetries = 3, baseDelay = 1000) {
  const retryCountRef = useRef(0);

  const executeWithRetry = useCallback(async (asyncFn) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          retryCountRef.current = 0;
          throw error;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [maxRetries, baseDelay]);

  const reset = useCallback(() => {
    retryCountRef.current = 0;
  }, []);

  return { executeWithRetry, reset };
}