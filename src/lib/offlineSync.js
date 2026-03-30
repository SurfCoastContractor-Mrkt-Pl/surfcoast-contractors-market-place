import { base44 } from '@/api/base44Client';

/**
 * Offline sync and local caching
 */

const STORAGE_PREFIX = 'surfcoast_cache_';
const SYNC_QUEUE_KEY = 'surfcoast_sync_queue_';

export const offlineSync = {
  /**
   * Cache entity data locally
   */
  cacheEntity: async (entityName, data, ttlMs = 3600000) => {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(
      `${STORAGE_PREFIX}${entityName}`,
      JSON.stringify(cacheData)
    );
  },

  /**
   * Get cached entity data
   */
  getCachedEntity: (entityName) => {
    const cached = localStorage.getItem(`${STORAGE_PREFIX}${entityName}`);
    if (!cached) return null;

    const { data, timestamp, ttl } = JSON.parse(cached);

    // Check if expired
    if (Date.now() - timestamp > ttl) {
      localStorage.removeItem(`${STORAGE_PREFIX}${entityName}`);
      return null;
    }

    return data;
  },

  /**
   * Queue action for offline (sync when online)
   */
  queueOfflineAction: (action) => {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      ...action,
      queuedAt: Date.now(),
      id: Math.random().toString(36),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  /**
   * Get offline queue
   */
  getOfflineQueue: () => {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  },

  /**
   * Process offline queue when online
   */
  async syncOfflineQueue() {
    if (!navigator.onLine) return { synced: 0, failed: 0 };

    const queue = this.getOfflineQueue();
    const results = { synced: 0, failed: 0, errors: [] };

    for (const action of queue) {
      try {
        const { entityName, type, data, id: actionId } = action;

        if (type === 'create') {
          await base44.entities[entityName].create(data);
        } else if (type === 'update') {
          await base44.entities[entityName].update(data.id, data);
        } else if (type === 'delete') {
          await base44.entities[entityName].delete(data.id);
        }

        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({ action, error: error.message });
      }
    }

    // Clear queue if all synced
    if (results.failed === 0) {
      localStorage.removeItem(SYNC_QUEUE_KEY);
    }

    return results;
  },

  /**
   * Listen for online/offline changes
   */
  setupSyncListener: (onSync) => {
    window.addEventListener('online', async () => {
      console.log('📡 Connection restored - syncing offline queue...');
      const results = await offlineSync.syncOfflineQueue();
      onSync?.(results);
    });

    window.addEventListener('offline', () => {
      console.log('📴 No connection - queuing actions...');
    });
  },

  /**
   * Clear all cache
   */
  clearCache: () => {
    const keys = Object.keys(localStorage);
    keys
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};