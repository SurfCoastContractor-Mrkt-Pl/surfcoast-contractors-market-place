import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * useMobileOptimization Hook
 * Provides utilities for mobile-first Wave FO optimization:
 * - Network detection and retry logic
 * - Lazy loading for images and components
 * - Offline cache persistence
 * - Touch gesture support
 */

export function useMobileOptimization() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [networkQuality, setNetworkQuality] = useState('4g'); // '4g', '3g', '2g', 'slow'
  const [isMobile, setIsMobile] = useState(false);
  const retryQueueRef = useRef([]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processRetryQueue();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detect network quality (4G, 3G, 2G)
  useEffect(() => {
    if (!navigator.connection) return;

    const detectQuality = () => {
      const connection = navigator.connection;
      if (connection.effectiveType) {
        setNetworkQuality(connection.effectiveType);
      }
    };

    detectQuality();
    navigator.connection.addEventListener('change', detectQuality);
    return () => navigator.connection.removeEventListener('change', detectQuality);
  }, []);

  // Add to retry queue (for failed requests)
  const addToRetryQueue = useCallback((fn, maxRetries = 3) => {
    retryQueueRef.current.push({ fn, retries: 0, maxRetries });
  }, []);

  // Process retry queue when connection restored
  const processRetryQueue = useCallback(async () => {
    const queue = retryQueueRef.current;
    for (const item of queue) {
      try {
        await item.fn();
        queue.splice(queue.indexOf(item), 1);
      } catch (error) {
        item.retries++;
        if (item.retries >= item.maxRetries) {
          queue.splice(queue.indexOf(item), 1);
        }
      }
    }
  }, []);

  return {
    isOnline,
    networkQuality,
    isMobile,
    addToRetryQueue,
    isSlowNetwork: networkQuality === '3g' || networkQuality === '2g',
    retryQueueLength: retryQueueRef.current.length
  };
}

/**
 * useLazyImage Hook
 * Lazy load images for better mobile performance
 */
export function useLazyImage(src, placeholder) {
  const [imageSrc, setImageSrc] = useState(placeholder || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E');
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = new Image();
          setIsLoading(true);
          img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
            observer.unobserve(entry.target);
          };
          img.onerror = () => {
            setIsLoading(false);
            observer.unobserve(entry.target);
          };
          img.src = src;
        }
      },
      { rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [src]);

  return { imageSrc, isLoading, ref };
}

/**
 * useTouchGestures Hook
 * Support long-press and swipe gestures on mobile
 */
export function useTouchGestures(ref, { onLongPress, onSwipeLeft, onSwipeRight } = {}) {
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const longPressTimeoutRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartTimeRef.current = Date.now();

    if (onLongPress) {
      longPressTimeoutRef.current = setTimeout(() => {
        onLongPress(e);
      }, 500);
    }
  }, [onLongPress]);

  const handleTouchMove = useCallback((e) => {
    // Cancel long press on move
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    const timeDelta = Date.now() - touchStartTimeRef.current;

    // Swipe detection
    if (timeDelta < 300 && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && onSwipeLeft) {
        onSwipeLeft(e);
      } else if (deltaX < 0 && onSwipeRight) {
        onSwipeRight(e);
      }
    }

    // Clear long press timeout
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, ref]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}

/**
 * useLocalCache Hook
 * Persist data to localStorage with expiration
 */
export function useLocalCache(key, ttlMinutes = 60) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const get = useCallback(() => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const { value, expiresAt } = JSON.parse(stored);
      if (Date.now() > expiresAt) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      console.error(`Cache read error for ${key}:`, error);
      return null;
    }
  }, [key]);

  const set = useCallback((value) => {
    try {
      const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
      localStorage.setItem(key, JSON.stringify({ value, expiresAt }));
      setData(value);
    } catch (error) {
      console.error(`Cache write error for ${key}:`, error);
    }
  }, [key, ttlMinutes]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(null);
    } catch (error) {
      console.error(`Cache clear error for ${key}:`, error);
    }
  }, [key]);

  useEffect(() => {
    const cached = get();
    setData(cached);
    setLoading(false);
  }, [get]);

  return { data, loading, set, get, clear };
}