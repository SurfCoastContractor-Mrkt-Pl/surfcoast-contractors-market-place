import { useState, useCallback, useRef } from 'react';

export function useUploadQueue(maxConcurrent = 3) {
  const [queue, setQueue] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const queueRef = useRef([]);
  const activeRef = useRef(0);

  const processQueue = useCallback(async () => {
    while (activeRef.current < maxConcurrent && queueRef.current.length > 0) {
      const item = queueRef.current.shift();
      activeRef.current++;
      setActiveCount(activeRef.current);

      try {
        await item.uploadFn();
        item.onSuccess?.();
      } catch (error) {
        item.onError?.(error);
        // Retry up to 2 times
        if ((item.retryCount || 0) < 2) {
          item.retryCount = (item.retryCount || 0) + 1;
          queueRef.current.unshift(item);
        }
      } finally {
        activeRef.current--;
        setActiveCount(activeRef.current);
      }
    }
  }, [maxConcurrent]);

  const addToQueue = useCallback((uploadFn, onSuccess, onError) => {
    const item = { uploadFn, onSuccess, onError, retryCount: 0 };
    queueRef.current.push(item);
    setQueue([...queueRef.current]);
    processQueue();
  }, [processQueue]);

  const cancelQueue = useCallback(() => {
    queueRef.current = [];
    setQueue([]);
    activeRef.current = 0;
    setActiveCount(0);
  }, []);

  return { queue, activeCount, addToQueue, cancelQueue };
}