import { useEffect, useState, useCallback } from 'react';

const DB_NAME = 'surfcoast_fieldops';
const STORE_NAMES = {
  jobs: 'scopes_of_work',
  availability: 'availability_slots',
  metadata: 'metadata'
};

export const useOfflineCache = () => {
  const [db, setDb] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (e) => {
          const database = e.target.result;
          if (!database.objectStoreNames.contains(STORE_NAMES.jobs)) {
            database.createObjectStore(STORE_NAMES.jobs, { keyPath: 'id' });
          }
          if (!database.objectStoreNames.contains(STORE_NAMES.availability)) {
            database.createObjectStore(STORE_NAMES.availability, { keyPath: 'id' });
          }
          if (!database.objectStoreNames.contains(STORE_NAMES.metadata)) {
            database.createObjectStore(STORE_NAMES.metadata, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => {
          setDb(request.result);
          setIsInitialized(true);
        };

        request.onerror = () => {
          console.warn('IndexedDB not available');
          setIsInitialized(true);
        };
      } catch (error) {
        console.warn('Failed to initialize IndexedDB:', error);
        setIsInitialized(true);
      }
    };

    initDB();
  }, []);

  const saveData = useCallback(async (storeName, data) => {
    if (!db) return;
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else {
        store.put(data);
      }
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
    } catch (error) {
      console.warn(`Failed to cache ${storeName}:`, error);
    }
  }, [db]);

  const getData = useCallback(async (storeName, key) => {
    if (!db) return null;
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      return new Promise((resolve, reject) => {
        const request = key ? store.get(key) : store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn(`Failed to retrieve ${storeName}:`, error);
      return null;
    }
  }, [db]);

  const clearStore = useCallback(async (storeName) => {
    if (!db) return;
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
    } catch (error) {
      console.warn(`Failed to clear ${storeName}:`, error);
    }
  }, [db]);

  return {
    isInitialized,
    saveData,
    getData,
    clearStore,
    STORE_NAMES
  };
};