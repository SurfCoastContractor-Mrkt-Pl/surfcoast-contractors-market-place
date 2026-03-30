import { useState, useCallback, useEffect } from 'react';

/**
 * useAsync - Handle async operations with loading/error/success states
 * @param {Function} asyncFunction - Async function to execute
 * @param {Boolean} immediate - Execute immediately on mount
 * @param {Array} dependencies - Dependencies to watch
 */
export function useAsync(asyncFunction, immediate = true, dependencies = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate, ...dependencies]);

  return { loading, error, data, execute };
}