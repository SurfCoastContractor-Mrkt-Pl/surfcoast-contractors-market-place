import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  saveScopsLocally,
  getLocalScopes,
  getPendingChanges,
  markChangeAsSynced,
  savePendingChange,
  getSyncMetadata,
  saveSyncMetadata,
} from '@/lib/offlineStorage';

export const useOfflineSync = (contractorEmail) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending changes count
  useEffect(() => {
    const updatePendingCount = async () => {
      const changes = await getPendingChanges();
      setPendingCount(changes.filter((c) => !c.synced).length);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load scopes from server and cache locally
  const loadAndCacheScopes = useCallback(async () => {
    try {
      const scopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: contractorEmail,
      });
      await saveScopsLocally(scopes);
      return scopes;
    } catch (error) {
      console.error('Error loading scopes:', error);
      // Fall back to local data if offline
      return await getLocalScopes(contractorEmail);
    }
  }, [contractorEmail]);

  // Sync pending changes back to server
  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || !contractorEmail) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const pendingChanges = await getPendingChanges();
      const unsyncedChanges = pendingChanges.filter((c) => !c.synced);

      for (const change of unsyncedChanges) {
        try {
          // Apply the change to the server
          await base44.entities[change.entityType].update(change.entityId, {
            [change.field]: change.newValue,
          });

          // Mark as synced
          await markChangeAsSynced(change.id);
        } catch (error) {
          console.error(`Failed to sync change ${change.id}:`, error);
          setSyncError(`Failed to sync: ${error.message}`);
        }
      }

      // Update last sync time
      const now = new Date().toISOString();
      await saveSyncMetadata('lastSyncTime', now);
      setLastSyncTime(now);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error.message);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, contractorEmail]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncPendingChanges();
    }
  }, [isOnline, pendingCount, syncPendingChanges]);

  // Record a local change
  const recordChange = useCallback(
    async (entityType, entityId, field, newValue, oldValue) => {
      await savePendingChange(entityType, entityId, field, newValue, oldValue);
      setPendingCount((prev) => prev + 1);

      // Try to sync immediately if online
      if (isOnline) {
        setTimeout(syncPendingChanges, 1000);
      }
    },
    [isOnline, syncPendingChanges]
  );

  return {
    isOnline,
    isSyncing,
    syncError,
    pendingCount,
    lastSyncTime,
    loadAndCacheScopes,
    syncPendingChanges,
    recordChange,
  };
};