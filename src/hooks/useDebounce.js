import { useState, useEffect } from 'react';

/**
 * useDebounce - Debounce a value
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in ms (default: 300)
 * @returns {*} - Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}