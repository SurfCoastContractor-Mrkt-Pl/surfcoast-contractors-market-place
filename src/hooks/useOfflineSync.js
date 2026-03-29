import { useState, useCallback, useRef, useEffect } from 'react';

const QUEUE_KEY = 'offline_sync_queue';

export function useOfflineSync() {
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const retryCountRef = useRef({});

  // Load queue from localStorage on init
  useEffect(() => {
    const stored = localStorage.getItem(QUEUE_KEY);
    if (stored) {
      setQueue(JSON.parse(stored));
    }
  }, []);

  // Persist queue to localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  const addToQueue = useCallback((action, data) => {
    const item = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    setQueue(prev => [...prev, item]);
    return item.id;
  }, []);

  const syncQueue = useCallback(async (syncFn) => {
    if (queue.length === 0 || syncing) return;
    
    setSyncing(true);
    const failed = [];

    for (const item of queue) {
      try {
        await syncFn(item);
        retryCountRef.current[item.id] = 0;
      } catch (error) {
        item.retries = (item.retries || 0) + 1;
        if (item.retries < 3) {
          failed.push(item);
        }
      }
    }

    setQueue(failed);
    setLastSyncTime(new Date().toISOString());
    setSyncing(false);
  }, [queue, syncing]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(QUEUE_KEY);
  }, []);

  return { queue, syncing, lastSyncTime, addToQueue, syncQueue, clearQueue };
}